// internal/repository/config_repository.go
package repository

import (
	"fmt"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
)

// ConfigRepository handles loading and saving configuration from the database
type ConfigRepository struct {
	settingsRepo *SettingsRepository
}

// NewConfigRepository creates a new config repository
func NewConfigRepository() *ConfigRepository {
	return &ConfigRepository{
		settingsRepo: NewSettingsRepository(),
	}
}

// LoadConfig loads all configuration from the database
func (r *ConfigRepository) LoadConfig() (config.Config, error) {
	// Start with default configuration
	config := &config.Config{
		Port:                     8080,
		JWTSecret:                "default-jwt-secret",
		TempDir:                  "temp",
		UploadDir:                "uploads",
		PublicDir:                "public",
		PayPalAPIBase:            "https://api-m.sandbox.paypal.com",
		SMTPPort:                 587,
		EmailFrom:                "noreply@mega-pdf.com",
		AppURL:                   "http://localhost:3000",
		APIUrl:                   "http://localhost:8080",
		Debug:                    false,
		OAuthRedirectURL:         "http://localhost:8080/api/auth/google/callback",
		RateLimitRequests:        100,
		PasswordMinLength:        8,
		PasswordRequireUppercase: true,
		PasswordRequireNumbers:   true,
		PasswordRequireSymbols:   false,
		SessionTimeout:           24,
		MaxLoginAttempts:         5,
	}

	// Load settings from database
	generalSettings, _ := r.settingsRepo.GetSettingsByCategory("general")
	securitySettings, _ := r.settingsRepo.GetSettingsByCategory("security")
	emailSettings, _ := r.settingsRepo.GetSettingsByCategory("email")
	paymentSettings, _ := r.settingsRepo.GetSettingsByCategory("payment")
	apiSettings, _ := r.settingsRepo.GetSettingsByCategory("api")
	oauthSettings, _ := r.settingsRepo.GetSettingsByCategory("oauth")

	// Apply general settings
	if generalSettings != nil {
		if v, ok := generalSettings["siteName"].(string); ok {
			config.SiteName = v
		}
		if v, ok := generalSettings["siteDescription"].(string); ok {
			config.SiteDescription = v
		}
		if v, ok := generalSettings["maintenanceMode"].(bool); ok {
			config.MaintenanceMode = v
		}
		if v, ok := generalSettings["registrationEnabled"].(bool); ok {
			config.RegistrationEnabled = v
		}
		if v, ok := generalSettings["requireEmailVerification"].(bool); ok {
			config.RequireEmailVerification = v
		}
		if v, ok := generalSettings["appUrl"].(string); ok {
			config.AppURL = v
		}
		if v, ok := generalSettings["apiUrl"].(string); ok {
			config.APIUrl = v
		}
		if v, ok := generalSettings["debug"].(bool); ok {
			config.Debug = v
		}
		if v, ok := generalSettings["port"].(float64); ok {
			config.Port = int(v)
		}
	}

	// Apply security settings
	if securitySettings != nil {
		if v, ok := securitySettings["jwtSecret"].(string); ok && v != "" {
			config.JWTSecret = v
		}
		if v, ok := securitySettings["passwordMinLength"].(float64); ok {
			config.PasswordMinLength = int(v)
		}
		if v, ok := securitySettings["passwordRequireUppercase"].(bool); ok {
			config.PasswordRequireUppercase = v
		}
		if v, ok := securitySettings["passwordRequireNumbers"].(bool); ok {
			config.PasswordRequireNumbers = v
		}
		if v, ok := securitySettings["passwordRequireSymbols"].(bool); ok {
			config.PasswordRequireSymbols = v
		}
		if v, ok := securitySettings["sessionTimeout"].(float64); ok {
			config.SessionTimeout = int(v)
		}
		if v, ok := securitySettings["maxLoginAttempts"].(float64); ok {
			config.MaxLoginAttempts = int(v)
		}
	}

	// Apply email settings
	if emailSettings != nil {
		if v, ok := emailSettings["emailProvider"].(string); ok {
			config.EmailProvider = v
		}
		if v, ok := emailSettings["fromEmail"].(string); ok {
			config.EmailFrom = v
		}
		if v, ok := emailSettings["fromName"].(string); ok {
			config.EmailFromName = v
		}
		if v, ok := emailSettings["smtpHost"].(string); ok {
			config.SMTPHost = v
		}
		if v, ok := emailSettings["smtpPort"].(float64); ok {
			config.SMTPPort = int(v)
		}
		if v, ok := emailSettings["smtpUser"].(string); ok {
			config.SMTPUser = v
		}
		if v, ok := emailSettings["smtpPassword"].(string); ok {
			config.SMTPPass = v
		}
		if v, ok := emailSettings["smtpSecure"].(bool); ok {
			config.SMTPSecure = v
		}
		if v, ok := emailSettings["contactRecipient"].(string); ok {
			config.ContactRecipient = v
		}
	}

	// Apply payment settings
	if paymentSettings != nil {
		if v, ok := paymentSettings["paypalClientId"].(string); ok {
			config.PayPalClientID = v
		}
		if v, ok := paymentSettings["paypalClientSecret"].(string); ok {
			config.PayPalClientSecret = v
		}
		if v, ok := paymentSettings["paypalApiBase"].(string); ok {
			config.PayPalAPIBase = v
		}
	}

	// Apply API settings
	if apiSettings != nil {
		if v, ok := apiSettings["defaultRateLimit"].(float64); ok {
			config.RateLimitRequests = int(v)
		}
		if v, ok := apiSettings["maxFileSize"].(float64); ok {
			config.MaxFileSize = int64(v) * 1024 * 1024 // Convert MB to bytes
		}
		if v, ok := apiSettings["apiTimeout"].(float64); ok {
			config.APITimeout = int(v)
		}
		if v, ok := apiSettings["loggingEnabled"].(bool); ok {
			config.LoggingEnabled = v
		}
		if v, ok := apiSettings["logLevel"].(string); ok {
			config.LogLevel = v
		}
	}

	// Apply database settings

	// Apply OAuth settings
	if oauthSettings != nil {
		if v, ok := oauthSettings["googleClientId"].(string); ok {
			config.GoogleClientID = v
		}
		if v, ok := oauthSettings["googleClientSecret"].(string); ok {
			config.GoogleClientSecret = v
		}
		if v, ok := oauthSettings["oauthRedirectUrl"].(string); ok {
			config.OAuthRedirectURL = v
		}
	}

	return *config, nil
}

