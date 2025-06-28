// internal/services/admin_service.go
package services

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/MegaPDF/megapdf-official/api/internal/repository"
	"gorm.io/gorm"
)

type AdminService struct {
	adminRepo    *repository.AdminRepository
	pricingRepo  *repository.PricingRepository
	pdfToolsRepo *repository.PDFToolsRepository
	config       *config.Config
}

func NewAdminService(cfg *config.Config, db *gorm.DB) *AdminService {
	return &AdminService{
		adminRepo:    repository.NewAdminRepository(db),
		pricingRepo:  repository.NewPricingRepository(),
		pdfToolsRepo: repository.NewPDFToolsRepository(),
		config:       cfg,
	}
}

// Dashboard Methods
func (s *AdminService) GetDashboardData() (*models.AdminDashboardData, error) {
	// Get system stats
	stats, err := s.adminRepo.GetSystemStats()
	if err != nil {
		return nil, fmt.Errorf("failed to get system stats: %w", err)
	}

	// Get recent activity
	activity, err := s.adminRepo.GetRecentActivity(10)
	if err != nil {
		return nil, fmt.Errorf("failed to get recent activity: %w", err)
	}

	// Get system health
	health, err := s.adminRepo.GetSystemHealth()
	if err != nil {
		return nil, fmt.Errorf("failed to get system health: %w", err)
	}

	return &models.AdminDashboardData{
		Stats:          *stats,
		RecentActivity: activity,
		ActiveUsers:    stats.ActiveUsers,
		SystemHealth:   *health,
	}, nil
}

// Settings Methods
func (s *AdminService) GetAllSettings() ([]models.AdminSettingsGroup, error) {
	settings, err := s.adminRepo.GetAllSettings()
	if err != nil {
		return nil, err
	}

	// Group settings by category
	groups := make(map[string][]models.AdminSettings)
	for _, setting := range settings {
		groups[setting.Category] = append(groups[setting.Category], setting)
	}

	var result []models.AdminSettingsGroup
	for category, categorySettings := range groups {
		result = append(result, models.AdminSettingsGroup{
			Category: category,
			Settings: categorySettings,
		})
	}

	return result, nil
}

func (s *AdminService) GetSettingsByCategory(category string) ([]models.AdminSettings, error) {
	return s.adminRepo.GetSettingsByCategory(category)
}

func (s *AdminService) UpdateSettings(updates []models.AdminSettingsItem) error {
	for _, update := range updates {
		// Convert value to string based on type
		var valueStr string
		switch v := update.Value.(type) {
		case string:
			valueStr = v
		case bool:
			valueStr = strconv.FormatBool(v)
		case float64:
			valueStr = strconv.FormatFloat(v, 'f', -1, 64)
		case int:
			valueStr = strconv.Itoa(v)
		default:
			// For complex types, marshal to JSON
			jsonBytes, err := json.Marshal(v)
			if err != nil {
				return fmt.Errorf("failed to marshal value for key %s: %w", update.Key, err)
			}
			valueStr = string(jsonBytes)
		}

		// Determine category and type based on key
		category, settingType := s.categorizeSettingKey(update.Key)

		// Save setting
		err := s.adminRepo.SaveSetting(
			update.Key,
			valueStr,
			category,
			settingType,
			s.getSettingDescription(update.Key),
			s.isPublicSetting(update.Key),
		)
		if err != nil {
			return fmt.Errorf("failed to save setting %s: %w", update.Key, err)
		}
	}

	return nil
}

func (s *AdminService) GetAppConfig() (*models.AppConfig, error) {
	config := &models.AppConfig{
		SiteName:                 s.config.SiteName,
		SiteDescription:          s.config.SiteDescription,
		AppURL:                   s.config.AppURL,
		APIURL:                   s.config.APIUrl,
		MaintenanceMode:          s.config.MaintenanceMode,
		RegistrationEnabled:      s.config.RegistrationEnabled,
		RequireEmailVerification: s.config.RequireEmailVerification,
		MaxFileSize:              s.config.MaxFileSize,
		RateLimitRequests:        s.config.RateLimitRequests,
		SessionTimeout:           s.config.SessionTimeout,
		CORSAllowedOrigins:       s.config.CORSAllowedOrigins,
	}

	return config, nil
}

func (s *AdminService) GetPayPalConfig() (*models.PayPalConfig, error) {
	return &models.PayPalConfig{
		ClientID:     s.config.PayPalClientID,
		ClientSecret: s.maskSecret(s.config.PayPalClientSecret),
		APIBase:      s.config.PayPalAPIBase,
		Enabled:      s.config.PayPalClientID != "" && s.config.PayPalClientSecret != "",
	}, nil
}

func (s *AdminService) GetSMTPConfig() (*models.SMTPConfig, error) {
	return &models.SMTPConfig{
		Host:      s.config.SMTPHost,
		Port:      s.config.SMTPPort,
		User:      s.config.SMTPUser,
		Password:  s.maskSecret(s.config.SMTPPass),
		Secure:    s.config.SMTPSecure,
		FromName:  s.config.EmailFromName,
		FromEmail: s.config.EmailFrom,
	}, nil
}

