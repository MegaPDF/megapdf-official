package db

import (
	"fmt"
	"os"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// InitializeSettings creates default application settings
func InitializeSettings(db *gorm.DB) error {
	// Auto-migrate settings tables
	if err := db.AutoMigrate(&models.AppSetting{}, &models.SettingHistory{}); err != nil {
		return fmt.Errorf("failed to migrate settings tables: %w", err)
	}

	// Check if settings already exist
	var count int64
	if err := db.Model(&models.AppSetting{}).Count(&count).Error; err != nil {
		return fmt.Errorf("failed to count existing settings: %w", err)
	}

	if count > 0 {
		fmt.Println("Settings already initialized, skipping default creation")
		return nil
	}

	fmt.Println("Creating default application settings...")
	return createDefaultSettings(db)
}

func createDefaultSettings(db *gorm.DB) error {
	defaultSettings := []*models.AppSetting{
		// Application Settings
		{
			Category:     "application",
			Key:          "app_name",
			Value:        "MegaPDF",
			DefaultValue: "MegaPDF",
			Type:         "string",
			Description:  "Application name displayed to users",
			IsRequired:   true,
			Group:        "general",
			Order:        1,
			Metadata:     "{}",
		},
		{
			Category:     "application",
			Key:          "app_description",
			Value:        "PDF Processing Platform",
			DefaultValue: "PDF Processing Platform",
			Type:         "string",
			Description:  "Application description for meta tags and branding",
			Group:        "general",
			Order:        2,
			Metadata:     "{}",
		},
		{
			Category:     "application",
			Key:          "app_url",
			Value:        "http://localhost:3000",
			DefaultValue: "http://localhost:3000",
			Type:         "string",
			Description:  "Base URL of the frontend application",
			IsRequired:   true,
			Group:        "urls",
			Order:        3,
			Validation:   `{"pattern": "^https?://.*"}`,
			Metadata:     "{}",
		},
		{
			Category:     "application",
			Key:          "api_url",
			Value:        "http://localhost:8080",
			DefaultValue: "http://localhost:8080",
			Type:         "string",
			Description:  "Base URL of the API server",
			IsRequired:   true,
			Group:        "urls",
			Order:        4,
			Validation:   `{"pattern": "^https?://.*"}`,
			Metadata:     "{}",
		},
		{
			Category:     "application",
			Key:          "debug_mode",
			Value:        "false",
			DefaultValue: "false",
			Type:         "bool",
			Description:  "Enable debug mode for development (shows detailed errors)",
			Group:        "debugging",
			Order:        5,
			Metadata:     "{}",
		},
		{
			Category:     "application",
			Key:          "maintenance_mode",
			Value:        "false",
			DefaultValue: "false",
			Type:         "bool",
			Description:  "Enable maintenance mode to disable user access",
			Group:        "general",
			Order:        6,
			Metadata:     "{}",
		},
		{
			Category:     "application",
			Key:          "timezone",
			Value:        "UTC",
			DefaultValue: "UTC",
			Type:         "string",
			Description:  "Default timezone for the application",
			Group:        "general",
			Order:        7,
			Options:      `[{"value":"UTC","label":"UTC"},{"value":"America/New_York","label":"Eastern"},{"value":"America/Chicago","label":"Central"},{"value":"America/Denver","label":"Mountain"},{"value":"America/Los_Angeles","label":"Pacific"},{"value":"Europe/London","label":"London"},{"value":"Europe/Paris","label":"Paris"},{"value":"Asia/Tokyo","label":"Tokyo"}]`,
			Metadata:     "{}",
		},

		// Security Settings
		{
			Category:     "security",
			Key:          "jwt_secret",
			Value:        "your-secret-key-here-change-this-in-production",
			DefaultValue: "your-secret-key-here-change-this-in-production",
			Type:         "string",
			Description:  "JWT signing secret key (must be changed in production)",
			IsRequired:   true,
			IsSecret:     true,
			Group:        "authentication",
			Order:        1,
			Validation:   `{"min_length": 32}`,
			Metadata:     "{}",
		},
		{
			Category:     "security",
			Key:          "password_min_length",
			Value:        "8",
			DefaultValue: "8",
			Type:         "int",
			Description:  "Minimum password length requirement",
			Group:        "password_policy",
			Order:        2,
			Validation:   `{"min": 6, "max": 50}`,
			Metadata:     "{}",
		},
		{
			Category:     "security",
			Key:          "password_require_uppercase",
			Value:        "true",
			DefaultValue: "true",
			Type:         "bool",
			Description:  "Require at least one uppercase letter in passwords",
			Group:        "password_policy",
			Order:        3,
			Metadata:     "{}",
		},
		{
			Category:     "security",
			Key:          "password_require_lowercase",
			Value:        "true",
			DefaultValue: "true",
			Type:         "bool",
			Description:  "Require at least one lowercase letter in passwords",
			Group:        "password_policy",
			Order:        4,
			Metadata:     "{}",
		},
		{
			Category:     "security",
			Key:          "password_require_numbers",
			Value:        "true",
			DefaultValue: "true",
			Type:         "bool",
			Description:  "Require at least one number in passwords",
			Group:        "password_policy",
			Order:        5,
			Metadata:     "{}",
		},
		{
			Category:     "security",
			Key:          "password_require_symbols",
			Value:        "false",
			DefaultValue: "false",
			Type:         "bool",
			Description:  "Require at least one special character in passwords",
			Group:        "password_policy",
			Order:        6,
			Metadata:     "{}",
		},
		{
			Category:     "security",
			Key:          "session_timeout",
			Value:        "3600",
			DefaultValue: "3600",
			Type:         "int",
			Description:  "Session timeout in seconds (3600 = 1 hour)",
			Group:        "authentication",
			Order:        7,
			Validation:   `{"min": 300, "max": 86400}`,
			Metadata:     "{}",
		},
		{
			Category:     "security",
			Key:          "max_login_attempts",
			Value:        "5",
			DefaultValue: "5",
			Type:         "int",
			Description:  "Maximum failed login attempts before account lockout",
			Group:        "authentication",
			Order:        8,
			Validation:   `{"min": 3, "max": 20}`,
			Metadata:     "{}",
		},

		// Email Settings
		{
			Category:     "email",
			Key:          "smtp_host",
			Value:        "",
			DefaultValue: "",
			Type:         "string",
			Description:  "SMTP server hostname (e.g., smtp.gmail.com)",
			Group:        "smtp",
			Order:        1,
			Metadata:     "{}",
		},
		{
			Category:     "email",
			Key:          "smtp_port",
			Value:        "587",
			DefaultValue: "587",
			Type:         "int",
			Description:  "SMTP server port (587 for TLS, 465 for SSL, 25 for unencrypted)",
			Group:        "smtp",
			Order:        2,
			Options:      `[{"value":"25","label":"25 (Unencrypted)"},{"value":"587","label":"587 (TLS)"},{"value":"465","label":"465 (SSL)"}]`,
			Metadata:     "{}",
		},
		{
			Category:     "email",
			Key:          "smtp_user",
			Value:        "",
			DefaultValue: "",
			Type:         "string",
			Description:  "SMTP username (usually your email address)",
			Group:        "smtp",
			Order:        3,
			Metadata:     "{}",
		},
		{
			Category:     "email",
			Key:          "smtp_password",
			Value:        "",
			DefaultValue: "",
			Type:         "string",
			Description:  "SMTP password or app-specific password",
			IsSecret:     true,
			Group:        "smtp",
			Order:        4,
			Metadata:     "{}",
		},
		{
			Category:     "email",
			Key:          "email_from",
			Value:        "noreply@megapdf.com",
			DefaultValue: "noreply@megapdf.com",
			Type:         "string",
			Description:  "Default sender email address",
			Group:        "general",
			Order:        5,
			Validation:   `{"pattern": "^[^@]+@[^@]+\\.[^@]+$"}`,
			Metadata:     "{}",
		},

		// Payment Settings
		{
			Category:     "payment",
			Key:          "paypal_enabled",
			Value:        "false",
			DefaultValue: "false",
			Type:         "bool",
			Description:  "Enable PayPal payment processing",
			Group:        "paypal",
			Order:        1,
			Metadata:     "{}",
		},
		{
			Category:     "payment",
			Key:          "paypal_client_id",
			Value:        "",
			DefaultValue: "",
			Type:         "string",
			Description:  "PayPal client ID for payment processing",
			IsSecret:     true,
			Group:        "paypal",
			Order:        2,
			Metadata:     "{}",
		},
		{
			Category:     "payment",
			Key:          "paypal_client_secret",
			Value:        "",
			DefaultValue: "",
			Type:         "string",
			Description:  "PayPal client secret",
			IsSecret:     true,
			Group:        "paypal",
			Order:        3,
			Metadata:     "{}",
		},

		// OAuth Settings
		{
			Category:     "oauth",
			Key:          "google_enabled",
			Value:        "false",
			DefaultValue: "false",
			Type:         "bool",
			Description:  "Enable Google OAuth login",
			Group:        "google",
			Order:        1,
			Metadata:     "{}",
		},
		{
			Category:     "oauth",
			Key:          "google_client_id",
			Value:        "",
			DefaultValue: "",
			Type:         "string",
			Description:  "Google OAuth client ID",
			IsSecret:     true,
			Group:        "google",
			Order:        2,
			Metadata:     "{}",
		},
		{
			Category:     "oauth",
			Key:          "google_client_secret",
			Value:        "",
			DefaultValue: "",
			Type:         "string",
			Description:  "Google OAuth client secret",
			IsSecret:     true,
			Group:        "google",
			Order:        3,
			Metadata:     "{}",
		},

		// File Settings
		{
			Category:     "files",
			Key:          "max_file_size",
			Value:        "104857600", // 100MB
			DefaultValue: "104857600",
			Type:         "int",
			Description:  "Maximum file upload size in bytes (104857600 = 100MB)",
			Group:        "uploads",
			Order:        1,
			Validation:   `{"min": 1048576, "max": 1073741824}`, // 1MB to 1GB
			Metadata:     "{}",
		},
		{
			Category:     "files",
			Key:          "allowed_file_types",
			Value:        `["pdf","doc","docx","txt","rtf"]`,
			DefaultValue: `["pdf","doc","docx","txt","rtf"]`,
			Type:         "array",
			Description:  "Allowed file types for upload",
			Group:        "uploads",
			Order:        2,
			Metadata:     "{}",
		},
		{
			Category:     "files",
			Key:          "upload_dir",
			Value:        "uploads",
			DefaultValue: "uploads",
			Type:         "string",
			Description:  "Directory for uploaded files (relative to app root)",
			Group:        "storage",
			Order:        3,
			Metadata:     "{}",
		},
		{
			Category:     "files",
			Key:          "temp_dir",
			Value:        "temp",
			DefaultValue: "temp",
			Type:         "string",
			Description:  "Temporary files directory (relative to app root)",
			Group:        "storage",
			Order:        4,
			Metadata:     "{}",
		},

		// API Settings
		{
			Category:     "api",
			Key:          "rate_limit_enabled",
			Value:        "true",
			DefaultValue: "true",
			Type:         "bool",
			Description:  "Enable API rate limiting",
			Group:        "rate_limiting",
			Order:        1,
			Metadata:     "{}",
		},
		{
			Category:     "api",
			Key:          "rate_limit_requests",
			Value:        "100",
			DefaultValue: "100",
			Type:         "int",
			Description:  "API rate limit requests per minute",
			Group:        "rate_limiting",
			Order:        2,
			Validation:   `{"min": 10, "max": 10000}`,
			Metadata:     "{}",
		},
		{
			Category:     "api",
			Key:          "api_timeout",
			Value:        "30",
			DefaultValue: "30",
			Type:         "int",
			Description:  "API request timeout in seconds",
			Group:        "general",
			Order:        3,
			Validation:   `{"min": 5, "max": 300}`,
			Metadata:     "{}",
		},

		// User Settings
		{
			Category:     "users",
			Key:          "registration_enabled",
			Value:        "true",
			DefaultValue: "true",
			Type:         "bool",
			Description:  "Allow new user registration",
			Group:        "registration",
			Order:        1,
			Metadata:     "{}",
		},
		{
			Category:     "users",
			Key:          "email_verification_required",
			Value:        "true",
			DefaultValue: "true",
			Type:         "bool",
			Description:  "Require email verification for new users",
			Group:        "registration",
			Order:        2,
			Metadata:     "{}",
		},
		{
			Category:     "users",
			Key:          "default_user_role",
			Value:        "user",
			DefaultValue: "user",
			Type:         "string",
			Description:  "Default role assigned to new users",
			Group:        "registration",
			Order:        3,
			Options:      `[{"value":"user","label":"User"},{"value":"premium","label":"Premium User"}]`,
			Metadata:     "{}",
		},
		{
			Category:     "users",
			Key:          "free_operations_monthly",
			Value:        "100",
			DefaultValue: "100",
			Type:         "int",
			Description:  "Free operations per month for new users",
			Group:        "limits",
			Order:        4,
			Validation:   `{"min": 0, "max": 10000}`,
			Metadata:     "{}",
		},
		{
			Category:     "users",
			Key:          "operation_cost",
			Value:        "0.001",
			DefaultValue: "0.001",
			Type:         "float",
			Description:  "Cost per operation in USD",
			Group:        "pricing",
			Order:        5,
			Validation:   `{"min": 0, "max": 1}`,
			Metadata:     "{}",
		},

		// System Settings
		{
			Category:     "system",
			Key:          "logging_enabled",
			Value:        "true",
			DefaultValue: "true",
			Type:         "bool",
			Description:  "Enable application logging",
			Group:        "logging",
			Order:        1,
			Metadata:     "{}",
		},
		{
			Category:     "system",
			Key:          "log_level",
			Value:        "info",
			DefaultValue: "info",
			Type:         "string",
			Description:  "Application log level",
			Group:        "logging",
			Order:        2,
			Options:      `[{"value":"debug","label":"Debug"},{"value":"info","label":"Info"},{"value":"warn","label":"Warning"},{"value":"error","label":"Error"}]`,
			Metadata:     "{}",
		},
		{
			Category:     "system",
			Key:          "backup_enabled",
			Value:        "false",
			DefaultValue: "false",
			Type:         "bool",
			Description:  "Enable automatic database backups",
			Group:        "backup",
			Order:        3,
			Metadata:     "{}",
		},
	}

	// Create settings in transaction
	return db.Transaction(func(tx *gorm.DB) error {
		for _, setting := range defaultSettings {
			setting.ID = uuid.New().String()
			setting.CreatedAt = time.Now()
			setting.UpdatedAt = time.Now()

			if err := tx.Create(setting).Error; err != nil {
				return fmt.Errorf("failed to create setting %s: %w", setting.Key, err)
			}
		}

		fmt.Printf("Created %d default settings\n", len(defaultSettings))
		return nil
	})
}

// MigrateEnvToSettings migrates existing environment variables to database settings
func MigrateEnvToSettings(db *gorm.DB) error {
	envMappings := map[string]string{
		"APP_NAME":                    "app_name",
		"APP_URL":                     "app_url",
		"API_URL":                     "api_url",
		"DEBUG":                       "debug_mode",
		"JWT_SECRET":                  "jwt_secret",
		"SMTP_HOST":                   "smtp_host",
		"SMTP_PORT":                   "smtp_port",
		"SMTP_USER":                   "smtp_user",
		"SMTP_PASS":                   "smtp_password",
		"EMAIL_FROM":                  "email_from",
		"PAYPAL_CLIENT_ID":            "paypal_client_id",
		"PAYPAL_CLIENT_SECRET":        "paypal_client_secret",
		"GOOGLE_CLIENT_ID":            "google_client_id",
		"GOOGLE_CLIENT_SECRET":        "google_client_secret",
		"MAX_FILE_SIZE":               "max_file_size",
		"REGISTRATION_ENABLED":        "registration_enabled",
		"EMAIL_VERIFICATION_REQUIRED": "email_verification_required",
		"RATE_LIMIT_REQUESTS":         "rate_limit_requests",
	}

	updates := make(map[string]string)
	for envKey, settingKey := range envMappings {
		if value := os.Getenv(envKey); value != "" {
			updates[settingKey] = value
		}
	}

	if len(updates) == 0 {
		fmt.Println("No environment variables to migrate")
		return nil
	}

	// Update settings with env values
	return db.Transaction(func(tx *gorm.DB) error {
		for settingKey, value := range updates {
			var setting models.AppSetting
			if err := tx.Where("`key` = ?", settingKey).First(&setting).Error; err != nil {
				if err == gorm.ErrRecordNotFound {
					fmt.Printf("Setting %s not found, skipping migration\n", settingKey)
					continue
				}
				return err
			}

			setting.Value = value
			setting.UpdatedAt = time.Now()

			if err := tx.Save(&setting).Error; err != nil {
				return fmt.Errorf("failed to update setting %s: %w", settingKey, err)
			}

			fmt.Printf("Migrated %s -> %s = %s\n", settingKey, settingKey, value)
		}

		fmt.Printf("Successfully migrated %d environment variables to database settings\n", len(updates))
		return nil
	})
}
