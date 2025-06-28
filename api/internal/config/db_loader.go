package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"gorm.io/gorm"
)

// LoadConfigFromDB loads configuration from database settings with env fallback
func LoadConfigFromDB(db *gorm.DB) *Config {
	settings := loadSettingsMap(db)

	return &Config{
		// Application settings
		Port:     getIntSetting(settings, "port", getEnvInt("PORT", 8080)),
		AppURL:   getStringSetting(settings, "app_url", getEnv("APP_URL", "http://localhost:3000")),
		APIUrl:   getStringSetting(settings, "api_url", getEnv("API_URL", "http://localhost:8080")),
		Debug:    getBoolSetting(settings, "debug_mode", getEnv("DEBUG", "false") == "true"),
		SiteName: getStringSetting(settings, "app_name", getEnv("APP_NAME", "MegaPDF")),

		// Security settings
		JWTSecret:                getStringSetting(settings, "jwt_secret", getEnv("JWT_SECRET", "your-secret-key-here")),
		PasswordMinLength:        getIntSetting(settings, "password_min_length", 8),
		SessionTimeout:           getIntSetting(settings, "session_timeout", 3600),
		RequireEmailVerification: getBoolSetting(settings, "email_verification_required", true),
		RegistrationEnabled:      getBoolSetting(settings, "registration_enabled", true),

		// Email settings
		SMTPHost:  getStringSetting(settings, "smtp_host", getEnv("SMTP_HOST", "")),
		SMTPPort:  getIntSetting(settings, "smtp_port", getEnvInt("SMTP_PORT", 587)),
		SMTPUser:  getStringSetting(settings, "smtp_user", getEnv("SMTP_USER", "")),
		SMTPPass:  getStringSetting(settings, "smtp_password", getEnv("SMTP_PASS", "")),
		EmailFrom: getStringSetting(settings, "email_from", getEnv("EMAIL_FROM", "noreply@megapdf.com")),

		// Payment settings
		PayPalClientID:     getStringSetting(settings, "paypal_client_id", getEnv("PAYPAL_CLIENT_ID", "")),
		PayPalClientSecret: getStringSetting(settings, "paypal_client_secret", getEnv("PAYPAL_CLIENT_SECRET", "")),
		PayPalAPIBase:      getStringSetting(settings, "paypal_api_base", getEnv("PAYPAL_API_BASE", "https://api.sandbox.paypal.com")),

		// OAuth settings
		GoogleClientID:     getStringSetting(settings, "google_client_id", getEnv("GOOGLE_CLIENT_ID", "")),
		GoogleClientSecret: getStringSetting(settings, "google_client_secret", getEnv("GOOGLE_CLIENT_SECRET", "")),

		// File settings
		MaxFileSize: int64(getIntSetting(settings, "max_file_size", getEnvInt("MAX_FILE_SIZE", 104857600))),
		UploadDir:   getStringSetting(settings, "upload_dir", getEnv("UPLOAD_DIR", "uploads")),
		TempDir:     getStringSetting(settings, "temp_dir", getEnv("TEMP_DIR", "temp")),

		// API settings
		RateLimitRequests: getIntSetting(settings, "rate_limit_requests", getEnvInt("RATE_LIMIT_REQUESTS", 100)),
		APITimeout:        getIntSetting(settings, "api_timeout", 30),

		// Database (still from env)
		DBPath: getEnv("DB_PATH", "data/megapdf.db"),
	}
}

func loadSettingsMap(db *gorm.DB) map[string]*models.AppSetting {
	var settings []models.AppSetting
	if err := db.Find(&settings).Error; err != nil {
		fmt.Printf("Failed to load settings from database: %v\n", err)
		return make(map[string]*models.AppSetting)
	}

	settingsMap := make(map[string]*models.AppSetting)
	for i := range settings {
		settingsMap[settings[i].Key] = &settings[i]
	}

	return settingsMap
}

func getStringSetting(settings map[string]*models.AppSetting, key, defaultValue string) string {
	if setting, exists := settings[key]; exists && setting.Value != "" {
		return setting.Value
	}
	return defaultValue
}

func getIntSetting(settings map[string]*models.AppSetting, key string, defaultValue int) int {
	if setting, exists := settings[key]; exists && setting.Value != "" {
		if val, err := strconv.Atoi(setting.Value); err == nil {
			return val
		}
	}
	return defaultValue
}

func getBoolSetting(settings map[string]*models.AppSetting, key string, defaultValue bool) bool {
	if setting, exists := settings[key]; exists && setting.Value != "" {
		return setting.Value == "true"
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int) int {
	if val := os.Getenv(key); val != "" {
		if intVal, err := strconv.Atoi(val); err == nil {
			return intVal
		}
	}
	return defaultValue
}
