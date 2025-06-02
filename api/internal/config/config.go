// internal/config/config.go - Simplified to use only environment variables
package config

import (
	"os"
	"strconv"
)

// Config holds all the application configuration from environment variables
type Config struct {
	Port               int
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
	// DB Config
	DBHost            string
	DBPort            int
	DBName            string
	DBUser            string
	DBPassword        string
	DBCharset         string
	DBCollation       string
	DBTimezone        string
	DBMaxIdleConns    int
	DBMaxOpenConns    int
	DBConnMaxLifetime string
}

// LoadConfig loads configuration from environment variables only
func LoadConfig() *Config {
	port, _ := strconv.Atoi(getEnv("PORT", "8080"))
	smtpPort, _ := strconv.Atoi(getEnv("SMTP_PORT", "587"))
	dbPort, _ := strconv.Atoi(getEnv("DB_PORT", "3306"))
	dbMaxIdleConns, _ := strconv.Atoi(getEnv("DB_MAX_IDLE_CONNS", "10"))
	dbMaxOpenConns, _ := strconv.Atoi(getEnv("DB_MAX_OPEN_CONNS", "100"))
	dbConnMaxLifetime := getEnv("DB_CONN_MAX_LIFETIME", "1h")

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

		// Database config
		DBHost:            getEnv("DB_HOST", "127.0.0.1"),
		DBPort:            dbPort,
		DBName:            getEnv("DB_NAME", "megapdf"),
		DBUser:            getEnv("DB_USER", "root"),
		DBPassword:        getEnv("DB_PASSWORD", ""),
		DBCharset:         getEnv("DB_CHARSET", "utf8mb4"),
		DBCollation:       getEnv("DB_COLLATION", "utf8mb4_unicode_ci"),
		DBTimezone:        getEnv("DB_TIMEZONE", "UTC"),
		DBMaxIdleConns:    dbMaxIdleConns,
		DBMaxOpenConns:    dbMaxOpenConns,
		DBConnMaxLifetime: dbConnMaxLifetime,
	}
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
