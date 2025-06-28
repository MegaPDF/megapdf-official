// internal/repository/admin_repository.go
package repository

import (
	"fmt"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AdminRepository struct {
	db *gorm.DB
}

func NewAdminRepository(database *gorm.DB) *AdminRepository {
	return &AdminRepository{
		db: database,
	}
}

// Settings Management
func (r *AdminRepository) GetAllSettings() ([]models.AdminSettings, error) {
	var settings []models.AdminSettings
	err := r.db.Order("category, key").Find(&settings).Error
	return settings, err
}

func (r *AdminRepository) GetSettingsByCategory(category string) ([]models.AdminSettings, error) {
	var settings []models.AdminSettings
	err := r.db.Where("category = ?", category).Order("key").Find(&settings).Error
	return settings, err
}

func (r *AdminRepository) GetSetting(key string) (*models.AdminSettings, error) {
	var setting models.AdminSettings
	err := r.db.Where("`key` = ?", key).First(&setting).Error
	if err != nil {
		return nil, err
	}
	return &setting, nil
}

func (r *AdminRepository) SaveSetting(key, value, category, settingType, description string, isPublic bool) error {
	setting := models.AdminSettings{
		Key:         key,
		Value:       value,
		Category:    category,
		Type:        settingType,
		Description: description,
		IsPublic:    isPublic,
		UpdatedAt:   time.Now(),
	}

	// Check if setting exists
	var existing models.AdminSettings
	err := r.db.Where("`key` = ?", key).First(&existing).Error

	if err == gorm.ErrRecordNotFound {
		// Create new setting
		setting.ID = uuid.New().String()
		setting.CreatedAt = time.Now()
		return r.db.Create(&setting).Error
	} else if err != nil {
		return err
	}

	// Update existing setting
	return r.db.Model(&existing).Updates(setting).Error
}

func (r *AdminRepository) DeleteSetting(key string) error {
	return r.db.Where("`key` = ?", key).Delete(&models.AdminSettings{}).Error
}

// Dashboard Statistics
func (r *AdminRepository) GetSystemStats() (*models.SystemStats, error) {
	stats := &models.SystemStats{}

	// Total users
	r.db.Model(&models.User{}).Count(&stats.TotalUsers)

	// Active users (logged in within last 30 days)
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	r.db.Model(&models.User{}).Where("updated_at > ?", thirtyDaysAgo).Count(&stats.ActiveUsers)

	// Total operations
	r.db.Model(&models.UsageStats{}).Select("COALESCE(SUM(count), 0)").Scan(&stats.TotalOperations)

	// Total revenue
	r.db.Model(&models.Transaction{}).Where("status = ?", "completed").Select("COALESCE(SUM(amount), 0)").Scan(&stats.TotalRevenue)

	// Today's stats
	today := time.Now().Format("2006-01-02")
	r.db.Model(&models.UsageStats{}).Where("DATE(date) = ?", today).Select("COALESCE(SUM(count), 0)").Scan(&stats.OperationsToday)
	r.db.Model(&models.Transaction{}).Where("status = ? AND DATE(created_at) = ?", "completed", today).Select("COALESCE(SUM(amount), 0)").Scan(&stats.RevenueToday)

	// This week's stats
	weekAgo := time.Now().AddDate(0, 0, -7)
	r.db.Model(&models.UsageStats{}).Where("date >= ?", weekAgo).Select("COALESCE(SUM(count), 0)").Scan(&stats.OperationsThisWeek)
	r.db.Model(&models.Transaction{}).Where("status = ? AND created_at >= ?", "completed", weekAgo).Select("COALESCE(SUM(amount), 0)").Scan(&stats.RevenueThisWeek)

	// Top operations
	var operationStats []models.OperationStat
	r.db.Model(&models.UsageStats{}).
		Select("operation, SUM(count) as count, SUM(count) * 0.005 as revenue").
		Group("operation").
		Order("count DESC").
		Limit(5).
		Scan(&operationStats)
	stats.TopOperations = operationStats

	return stats, nil
}

// User Management
func (r *AdminRepository) GetAllUsers(limit, offset int) ([]models.AdminUserView, int64, error) {
	var users []models.AdminUserView
	var total int64

	// Get total count
	r.db.Model(&models.User{}).Count(&total)

	// Get users with additional stats
	query := `
		SELECT 
			u.*,
			COALESCE(SUM(us.count), 0) as total_operations,
			COALESCE(SUM(t.amount), 0) as total_spent
		FROM users u
		LEFT JOIN usage_stats us ON u.id = us.user_id
		LEFT JOIN transactions t ON u.id = t.user_id AND t.status = 'completed'
		GROUP BY u.id
		ORDER BY u.created_at DESC
		LIMIT ? OFFSET ?
	`

	err := r.db.Raw(query, limit, offset).Scan(&users).Error
	return users, total, err
}

func (r *AdminRepository) GetUserById(userID string) (*models.AdminUserView, error) {
	var user models.AdminUserView

	query := `
		SELECT 
			u.*,
			COALESCE(SUM(us.count), 0) as total_operations,
			COALESCE(SUM(t.amount), 0) as total_spent
		FROM users u
		LEFT JOIN usage_stats us ON u.id = us.user_id
		LEFT JOIN transactions t ON u.id = t.user_id AND t.status = 'completed'
		WHERE u.id = ?
		GROUP BY u.id
	`

	err := r.db.Raw(query, userID).Scan(&user).Error
	return &user, err
}

func (r *AdminRepository) UpdateUserBalance(userID string, newBalance float64) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Update("balance", newBalance).Error
}

