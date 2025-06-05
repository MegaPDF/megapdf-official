// internal/db/database.go
package db

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/google/uuid"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// createIndexes creates database indexes to optimize query performance
func createIndexes(db *gorm.DB) error {
	fmt.Println("Creating database indexes...")

	// Execute in a transaction for safety
	return db.Transaction(func(tx *gorm.DB) error {
		var errors []error

		// Define table indexes
		tableIndexes := map[string][]string{
			"users": {
				"role",
				"email",
				"free_operations_reset",
			},
			"api_keys": {
				"user_id",
				"last_used",
			},
			"transactions": {
				"user_id",
				"status",
				"payment_id",
			},
			"usage_stats": {
				"user_id",
				"operation",
				"date",
			},
			"sessions": {
				"user_id",
				"expires",
			},
			"accounts": {
				"user_id",
			},
			"password_reset_tokens": {
				"email",
				"expires",
			},
			"settings": {
				"category",
			},
		}

		// Create single column indexes
		for table, columns := range tableIndexes {
			for _, column := range columns {
				indexName := fmt.Sprintf("idx_%s_%s", table, column)
				sql := fmt.Sprintf("CREATE INDEX IF NOT EXISTS %s ON %s(%s)",
					indexName, table, column)

				result := tx.Exec(sql)
				if result.Error != nil {
					// Check if error is because MySQL doesn't support "IF NOT EXISTS"
					if strings.Contains(result.Error.Error(), "syntax error") {
						// Try alternative syntax for MySQL
						sql = fmt.Sprintf("CREATE INDEX %s ON %s(%s)",
							indexName, table, column)
						result = tx.Exec(sql)
					}

					// If still error, check if it's because index already exists
					if result.Error != nil && !strings.Contains(result.Error.Error(), "Duplicate key name") {
						errors = append(errors, fmt.Errorf("failed to create index %s: %w",
							indexName, result.Error))
					} else {
						fmt.Printf("Index already exists or created: %s\n", indexName)
					}
				} else {
					fmt.Printf("Created index: %s\n", indexName)
				}
			}
		}

		// Create composite indexes
		compositeIndexes := []struct {
			table   string
			name    string
			columns string
		}{
			{"usage_stats", "idx_usage_stats_user_op_date", "user_id, operation, date"},
			{"accounts", "idx_accounts_provider_id", "provider, provider_account_id"},
			{"settings", "idx_settings_category_key", "category, `key`"},
			{"api_keys", "idx_api_keys_key", "`key`"},
		}

		for _, idx := range compositeIndexes {
			sql := fmt.Sprintf("CREATE INDEX IF NOT EXISTS %s ON %s(%s)",
				idx.name, idx.table, idx.columns)

			result := tx.Exec(sql)
			if result.Error != nil {
				// Try alternative syntax for MySQL
				if strings.Contains(result.Error.Error(), "syntax error") {
					sql = fmt.Sprintf("CREATE INDEX %s ON %s(%s)",
						idx.name, idx.table, idx.columns)
					result = tx.Exec(sql)
				}

				// Check if still error and not just "index exists"
				if result.Error != nil && !strings.Contains(result.Error.Error(), "Duplicate key name") {
					errors = append(errors, fmt.Errorf("failed to create composite index %s: %w",
						idx.name, result.Error))
				} else {
					fmt.Printf("Composite index already exists or created: %s\n", idx.name)
				}
			} else {
				fmt.Printf("Created composite index: %s\n", idx.name)
			}
		}

		// Report any errors
		if len(errors) > 0 {
			for _, err := range errors {
				fmt.Printf("WARNING: Index error: %v\n", err)
			}
			// Continue even with some index errors
			return fmt.Errorf("%d indexes failed to create", len(errors))
		}

		fmt.Println("All database indexes created successfully")
		return nil
	})
}

