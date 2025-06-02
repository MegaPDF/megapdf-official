// internal/config/config.go - Updated to use .env file
package config

import (
	"bufio"
	"os"
	"strconv"
	"strings"
	"sync"

	"github.com/joho/godotenv"
)

// Config holds all the application configuration
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

var (
	globalConfig *Config
	configMutex  sync.RWMutex
	envFilePath  string
)

// LoadConfig loads configuration from .env file and environment variables
func LoadConfig() *Config {
	configMutex.Lock()
	defer configMutex.Unlock()

	// Find .env file
	envFilePath = findEnvFile()

	// Load .env file if it exists
	if envFilePath != "" {
		if err := godotenv.Load(envFilePath); err != nil {
			// Don't fail if .env file doesn't exist or has issues
			// Fall back to environment variables
		}
	}

	// Create config with values from environment (now includes .env values)
	config := createConfigFromEnv()
	globalConfig = config

	return config
}

// ReloadConfig reloads configuration from .env file
func ReloadConfig() *Config {
	configMutex.Lock()
	defer configMutex.Unlock()

	// Clear existing environment variables that came from .env
	clearEnvFromFile()

	// Reload .env file
	if envFilePath != "" {
		if err := godotenv.Load(envFilePath); err != nil {
			// Log error but continue with existing environment
		}
	}

	// Create new config
	config := createConfigFromEnv()
	globalConfig = config

	return config
}

// GetConfig returns the current global configuration (thread-safe)
func GetConfig() *Config {
	configMutex.RLock()
	defer configMutex.RUnlock()

	if globalConfig == nil {
		// If no config loaded yet, load it now
		configMutex.RUnlock()
		return LoadConfig()
	}

	return globalConfig
}

// GetEnvFilePath returns the path to the .env file being used
func GetEnvFilePath() string {
	return envFilePath
}

// findEnvFile finds the .env file in current or parent directories
func findEnvFile() string {
	// Check current directory first
	if _, err := os.Stat(".env"); err == nil {
		return ".env"
	}

	// Check parent directory (for cases where we're in api/ subdirectory)
	if _, err := os.Stat("../.env"); err == nil {
		return "../.env"
	}

	// Check if ENV_FILE_PATH is set
	if path := os.Getenv("ENV_FILE_PATH"); path != "" {
		if _, err := os.Stat(path); err == nil {
			return path
		}
	}

	return "" // No .env file found
}

// createConfigFromEnv creates config from current environment variables
func createConfigFromEnv() *Config {
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

// clearEnvFromFile clears environment variables that might have come from .env file
func clearEnvFromFile() {
	if envFilePath == "" {
		return
	}

	// Read .env file to get list of variables to clear
	file, err := os.Open(envFilePath)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			// Don't clear system environment variables, only unset if they're not in system env
			if os.Getenv(key) != "" {
				os.Unsetenv(key)
			}
		}
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

// UpdateConfigFromEnvFile forces a reload from .env file
func UpdateConfigFromEnvFile() error {
	if envFilePath == "" {
		envFilePath = findEnvFile()
	}

	if envFilePath != "" {
		// Load .env file
		if err := godotenv.Overload(envFilePath); err != nil {
			return err
		}
	}

	// Reload config
	ReloadConfig()
	return nil
}