func (s *AdminService) GetSecurityConfig() (*models.SecurityConfig, error) {
	return &models.SecurityConfig{
		JWTSecret:                s.maskSecret(s.config.JWTSecret),
		PasswordMinLength:        s.config.PasswordMinLength,
		PasswordRequireUppercase: s.config.PasswordRequireUppercase,
		PasswordRequireNumbers:   s.config.PasswordRequireNumbers,
		PasswordRequireSymbols:   s.config.PasswordRequireSymbols,
		MaxLoginAttempts:         s.config.MaxLoginAttempts,
	}, nil
}

// User Management Methods
func (s *AdminService) GetAllUsers(page, limit int) ([]models.AdminUserView, int64, error) {
	offset := (page - 1) * limit
	return s.adminRepo.GetAllUsers(limit, offset)
}

func (s *AdminService) GetUser(userID string) (*models.AdminUserView, error) {
	return s.adminRepo.GetUserById(userID)
}

func (s *AdminService) UpdateUserBalance(userID string, newBalance float64) error {
	return s.adminRepo.UpdateUserBalance(userID, newBalance)
}

func (s *AdminService) UpdateUserRole(userID string, newRole string) error {
	validRoles := []string{"user", "admin", "moderator"}
	for _, role := range validRoles {
		if role == newRole {
			return s.adminRepo.UpdateUserRole(userID, newRole)
		}
	}
	return fmt.Errorf("invalid role: %s", newRole)
}

func (s *AdminService) DeleteUser(userID string) error {
	return s.adminRepo.DeleteUser(userID)
}

// PDF Tools Management
func (s *AdminService) GetPDFTools() ([]models.ToolStatus, error) {
	return s.pdfToolsRepo.GetAllTools()
}

func (s *AdminService) UpdateToolStatus(toolID string, enabled bool) error {
	return s.pdfToolsRepo.UpdateToolStatus(toolID, enabled)
}

func (s *AdminService) EnableAllTools() error {
	return s.pdfToolsRepo.EnableAllTools()
}

func (s *AdminService) DisableAllTools() error {
	return s.pdfToolsRepo.DisableAllTools()
}

// Pricing Management
func (s *AdminService) GetPricingSettings() (*models.CustomPricing, error) {
	return s.pricingRepo.GetPricingSettings()
}

func (s *AdminService) UpdatePricingSettings(pricing *models.CustomPricing) error {
	return s.pricingRepo.SavePricingSettings(pricing)
}

// Helper Methods
func (s *AdminService) categorizeSettingKey(key string) (category string, settingType string) {
	switch {
	case strings.HasPrefix(key, "app_") || strings.Contains(key, "site_"):
		return "general", "string"
	case strings.HasPrefix(key, "smtp_") || strings.Contains(key, "email"):
		return "email", "string"
	case strings.HasPrefix(key, "paypal_"):
		return "payment", "string"
	case strings.Contains(key, "password") || strings.Contains(key, "jwt") || strings.Contains(key, "auth"):
		return "security", "string"
	case strings.Contains(key, "limit") || strings.Contains(key, "max") || strings.Contains(key, "timeout"):
		return "limits", "number"
	case strings.Contains(key, "enabled") || strings.Contains(key, "require") || key == "maintenance_mode":
		return "general", "boolean"
	default:
		return "general", "string"
	}
}

func (s *AdminService) getSettingDescription(key string) string {
	descriptions := map[string]string{
		"app_name":                   "Application name displayed to users",
		"app_description":            "Application description for SEO and branding",
		"maintenance_mode":           "Enable maintenance mode to disable user access",
		"registration_enabled":       "Allow new users to register accounts",
		"require_email_verification": "Require email verification for new accounts",
		"max_file_size":              "Maximum file size allowed for uploads (bytes)",
		"rate_limit_requests":        "Maximum requests per minute per IP",
		"session_timeout":            "User session timeout in seconds",
		"paypal_client_id":           "PayPal API Client ID",
		"paypal_client_secret":       "PayPal API Client Secret",
		"smtp_host":                  "SMTP server hostname",
		"smtp_port":                  "SMTP server port",
		"smtp_user":                  "SMTP username",
		"smtp_pass":                  "SMTP password",
		"jwt_secret":                 "JWT signing secret key",
	}

	if desc, exists := descriptions[key]; exists {
		return desc
	}
	return fmt.Sprintf("Setting: %s", key)
}

func (s *AdminService) isPublicSetting(key string) bool {
	publicSettings := []string{
		"app_name",
		"app_description",
		"registration_enabled",
		"require_email_verification",
		"max_file_size",
	}

	for _, public := range publicSettings {
		if public == key {
			return true
		}
	}
	return false
}

func (s *AdminService) maskSecret(secret string) string {
	if secret == "" {
		return "[not set]"
	}
	if len(secret) <= 8 {
		return "********"
	}
	return secret[:4] + "********" + secret[len(secret)-4:]
}
