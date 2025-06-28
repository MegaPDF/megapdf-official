// internal/db/database.go
package db

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/google/uuid"
	"gorm.io/driver/sqlite"
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

		// Define table indexes (SQLite compatible)
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
		}

		// Create single column indexes (SQLite compatible syntax)
		for table, columns := range tableIndexes {
			for _, column := range columns {
				indexName := fmt.Sprintf("idx_%s_%s", table, column)
				sql := fmt.Sprintf("CREATE INDEX IF NOT EXISTS %s ON %s(%s)",
					indexName, table, column)

				result := tx.Exec(sql)
				if result.Error != nil {
					errors = append(errors, fmt.Errorf("failed to create index %s: %w", indexName, result.Error))
					continue
				}
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

// InitDB initializes the SQLite database connection
func InitDB() (*gorm.DB, error) {
	// Get database path from environment variables
	dbPath := getEnv("SQLITE_PATH", "data/megapdf.db")

	// Ensure the directory exists
	dbDir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dbDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create database directory: %w", err)
	}

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

	fmt.Printf("Connecting to SQLite database at: %s\n", dbPath)

	// Connect to SQLite with additional parameters for better performance
	dsn := fmt.Sprintf("%s?cache=shared&mode=rwc&_journal_mode=WAL&_synchronous=NORMAL&_foreign_keys=on", dbPath)
	db, err := gorm.Open(sqlite.Open(dsn), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to SQLite database: %w", err)
	}

	// Configure SQLite specific settings
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database connection: %w", err)
	}

	// SQLite connection pool settings (more conservative than MySQL)
	sqlDB.SetMaxIdleConns(1)
	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// IMPORTANT: Auto-migrate FIRST to create tables
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
		&models.PDFToolSettings{},
	)
	if err != nil {
		return nil, fmt.Errorf("failed to auto-migrate database schema: %w", err)
	}

	// THEN create indexes (after tables exist)
	if err := createIndexes(db); err != nil {
		// Log the error but don't fail initialization
		fmt.Printf("WARNING: Some database indexes could not be created: %v\n", err)
		fmt.Println("The application will continue, but some queries may be slower than optimal")
	}

	// Create admin user if it doesn't exist
	if err := createAdminUser(db); err != nil {
		return nil, fmt.Errorf("failed to create admin user: %w", err)
	}

	// Initialize PDF tools settings
	if err := initializePDFToolsSettings(db); err != nil {
		return nil, fmt.Errorf("failed to initialize PDF tool settings: %w", err)
	}

	// Initialize default pricing
	if err := initializeDefaultPricing(db); err != nil {
		return nil, fmt.Errorf("failed to initialize default pricing: %w", err)
	}
	// Store DB in package variable for global access
	DB = db
	fmt.Println("SQLite database initialized successfully!")
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

	if adminCount > 0 {
		fmt.Println("Admin user already exists, skipping creation")
		return nil
	}

	// Create default admin user
	adminID := uuid.New().String()
	admin := models.User{
		ID:                  adminID,
		Name:                "Administrator",
		Email:               "admin@megapdf.com",
		Password:            "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: password
		Role:                "admin",
		IsEmailVerified:     true,
		Balance:             0,
		FreeOperationsUsed:  0,
		FreeOperationsReset: time.Now(),
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	}

	if err := db.Create(&admin).Error; err != nil {
		return err
	}

	fmt.Printf("Created default admin user - Email: admin@megapdf.com, Password: password\n")
	fmt.Printf("Admin user ID: %s\n", adminID)
	return nil
}

func initializeDefaultPricing(db *gorm.DB) error {
	// Check if pricing settings already exist
	var count int64
	if err := db.Model(&models.PricingSetting{}).Where("`key` = ?", "pricing_settings").Count(&count).Error; err != nil {
		return err
	}

	if count > 0 {
		fmt.Println("Pricing settings already exist, skipping initialization")
		return nil
	}

	// Create default pricing configuration
	defaultPricing := models.CustomPricing{
		OperationCost:         0.001, // $0.001 per operation
		FreeOperationsMonthly: 100,   // 100 free operations per month
		CustomPrices:          make(map[string]float64),
	}

	// Marshal to JSON
	pricingJSON, err := json.Marshal(defaultPricing)
	if err != nil {
		return fmt.Errorf("failed to marshal default pricing: %w", err)
	}

	// Create default pricing settings record
	pricingSetting := models.PricingSetting{
		ID:          uuid.New().String(),
		Key:         "pricing_settings",
		Value:       string(pricingJSON),
		Description: "Default pricing settings for PDF operations",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := db.Create(&pricingSetting).Error; err != nil {
		return fmt.Errorf("failed to create default pricing settings: %w", err)
	}

	fmt.Println("Created default pricing settings")
	return nil
}
