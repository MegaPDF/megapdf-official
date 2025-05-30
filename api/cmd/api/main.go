package main

import (
	"fmt"
	"log"
	"os"

	"github.com/MegaPDF/megapdf-official/api/docs"
	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/db" // Add this import
	"github.com/MegaPDF/megapdf-official/api/internal/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
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
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}
	docs.SwaggerInfo.BasePath = "/"
	// Load configuration
	cfg := config.LoadConfig()

	// Set Gin mode
	if !cfg.Debug {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize database
	db, err := db.InitDB() // Use db.InitDB instead of config.InitDB
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Create gin router
	r := gin.Default()

	// Set up routes
	routes.SetupRoutes(r, db, cfg)
	printRoutes(r)
	// Create necessary directories
	createDirs(cfg)

	// Start server
	port := fmt.Sprintf(":%d", cfg.Port)
	fmt.Printf("Starting server on http://localhost%s\n", port)
	if err := r.Run(port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
func printRoutes(r *gin.Engine) {
	routes := r.Routes()
	fmt.Println("\nRegistered Routes:")
	fmt.Println("=================")
	for _, route := range routes {
		fmt.Printf("%s %s\n", route.Method, route.Path)
	}
	fmt.Println("=================\n")
}
func createDirs(cfg *config.Config) {
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
		cfg.PublicDir + "/watermarks", // Added
		cfg.PublicDir + "/protected",
		cfg.PublicDir + "/pagenumbers",
		cfg.PublicDir + "/unlocked",
		cfg.PublicDir + "/ocr",
		cfg.PublicDir + "/edited",
		cfg.PublicDir + "/processed",
		cfg.PublicDir + "/unwatermarked", // Added
		cfg.PublicDir + "/redacted",      // Added
		cfg.PublicDir + "/repaired",      // Added
		cfg.PublicDir + "/signatures",    // Added
	}

	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			log.Printf("Failed to create directory %s: %v", dir, err)
		} else {
			log.Printf("Created directory: %s", dir)
		}
	}
}