// SaveConfig saves configuration to the database
func (r *ConfigRepository) SaveConfig(config *config.Config) error {
	// Save general settings
	generalSettings := map[string]interface{}{
		"siteName":                 config.SiteName,
		"siteDescription":          config.SiteDescription,
		"maintenanceMode":          config.MaintenanceMode,
		"registrationEnabled":      config.RegistrationEnabled,
		"requireEmailVerification": config.RequireEmailVerification,
		"appUrl":                   config.AppURL,
		"apiUrl":                   config.APIUrl,
		"debug":                    config.Debug,
		"port":                     config.Port,
	}
	if err := r.settingsRepo.SaveSettings("general", generalSettings, "General application settings"); err != nil {
		return err
	}

	// Save security settings
	dbSettings := map[string]interface{}{
		"dbPath": config.DBPath, // Add this field to Config struct
	}
	if err := r.settingsRepo.SaveSettings("database", dbSettings, "Database settings"); err != nil {
		return err
	}

	// Save email settings
	emailSettings := map[string]interface{}{
		"emailProvider":    config.EmailProvider,
		"fromEmail":        config.EmailFrom,
		"fromName":         config.EmailFromName,
		"smtpHost":         config.SMTPHost,
		"smtpPort":         config.SMTPPort,
		"smtpUser":         config.SMTPUser,
		"smtpPassword":     config.SMTPPass,
		"smtpSecure":       config.SMTPSecure,
		"contactRecipient": config.ContactRecipient,
	}
	if err := r.settingsRepo.SaveSettings("email", emailSettings, "Email settings"); err != nil {
		return err
	}

	// Save payment settings
	paymentSettings := map[string]interface{}{
		"paypalClientId":     config.PayPalClientID,
		"paypalClientSecret": config.PayPalClientSecret,
		"paypalApiBase":      config.PayPalAPIBase,
	}
	if err := r.settingsRepo.SaveSettings("payment", paymentSettings, "Payment settings"); err != nil {
		return err
	}

	// Save API settings
	apiSettings := map[string]interface{}{
		"defaultRateLimit": config.RateLimitRequests,
		"maxFileSize":      config.MaxFileSize / (1024 * 1024), // Convert bytes to MB
		"apiTimeout":       config.APITimeout,
		"loggingEnabled":   config.LoggingEnabled,
		"logLevel":         config.LogLevel,
	}
	if err := r.settingsRepo.SaveSettings("api", apiSettings, "API settings"); err != nil {
		return err
	}

	// Save database settings

	if err := r.settingsRepo.SaveSettings("database", dbSettings, "Database settings"); err != nil {
		return err
	}

	// Save OAuth settings
	oauthSettings := map[string]interface{}{
		"googleClientId":     config.GoogleClientID,
		"googleClientSecret": config.GoogleClientSecret,
		"oauthRedirectUrl":   config.OAuthRedirectURL,
	}
	if err := r.settingsRepo.SaveSettings("oauth", oauthSettings, "OAuth settings"); err != nil {
		return err
	}

	return nil
}

