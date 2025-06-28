// internal/config/config.go
package config

import (
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds application configuration
type Config struct {
	Port int

	JWTSecret          string
	TempDir            string
	UploadDir          string
	PublicDir          string
	PayPalClientID     string
	PayPalClientSecret string
	PayPalAPIBase      string
	SMTPHost           string
	SMTPPort           int
	SMTPUser           string
	SMTPPass           string
	SMTPSecure         bool
	EmailFrom          string
	ContactRecipient   string
	AppURL             string
	APIUrl             string
	Debug              bool
	GoogleClientID     string
	GoogleClientSecret string
	OAuthRedirectURL   string

	// SQLite Database config (simplified from MySQL)
	DBPath string // Single path instead of host/port/user/password

	// App configuration
	SiteName                 string
	SiteDescription          string
	MaintenanceMode          bool
	RegistrationEnabled      bool
	RequireEmailVerification bool
	PasswordMinLength        int
	PasswordRequireUppercase bool
	PasswordRequireNumbers   bool
	PasswordRequireSymbols   bool
	SessionTimeout           int
	MaxLoginAttempts         int
	CORSAllowedOrigins       []string
	EmailProvider            string
	EmailFromName            string
	RateLimitRequests        int
	MaxFileSize              int64
	APITimeout               int
	LoggingEnabled           bool
	LogLevel                 string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	// Load .env file if it exists
	_ = godotenv.Load()

	port, _ := strconv.Atoi(getEnv("PORT", "8080"))
	smtpPort, _ := strconv.Atoi(getEnv("SMTP_PORT", "587"))

	// SQLite database path
	dbPath := getEnv("DB_PATH", "data/megapdf.db")

	// Ensure absolute path
	if !filepath.IsAbs(dbPath) {
		dbPath = filepath.Join(".", dbPath)
	}

	return &Config{
		Port: port,

		JWTSecret:          getEnv("JWT_SECRET", "your-default-secret-key"),
		TempDir:            getEnv("TEMP_DIR", "temp"),
		UploadDir:          getEnv("UPLOAD_DIR", "uploads"),
		PublicDir:          getEnv("PUBLIC_DIR", "public"),
		PayPalClientID:     getEnv("PAYPAL_CLIENT_ID", ""),
		PayPalClientSecret: getEnv("PAYPAL_CLIENT_SECRET", ""),
		PayPalAPIBase:      getEnv("PAYPAL_API_BASE", "https://api-m.sandbox.paypal.com"),
		SMTPHost:           getEnv("SMTP_HOST", ""),
		SMTPPort:           smtpPort,
		SMTPUser:           getEnv("SMTP_USER", ""),
		SMTPPass:           getEnv("SMTP_PASS", ""),
		SMTPSecure:         getEnv("SMTP_SECURE", "false") == "true",
		EmailFrom:          getEnv("EMAIL_FROM", "noreply@mega-pdf.com"),
		ContactRecipient:   getEnv("CONTACT_RECIPIENT_EMAIL", ""),
		AppURL:             getEnv("APP_URL", "http://localhost:3000"),
		APIUrl:             getEnv("API_URL", "http://localhost:8080"),
		Debug:              getEnv("DEBUG", "false") == "true",
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		OAuthRedirectURL:   getEnv("OAUTH_REDIRECT_URL", "http://localhost:8080/api/auth/google/callback"),

		// SQLite Database config
		DBPath: dbPath,

		// App configuration with defaults
		SiteName:                 getEnv("SITE_NAME", "MegaPDF"),
		SiteDescription:          getEnv("SITE_DESCRIPTION", "Professional PDF Processing Service"),
		MaintenanceMode:          getEnv("MAINTENANCE_MODE", "false") == "true",
		RegistrationEnabled:      getEnv("REGISTRATION_ENABLED", "true") == "true",
		RequireEmailVerification: getEnv("REQUIRE_EMAIL_VERIFICATION", "true") == "true",
		PasswordMinLength:        getIntEnv("PASSWORD_MIN_LENGTH", 8),
		PasswordRequireUppercase: getEnv("PASSWORD_REQUIRE_UPPERCASE", "true") == "true",
		PasswordRequireNumbers:   getEnv("PASSWORD_REQUIRE_NUMBERS", "true") == "true",
		PasswordRequireSymbols:   getEnv("PASSWORD_REQUIRE_SYMBOLS", "false") == "true",
		SessionTimeout:           getIntEnv("SESSION_TIMEOUT", 7200), // 2 hours
		MaxLoginAttempts:         getIntEnv("MAX_LOGIN_ATTEMPTS", 5),
		CORSAllowedOrigins:       getCorsOrigins([]string{"http://localhost:3000"}),
		EmailProvider:            getEnv("EMAIL_PROVIDER", "smtp"),
		EmailFromName:            getEnv("EMAIL_FROM_NAME", "MegaPDF"),
		RateLimitRequests:        getIntEnv("RATE_LIMIT_REQUESTS", 100),
		MaxFileSize:              getInt64Env("MAX_FILE_SIZE", 100*1024*1024), // 100MB
		APITimeout:               getIntEnv("API_TIMEOUT", 30),
		LoggingEnabled:           getEnv("LOGGING_ENABLED", "true") == "true",
		LogLevel:                 getEnv("LOG_LEVEL", "info"),
	}
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getIntEnv gets an integer environment variable or returns a default value
func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// getInt64Env gets an int64 environment variable or returns a default value
func getInt64Env(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intValue
		}
	}
	return defaultValue
}

// getCorsOrigins parses CORS origins from environment variable
func getCorsOrigins(defaultOrigins []string) []string {
	originsStr := getEnv("CORS_ALLOWED_ORIGINS", "")
	if originsStr == "" {
		return defaultOrigins
	}

	origins := strings.Split(originsStr, ",")
	for i, origin := range origins {
		origins[i] = strings.TrimSpace(origin)
	}
	return origins
}

// GetEnvFilePath returns the path to the .env file (for compatibility)
func GetEnvFilePath() string {
	// Check if .env file exists in current directory
	if _, err := os.Stat(".env"); err == nil {
		return ".env"
	}
	return ""
}
