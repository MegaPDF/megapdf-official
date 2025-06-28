// cmd/api/main.go - Updated with Settings Integration
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

	// Initialize SQLite database FIRST (before loading config)
	fmt.Println("Initializing SQLite database connection...")
	database, err := db.InitDB()
	if err != nil {
		log.Fatalf("Failed to initialize SQLite database: %v", err)
	}
	fmt.Println("SQLite database connected successfully")

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

	// Verify database file exists and log its location
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = os.Getenv("SQLITE_PATH")
		if dbPath == "" {
			dbPath = "data/megapdf.db"
		}
	}

	if _, err := os.Stat(dbPath); err == nil {
		fmt.Printf("SQLite database file: %s\n", dbPath)
	} else {
		log.Printf("Warning: SQLite database file not found at %s\n", dbPath)
	}

	// Create gin router
	r := gin.Default()

	if err != nil {
		log.Fatalf("Failed to get underlying sql.DB: %v", err)
	}
	// Set up routes with current configuration
	fmt.Println("Setting up routes...")
	routes.SetupRoutes(r, database, cfg)

	// Print registered routes
	printRoutes(r)

	// Create necessary directories (including data directory for SQLite)
	createDirectories(cfg)

	// Optional: Migrate environment variables to database settings
	// Uncomment the following lines if you want to migrate .env values to database
	/*
		fmt.Println("Checking for environment variable migration...")
		if err := db.MigrateEnvToSettings(database); err != nil {
			log.Printf("Warning: Failed to migrate environment variables: %v", err)
		}
	*/

	// Start server
	port := fmt.Sprintf(":%d", cfg.Port)
	fmt.Printf("Starting server on port %d...\n", cfg.Port)
	fmt.Printf("API documentation available at: http://localhost%s/swagger/index.html\n", port)
	fmt.Printf("Admin dashboard available at: http://localhost%s/admin\n", port)
	fmt.Println("Settings management available in admin dashboard -> Settings tab")

	if err := r.Run(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// createDirectories creates necessary directories including data directory for SQLite
func createDirectories(cfg *config.Config) {
	fmt.Println("Creating necessary directories...")

	directories := []string{
		cfg.TempDir,
		cfg.UploadDir,
		cfg.PublicDir,
		"data",    // SQLite database directory
		"uploads", // Default uploads directory
		"temp",    // Default temp directory
		"logs",    // Logs directory (if you add logging later)
	}

	for _, dir := range directories {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Printf("Warning: Failed to create directory %s: %v", dir, err)
		} else {
			fmt.Printf("Directory ensured: %s\n", dir)
		}
	}
}

// printRoutes prints all registered routes
func printRoutes(r *gin.Engine) {
	fmt.Println("\n=== Registered Routes ===")
	routes := r.Routes()

	// Group routes by prefix for better readability
	routeGroups := make(map[string][]gin.RouteInfo)

	for _, route := range routes {
		prefix := "/"
		if len(route.Path) > 1 {
			parts := strings.Split(route.Path[1:], "/")
			if len(parts) > 0 {
				prefix = "/" + parts[0]
			}
		}
		routeGroups[prefix] = append(routeGroups[prefix], route)
	}

	// Print routes grouped by prefix
	for prefix, groupRoutes := range routeGroups {
		fmt.Printf("\n%s:\n", prefix)
		for _, route := range groupRoutes {
			fmt.Printf("  %-8s %s\n", route.Method, route.Path)
		}
	}

	fmt.Printf("\nTotal routes: %d\n", len(routes))

	// Show important endpoints
	fmt.Println("\n=== Important Endpoints ===")
	fmt.Printf("Admin Dashboard: GET    /admin\n")
	fmt.Printf("Settings API:    GET    /api/admin/settings\n")
	fmt.Printf("Settings API:    PUT    /api/admin/settings\n")
	fmt.Printf("API Docs:        GET    /swagger/index.html\n")
}