// InitializeDefaultSettings creates default settings if they don't exist
func (r *ConfigRepository) InitializeDefaultSettings() error {
	if db.DB == nil {
		return fmt.Errorf("database not initialized")
	}

	// Check if settings already exist
	count, err := r.countSettings()
	if err != nil {
		return err
	}

	if count > 0 {
		// Settings already exist, no need to initialize
		return nil
	}

	// Create default config
	config := &config.Config{
		SiteName:                 "MegaPDF",
		SiteDescription:          "Professional PDF tools and API services",
		MaintenanceMode:          false,
		RegistrationEnabled:      true,
		RequireEmailVerification: true,
		Port:                     8080,
		JWTSecret:                "please-change-this-secret-in-production",
		TempDir:                  "temp",
		UploadDir:                "uploads",
		PublicDir:                "public",
		PayPalAPIBase:            "https://api-m.sandbox.paypal.com",
		EmailProvider:            "smtp",
		EmailFrom:                "noreply@mega-pdf.com",
		EmailFromName:            "MegaPDF",
		SMTPPort:                 587,
		SMTPSecure:               false,
		AppURL:                   "http://localhost:3000",
		APIUrl:                   "http://localhost:8080",
		Debug:                    false,
		OAuthRedirectURL:         "http://localhost:8080/api/auth/google/callback",
	
		RateLimitRequests:        100,
		APITimeout:               30,
		LoggingEnabled:           true,
		LogLevel:                 "info",
		MaxFileSize:              50 * 1024 * 1024, // 50 MB
		PasswordMinLength:        8,
		PasswordRequireUppercase: true,
		PasswordRequireNumbers:   true,
		PasswordRequireSymbols:   false,
		SessionTimeout:           24,
		MaxLoginAttempts:         5,
	}

	// Save default config to database
	return r.SaveConfig(config)
}

// countSettings counts the number of settings records in the database
func (r *ConfigRepository) countSettings() (int64, error) {
	var count int64
	err := db.DB.Model(&models.Setting{}).Count(&count).Error
	return count, err
}