// InitDB initializes the MySQL database connection
func InitDB() (*gorm.DB, error) {
	// Get database configuration from environment variables
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "3306")
	dbName := getEnv("DB_NAME", "megapdf")
	dbUser := getEnv("DB_USER", "root")
	dbPassword := getEnv("DB_PASSWORD", "")
	dbCharset := getEnv("DB_CHARSET", "utf8mb4")
	dbCollation := getEnv("DB_COLLATION", "utf8mb4_unicode_ci")
	dbTimezone := getEnv("DB_TIMEZONE", "UTC")

	// Build MySQL connection string
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=%s&collation=%s&parseTime=True&loc=%s",
		dbUser, dbPassword, dbHost, dbPort, dbName,
		dbCharset, dbCollation, dbTimezone,
	)

	// Configure GORM
	config := &gorm.Config{
		NowFunc: func() time.Time {
			return time.Now().UTC() // Use UTC for consistent timestamps
		},
	}

	// Enable SQL logging in development mode
	if os.Getenv("DEBUG") == "true" {
		config.Logger = logger.Default.LogMode(logger.Info)
	}

	fmt.Println("Connecting to MySQL database at:", dbHost+":"+dbPort)
	db, err := gorm.Open(mysql.Open(dsn), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MySQL database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database connection: %w", err)
	}
	if err := createIndexes(db); err != nil {
		// Log the error but don't fail initialization
		fmt.Printf("WARNING: Some database indexes could not be created: %v\n", err)
		fmt.Println("The application will continue, but some queries may be slower than optimal")
	}
	// Set connection pool settings
	maxIdleConns := 10
	maxOpenConns := 100
	connMaxLifetime := time.Hour
	sqlDB.SetMaxIdleConns(maxIdleConns)
	sqlDB.SetMaxOpenConns(maxOpenConns)
	sqlDB.SetConnMaxLifetime(connMaxLifetime)

	// Auto-migrate all models
	fmt.Println("Auto-migrating database schema...")
	err = db.AutoMigrate(
		&models.User{},
		&models.Transaction{},
		&models.Account{},
		&models.Session{},
		&models.ApiKey{},
		&models.UsageStats{},
		&models.PasswordResetToken{},
		&models.VerificationToken{},
		&models.PaymentWebhookEvent{},
		&models.LowBalanceAlert{},
		&models.OperationsAlert{},
		&models.PricingSetting{},
		&models.Setting{},
		&models.PDFToolSettings{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to auto-migrate database schema: %w", err)
	}

	// Create admin user if it doesn't exist
	if err := createAdminUser(db); err != nil {
		return nil, fmt.Errorf("failed to create admin user: %w", err)
	}
	if err := initializePDFToolsSettings(db); err != nil {
		return nil, fmt.Errorf("failed to initialize PDF tool settings: %w", err)
	}
	// Initialize default settings
	if err := initializeDefaultSettings(db); err != nil {
		return nil, fmt.Errorf("failed to initialize default settings: %w", err)
	}

	// Initialize default pricing
	if err := initializeDefaultPricing(db); err != nil {
		return nil, fmt.Errorf("failed to initialize default pricing: %w", err)
	}

	// Store DB in package variable for global access
	DB = db
	fmt.Println("Database initialized successfully!")
	return db, nil
}
func initializePDFToolsSettings(db *gorm.DB) error {
	// Check if settings already exist
	var count int64
	if err := db.Model(&models.PDFToolSettings{}).Count(&count).Error; err != nil {
		return err
	}

	if count > 0 {
		fmt.Println("PDF tool settings already exist, skipping initialization")
		return nil
	}

	// Get default tools
	defaultTools := models.GetDefaultTools()

	// Create config
	config := models.PDFToolsConfig{
		Tools: defaultTools,
	}

	// Convert to JSON
	configJSON, err := json.Marshal(config)
	if err != nil {
		return err
	}

	// Create settings record
	settings := models.PDFToolSettings{
		ID:          "pdf_tools_settings",
		Settings:    string(configJSON),
		Description: "Default PDF tools settings",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	return db.Create(&settings).Error
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// createAdminUser creates a default admin user if no admin exists
func createAdminUser(db *gorm.DB) error {
	// Check if any admin users exist
	var adminCount int64
	if err := db.Model(&models.User{}).Where("role = ?", "admin").Count(&adminCount).Error; err != nil {
		return err
	}

	// If no admin users exist, create a default one
	if adminCount == 0 {
		fmt.Println("Creating default admin user...")
		// Get admin credentials from environment
		adminEmail := getEnv("ADMIN_EMAIL", "admin@megapdf.com")
		adminPassword := getEnv("ADMIN_PASSWORD", "admin123")
		adminName := getEnv("ADMIN_NAME", "Administrator")

		// Hash the password
		hashedPassword, err := models.HashPassword(adminPassword)
		if err != nil {
			return fmt.Errorf("failed to hash admin password: %w", err)
		}

		// Set reset date to start of next month
		now := time.Now()
		nextMonth := now.AddDate(0, 1, 0)
		resetDate := time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.Local)

		// Create the admin user
		admin := models.User{
			ID:                  uuid.New().String(),
			Name:                adminName,
			Email:               adminEmail,
			Password:            hashedPassword,
			Role:                "admin",
			IsEmailVerified:     true,
			Balance:             0,
			FreeOperationsUsed:  0,
			FreeOperationsReset: resetDate,
			CreatedAt:           time.Now(),
			UpdatedAt:           time.Now(),
		}

		if err := db.Create(&admin).Error; err != nil {
			return fmt.Errorf("failed to create admin user: %w", err)
		}

		fmt.Printf("Default admin user created with email: %s\n", adminEmail)
	}

	return nil
}

// initializeDefaultSettings creates default settings if they don't exist
func initializeDefaultSettings(db *gorm.DB) error {
	fmt.Println("Initializing default settings...")

	// Check if settings already exist
	var settingsCount int64
	if err := db.Model(&models.Setting{}).Count(&settingsCount).Error; err != nil {
		return err
	}

	if settingsCount > 0 {
		fmt.Println("Settings already exist, skipping initialization")
		return nil
	}

	// Default settings for general category
	generalSettings := map[string]interface{}{
		"site_name":                  "MegaPDF",
		"site_description":           "Professional PDF tools and API services",
		"maintenance_mode":           false,
		"registration_enabled":       true,
		"require_email_verification": true,
	}

	// Default settings for API category
	apiSettings := map[string]interface{}{
		"default_rate_limit": 100,
		"max_file_size":      50,
		"api_timeout":        30,
		"logging_enabled":    true,
		"log_level":          "info",
	}

	// Default settings for email category
	emailSettings := map[string]interface{}{
		"email_provider": "smtp",
		"from_email":     "noreply@megapdf.com",
		"from_name":      "MegaPDF",
		"smtp_host":      "",
		"smtp_port":      587,
		"smtp_user":      "",
		"smtp_password":  "",
	}

	// Default settings for security category
	securitySettings := map[string]interface{}{
		"two_factor_required":        false,
		"password_min_length":        8,
		"password_require_uppercase": true,
		"password_require_numbers":   true,
		"password_require_symbols":   false,
		"session_timeout":            24,
		"max_login_attempts":         5,
		"block_time_after_failures":  30,
		"allowed_ips":                "",
		"jwt_secret":                 "",
		"cors_allowed_origins":       "*",
	}

	// Helper function to save settings for a category
	saveSettings := func(category string, settings map[string]interface{}) error {
		for key, value := range settings {
			valueJSON, err := json.Marshal(value)
			if err != nil {
				return fmt.Errorf("failed to marshal value for %s.%s: %w", category, key, err)
			}

			setting := models.Setting{
				ID:          uuid.New().String(),
				Category:    category,
				Key:         key,
				Value:       string(valueJSON),
				Description: fmt.Sprintf("Default %s setting", key),
				CreatedAt:   time.Now(),
				UpdatedAt:   time.Now(),
			}

			if err := db.Create(&setting).Error; err != nil {
				return fmt.Errorf("failed to create setting %s.%s: %w", category, key, err)
			}
		}
		return nil
	}

	// Save all default settings
	categories := map[string]map[string]interface{}{
		"general":  generalSettings,
		"api":      apiSettings,
		"email":    emailSettings,
		"security": securitySettings,
	}

	for category, settings := range categories {
		if err := saveSettings(category, settings); err != nil {
			return err
		}
		fmt.Printf("Default settings created for category: %s\n", category)
	}

	return nil
}

// initializeDefaultPricing creates default pricing settings if they don't exist
func initializeDefaultPricing(db *gorm.DB) error {
	fmt.Println("Initializing default pricing settings...")

	// Check if pricing settings already exist
	var pricingCount int64
	if err := db.Model(&models.PricingSetting{}).Count(&pricingCount).Error; err != nil {
		return err
	}

	if pricingCount > 0 {
		fmt.Println("Pricing settings already exist, skipping initialization")
		return nil
	}

	// Create default pricing settings
	customPricing := models.CustomPricing{
		OperationCost:         constants.OperationCost,
		FreeOperationsMonthly: constants.FreeOperationsMonthly,
		CustomPrices:          make(map[string]float64),
	}

	// Add custom prices for some operations (as examples)
	customPricing.CustomPrices["ocr"] = 0.010      // More expensive
	customPricing.CustomPrices["compress"] = 0.003 // Less expensive
	customPricing.CustomPrices["protect"] = 0.004  // Slightly less expensive

	// Marshal to JSON
	pricingJSON, err := json.Marshal(customPricing)
	if err != nil {
		return fmt.Errorf("failed to marshal pricing settings: %w", err)
	}

	// Create pricing setting record
	pricingSetting := models.PricingSetting{
		ID:          uuid.New().String(),
		Key:         "pricing_settings",
		Value:       string(pricingJSON),
		Description: "Global pricing settings for operations",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := db.Create(&pricingSetting).Error; err != nil {
		return fmt.Errorf("failed to create pricing settings: %w", err)
	}

	fmt.Println("Default pricing settings created successfully")
	return nil
}

// TransactionFunc is a type for database transaction functions
type TransactionFunc func(tx *gorm.DB) error

// WithTransaction runs a function in a database transaction
func WithTransaction(fn TransactionFunc) error {
	return DB.Transaction(func(tx *gorm.DB) error {
		return fn(tx)
	})
}