func (r *AdminRepository) UpdateUserRole(userID string, newRole string) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Update("role", newRole).Error
}

func (r *AdminRepository) DeleteUser(userID string) error {
	// Delete user and all related data (cascading)
	return r.db.Delete(&models.User{}, "id = ?", userID).Error
}

// Recent Activity
func (r *AdminRepository) GetRecentActivity(limit int) ([]models.RecentActivity, error) {
	var activities []models.RecentActivity

	query := `
		SELECT 
			us.id,
			us.user_id,
			u.name as user_name,
			u.email as user_email,
			us.operation,
			'completed' as status,
			0 as amount,
			'' as error_msg,
			us.date as created_at
		FROM usage_stats us
		JOIN users u ON us.user_id = u.id
		UNION ALL
		SELECT 
			t.id,
			t.user_id,
			u.name as user_name,
			u.email as user_email,
			'deposit' as operation,
			t.status,
			t.amount,
			'' as error_msg,
			t.created_at
		FROM transactions t
		JOIN users u ON t.user_id = u.id
		ORDER BY created_at DESC
		LIMIT ?
	`

	err := r.db.Raw(query, limit).Scan(&activities).Error
	return activities, err
}

// System Health
func (r *AdminRepository) GetSystemHealth() (*models.SystemHealth, error) {
	health := &models.SystemHealth{
		DatabaseStatus:  "healthy",
		APIResponseTime: 50.0, // This would come from metrics
		DiskUsage:       45.2, // This would come from system info
		MemoryUsage:     62.1, // This would come from system info
		ErrorRate:       0.5,  // This would come from error tracking
	}

	// Test database connection
	sqlDB, err := r.db.DB()
	if err != nil {
		health.DatabaseStatus = "error"
		return health, nil
	}

	if err := sqlDB.Ping(); err != nil {
		health.DatabaseStatus = "error"
	}

	return health, nil
}

// Initialize default admin settings
func (r *AdminRepository) InitializeDefaultSettings() error {
	defaultSettings := []models.AdminSettings{
		{
			ID:          uuid.New().String(),
			Key:         "app_name",
			Value:       "MegaPDF",
			Category:    "general",
			Type:        "string",
			Description: "Application name",
			IsPublic:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          uuid.New().String(),
			Key:         "app_description",
			Value:       "Professional PDF Processing Service",
			Category:    "general",
			Type:        "string",
			Description: "Application description",
			IsPublic:    true,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          uuid.New().String(),
			Key:         "maintenance_mode",
			Value:       "false",
			Category:    "general",
			Type:        "boolean",
			Description: "Enable maintenance mode",
			IsPublic:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          uuid.New().String(),
			Key:         "registration_enabled",
			Value:       "true",
			Category:    "general",
			Type:        "boolean",
			Description: "Allow new user registration",
			IsPublic:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          uuid.New().String(),
			Key:         "max_file_size",
			Value:       "104857600",
			Category:    "limits",
			Type:        "number",
			Description: "Maximum file size in bytes (100MB)",
			IsPublic:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		{
			ID:          uuid.New().String(),
			Key:         "rate_limit_requests",
			Value:       "100",
			Category:    "limits",
			Type:        "number",
			Description: "Rate limit requests per minute",
			IsPublic:    false,
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	for _, setting := range defaultSettings {
		// Check if setting already exists
		var existing models.AdminSettings
		err := r.db.Where("`key` = ?", setting.Key).First(&existing).Error

		if err == gorm.ErrRecordNotFound {
			// Create new setting
			if err := r.db.Create(&setting).Error; err != nil {
				return fmt.Errorf("failed to create setting %s: %w", setting.Key, err)
			}
		}
	}

	return nil
}
