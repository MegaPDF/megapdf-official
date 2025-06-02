// cmd/api/main.go - Updated to use .env file config system
package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/docs"
	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/routes"
	"github.com/gin-gonic/gin"
)

// @title MegaPDF API
// @description API for MegaPDF document processing service
// @version 1.0
// @host localhost:8080
// @BasePath /api
// @schemes http https
// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name x-api-key

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and the JWT token
func main() {
	fmt.Println("=== MegaPDF API Server ===")

	// Load configuration from .env file and environment variables
	fmt.Println("Loading configuration...")
	cfg := config.LoadConfig()

	// Log configuration source
	envFile := config.GetEnvFilePath()
	if envFile != "" {
		fmt.Printf("Configuration loaded from: %s\n", envFile)
	} else {
		fmt.Println("Configuration loaded from environment variables only")
	}

	// Set swagger base path
	docs.SwaggerInfo.BasePath = "/"

	// Set Gin mode based on debug setting
	if !cfg.Debug {
		gin.SetMode(gin.ReleaseMode)
		fmt.Println("Running in production mode")
	} else {
		fmt.Println("Running in debug mode")
	}

	// Initialize database
	fmt.Println("Initializing database connection...")
	database, err := db.InitDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	fmt.Println("Database connected successfully")

	// Create gin router
	r := gin.Default()

	// Set up routes with current configuration
	fmt.Println("Setting up routes...")
	routes.SetupRoutes(r, database, cfg)

	// Print registered routes
	printRoutes(r)

	// Create necessary directories
	createDirs(cfg)

	// Log final configuration status
	logConfigurationStatus(cfg)

	// Start server
	port := fmt.Sprintf(":%d", cfg.Port)
	fmt.Printf("\n🚀 Starting MegaPDF API server on http://localhost%s\n", port)
	fmt.Printf("📖 Swagger documentation: http://localhost%s/swagger/index.html\n", port)
	fmt.Printf("⚙️  Admin environment settings: http://localhost:3001/admin/settings\n")
	fmt.Println("========================================")

	if err := r.Run(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func printRoutes(r *gin.Engine) {
	routes := r.Routes()
	fmt.Println("\nRegistered Routes:")
	fmt.Println("=================")

	// Group routes by prefix for better readability
	routeGroups := make(map[string][]string)
	for _, route := range routes {
		prefix := getRoutePrefix(route.Path)
		routeGroups[prefix] = append(routeGroups[prefix], fmt.Sprintf("%s %s", route.Method, route.Path))
	}

	// Print grouped routes
	for prefix, routes := range routeGroups {
		fmt.Printf("\n%s:\n", prefix)
		for _, route := range routes {
			fmt.Printf("  %s\n", route)
		}
	}
	fmt.Println("=================\n")
}

func getRoutePrefix(path string) string {
	if path == "/" || path == "/health" {
		return "System"
	}
	if path == "/swagger/*any" {
		return "Documentation"
	}
	if len(path) > 4 && path[:4] == "/api" {
		parts := strings.Split(path, "/")
		if len(parts) >= 3 {
			return fmt.Sprintf("API - %s", strings.Title(parts[2]))
		}
		return "API"
	}
	return "Other"
}

func createDirs(cfg *config.Config) {
	fmt.Println("Creating necessary directories...")

	dirs := []string{
		cfg.TempDir,
		cfg.UploadDir,
		cfg.PublicDir,
		cfg.PublicDir + "/conversions",
		cfg.PublicDir + "/compressions",
		cfg.PublicDir + "/merges",
		cfg.PublicDir + "/splits",
		cfg.PublicDir + "/rotations",
		cfg.PublicDir + "/watermarked",
		cfg.PublicDir + "/watermarks",
		cfg.PublicDir + "/protected",
		cfg.PublicDir + "/pagenumbers",
		cfg.PublicDir + "/unlocked",
		cfg.PublicDir + "/ocr",
		cfg.PublicDir + "/edited",
		cfg.PublicDir + "/processed",
		cfg.PublicDir + "/unwatermarked",
		cfg.PublicDir + "/redacted",
		cfg.PublicDir + "/repaired",
		cfg.PublicDir + "/signatures",
		"backups", // For .env file backups
	}

	created := 0
	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Printf("Warning: Failed to create directory %s: %v", dir, err)
		} else {
			created++
		}
	}

	fmt.Printf("Created/verified %d directories\n", created)
}

func logConfigurationStatus(cfg *config.Config) {
	fmt.Println("\n📋 Configuration Status:")
	fmt.Println("========================")

	// Application settings
	fmt.Printf("🌐 URLs: Frontend=%s, API=%s\n", cfg.AppURL, cfg.APIUrl)
	fmt.Printf("🔒 Security: JWT=%s\n", maskValue(cfg.JWTSecret))

	// Database
	dbStatus := "❌ Not configured"
	if cfg.DBHost != "" && cfg.DBUser != "" {
		dbStatus = fmt.Sprintf("✅ %s@%s:%d/%s", cfg.DBUser, cfg.DBHost, cfg.DBPort, cfg.DBName)
	}
	fmt.Printf("🗄️  Database: %s\n", dbStatus)

	// Email
	emailStatus := "❌ Not configured"
	if cfg.SMTPHost != "" && cfg.SMTPUser != "" {
		emailStatus = fmt.Sprintf("✅ %s@%s:%d", cfg.SMTPUser, cfg.SMTPHost, cfg.SMTPPort)
	}
	fmt.Printf("📧 Email: %s\n", emailStatus)

	// Payment
	paypalStatus := "❌ Not configured"
	if cfg.PayPalClientID != "" {
		paypalStatus = "✅ Configured"
	}
	fmt.Printf("💳 PayPal: %s\n", paypalStatus)

	// OAuth
	googleStatus := "❌ Not configured"
	if cfg.GoogleClientID != "" {
		googleStatus = "✅ Configured"
	}
	fmt.Printf("🔑 Google OAuth: %s\n", googleStatus)

	fmt.Println("========================")

	// Configuration warnings
	warnings := []string{}
	if cfg.JWTSecret == "your-default-secret-key" {
		warnings = append(warnings, "⚠️  Using default JWT secret - change in production!")
	}
	if cfg.DBPassword == "" {
		warnings = append(warnings, "⚠️  Database password is empty")
	}
	if !cfg.Debug && (cfg.SMTPHost == "" || cfg.SMTPUser == "") {
		warnings = append(warnings, "⚠️  Email not configured - users won't receive notifications")
	}

	if len(warnings) > 0 {
		fmt.Println("\n⚠️  Configuration Warnings:")
		for _, warning := range warnings {
			fmt.Println("   " + warning)
		}
		fmt.Println()
	}
}

func maskValue(value string) string {
	if value == "" {
		return "❌ Not set"
	}
	if value == "your-default-secret-key" {
		return "⚠️  Default (change required)"
	}
	if len(value) < 8 {
		return "✅ Set (short)"
	}
	return "✅ Set (secure)"
}
