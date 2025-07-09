// internal/routes/routes.go - Updated with environment management
package routes

import (
	"fmt"
	"net/http"
	"path/filepath"
	"reflect"
	"strings"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"gorm.io/gorm"
)

func maskPassword(password string) string {
	if password != "" {
		return "********"
	}
	return "[not set]"
}

func SetupRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	fmt.Println("Setting up routes with environment variable management...")

	// Log configuration (from environment variables)
	fmt.Println("Configuration loaded from environment variables:")
	fmt.Printf("  SMTP Host: %s\n", cfg.SMTPHost)
	fmt.Printf("  SMTP Port: %d\n", cfg.SMTPPort)
	fmt.Printf("  SMTP User: %s\n", cfg.SMTPUser)
	fmt.Printf("  SMTP Pass: %s\n", maskPassword(cfg.SMTPPass))
	fmt.Printf("  Email From: %s\n", cfg.EmailFrom)
	fmt.Printf("  App URL: %s\n", cfg.AppURL)
	fmt.Printf("  API URL: %s\n", cfg.APIUrl)
	fmt.Printf("  Debug Mode: %v\n", cfg.Debug)
	fmt.Printf("  JWT Secret: %s\n", maskPassword(cfg.JWTSecret))

	// Apply CORS middleware globally
	r.Use(middleware.CORSMiddleware())
	r.Use(middleware.LoggerMiddleware())
	r.Use(middleware.RateLimitMiddleware())
	r.Use(func(c *gin.Context) {
		now := time.Now().UTC()
		c.Set("now", map[string]interface{}{
			"date": now.Format(time.RFC3339),
		})
		c.Next()
	})

	// Set development mode info in context
	mode := "production"
	if cfg.Debug {
		mode = "development"
		r.Use(func(c *gin.Context) {
			c.Set("mode", "development")
			c.Next()
		})
	} else {
		r.Use(func(c *gin.Context) {
			c.Set("mode", "production")
			c.Next()
		})
	}
	r.Static("/uploads", "./public/uploads")
	r.Static("/admin-assets", "./templates/assets")
	// Load HTML templates with proper pattern
	r.LoadHTMLGlob("templates/*.html")
	fmt.Println("Running in", mode, "mode")
	fmt.Println("Templates loaded from: api/templates/**/*")
	// Initialize services
	keyValidationService := services.NewKeyValidationService(db)
	balanceService := services.NewBalanceService(db)
	authService := services.NewAuthService(db, cfg.JWTSecret)
	apiKeyService := services.NewApiKeyService(db)
	emailService := services.NewEmailService(cfg)
	pdfHandler := handlers.NewPDFHandler(balanceService, cfg)
	// Initialize handlers
	keyValidationHandler := handlers.NewKeyValidationHandler(keyValidationService)
	balanceHandler := handlers.NewBalanceHandler(balanceService)
	authHandler := handlers.NewAuthHandler(authService, cfg.JWTSecret, cfg)
	trackUsageHandler := handlers.NewTrackUsageHandler()
	apiKeyHandler := handlers.NewApiKeyHandler(apiKeyService)
	fileHandler := handlers.NewFileHandler(cfg)
	pricingHandler := handlers.NewPricingHandler(db, cfg)
	paypalWebhookHandler := handlers.NewPayPalWebhookHandler()
	adminHandler := handlers.NewAdminHandler(cfg, db)
	fmt.Println("Setting email service on auth handler")
	authHandler.SetEmailService(emailService)
	invoiceHandler := handlers.NewInvoiceHandler(balanceService, cfg)
	ocrHandler := handlers.NewOcrHandler(balanceService, cfg)
	toolStatusHandler := handlers.NewToolStatusHandler()
	pdfTextEditorHandler := handlers.NewPDFTextEditorHandler(balanceService, cfg)
	cleanupHandler := handlers.NewCleanupHandler(cfg)
	oauthService := services.NewOAuthService(db, cfg.JWTSecret, cfg.GoogleClientID, cfg.GoogleClientSecret, cfg.OAuthRedirectURL)
	oauthHandler := handlers.NewOAuthHandler(oauthService, cfg.AppURL, cfg.APIUrl)
	signPdfHandler := handlers.NewSignPdfHandler(
		cfg.UploadDir,
		filepath.Join(cfg.PublicDir, "signatures"),
	)

	if balanceHandlerType := reflect.TypeOf(balanceHandler); balanceHandlerType != nil {
		if method, exists := balanceHandlerType.MethodByName("SetEmailService"); exists {
			fmt.Println("Setting email service on balance handler")
			reflect.ValueOf(balanceHandler).Method(method.Index).Call([]reflect.Value{reflect.ValueOf(emailService)})
		} else {
			fmt.Println("Balance handler does not have SetEmailService method yet")
		}
	}

	api := r.Group("/api")
	{
		pricing := api.Group("/pricing")
		{
			pricing.GET("", pricingHandler.GetPublicPricing)                         // GET /api/pricing
			pricing.GET("/operation/:operation", pricingHandler.GetOperationPricing) // GET /api/pricing/operation/compress
			pricing.POST("/calculate", pricingHandler.CalculatePricing)              // POST /api/pricing/calculate
		}
		branding := api.Group("/branding")
		{
			branding.GET("/branding", adminHandler.GetBranding)
		}
		api.GET("/tools/status", toolStatusHandler.GetToolStatus)
		api.POST("/validate-key", keyValidationHandler.ValidateKey)
		api.GET("/validate-key", keyValidationHandler.ValidateKey)
		api.POST("/webhooks/paypal", paypalWebhookHandler.HandleWebhook)

		// Simplified token validation without database settings dependency
		api.GET("/validate-token", func(c *gin.Context) {
			var token string
			cookieToken, err := c.Cookie("authToken")
			if err == nil && cookieToken != "" {
				token = cookieToken
			} else {
				authHeader := c.GetHeader("Authorization")
				if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
					token = strings.TrimPrefix(authHeader, "Bearer ")
				}
			}

			if token == "" {
				c.JSON(http.StatusUnauthorized, gin.H{
					"valid": false,
					"error": "No token provided",
				})
				return
			}

			userID, err := authService.ValidateToken(token)
			if err != nil {
				fmt.Printf("[AUTH] Token validation failed: %v\n", err)
				c.JSON(http.StatusUnauthorized, gin.H{
					"valid": false,
					"error": "Invalid token",
				})
				return
			}

			var user models.User
			if err := db.First(&user, "id = ?", userID).Error; err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{
					"valid": false,
					"error": "User not found",
				})
				return
			}

			c.JSON(http.StatusOK, gin.H{
				"valid":  true,
				"userId": userID,
				"role":   user.Role,
			})
		})

		api.GET("/file", fileHandler.ServeFile)
		api.GET("/track-usage", middleware.AuthMiddleware(cfg.JWTSecret), trackUsageHandler.GetUsageStats)
		api.POST("/track-usage", middleware.AuthMiddleware(cfg.JWTSecret), trackUsageHandler.TrackOperation)
		api.POST("/ocr", middleware.ApiKeyMiddleware(keyValidationService), ocrHandler.OcrPdf)
		api.POST("/ocr/extract", middleware.ApiKeyMiddleware(keyValidationService), ocrHandler.ExtractText)

		auth := api.Group("/auth")
		{
			auth.GET("/google", oauthHandler.GoogleAuth)
			auth.GET("/google/callback", oauthHandler.GoogleCallback)
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/reset-password", authHandler.RequestPasswordReset)
			auth.POST("/reset-password/confirm", authHandler.ResetPassword)
			auth.GET("/validate", authHandler.ValidateToken)
			auth.GET("/verify-email", authHandler.VerifyEmail)
			auth.POST("/verify-email", middleware.AuthMiddleware(cfg.JWTSecret), authHandler.ResendVerificationEmail)
			auth.GET("/token-info", authHandler.GetResetTokenInfo)

			auth.POST("/logout", func(c *gin.Context) {
				var token string
				cookieToken, err := c.Cookie("authToken")
				if err == nil {
					token = cookieToken
				} else {
					authHeader := c.GetHeader("Authorization")
					if strings.HasPrefix(authHeader, "Bearer ") {
						token = strings.TrimPrefix(authHeader, "Bearer ")
					}
				}

				if token != "" {
					result := db.Where("session_token = ?", token).Delete(&models.Session{})
					if result.Error != nil {
						fmt.Printf("[LOGOUT] Error deleting session: %v\n", result.Error)
					} else {
						fmt.Printf("[LOGOUT] Deleted %d sessions\n", result.RowsAffected)
					}
				}

				c.SetCookie("authToken", "", -1, "/", "", false, true)
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"message": "Logged out successfully",
				})
			})
		}

		pdf := api.Group("/pdf")
		pdf.Use(middleware.PDFToolAvailabilityMiddleware())
		pdf.Use(middleware.ApiKeyMiddleware(keyValidationService))
		{
			pdf.GET("/cleanup", cleanupHandler.Cleanup)
			pdf.POST("/compress", pdfHandler.CompressPDF)
			pdf.POST("/convert", pdfHandler.ConvertPDF)
			pdf.POST("/protect", pdfHandler.ProtectPDF)
			pdf.POST("/merge", pdfHandler.MergePDFs)
			pdf.POST("/split", pdfHandler.SplitPDF)
			pdf.GET("/split/status", pdfHandler.GetSplitStatus)
			pdf.POST("/rotate", pdfHandler.RotatePDF)
			pdf.POST("/pagenumber", pdfHandler.AddPageNumbersToPDF)
			pdf.POST("/remove", pdfHandler.RemovePagesFromPDF)
			pdf.POST("/watermark", pdfHandler.WatermarkPDF)
			pdf.POST("/unlock", pdfHandler.UnlockPDF)
			pdf.POST("/sign", signPdfHandler.SignPDF)
			pdf.POST("/extract-text", pdfTextEditorHandler.ExtractTextToPDF)
			pdf.POST("/save-edited-text", pdfTextEditorHandler.SaveEditedPDF)
			pdf.GET("/edit-session", pdfTextEditorHandler.GetEditSession)
			pdf.POST("/generate-invoice", invoiceHandler.GenerateInvoice)
			pdf.GET("/invoice-templates", invoiceHandler.GetInvoiceTemplates)
			pdf.POST("/create-invoice-template", invoiceHandler.CreateInvoiceTemplate)
		}

		user := api.Group("/user")
		user.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			user.GET("/balance", balanceHandler.GetBalance)
			user.POST("/deposit", balanceHandler.CreateDeposit)
			user.POST("/deposit/verify", balanceHandler.VerifyDeposit)
			user.GET("/profile", handlers.GetUserProfile)
			user.PUT("/profile", handlers.UpdateUserProfile)
			user.PUT("/password", handlers.ChangeUserPassword)
		}

		keys := api.Group("/keys")
		keys.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		{
			keys.GET("", apiKeyHandler.ListKeys)
			keys.POST("", apiKeyHandler.CreateKey)
			keys.DELETE("/:id", apiKeyHandler.RevokeKey)
		}
		admin := api.Group("/admin")
		// First apply auth middleware, then admin middleware
		admin.Use(middleware.AuthMiddleware(cfg.JWTSecret))
		admin.Use(middleware.AdminMiddleware(cfg.JWTSecret))
		{
			// Dashboard
			admin.GET("/dashboard", adminHandler.GetDashboard)

			// Settings Management
			admin.GET("/settings", adminHandler.GetSettings)
			admin.PUT("/settings", adminHandler.UpdateSettings)

			// Configuration
			admin.GET("/config/app", adminHandler.GetAppConfig)
			admin.GET("/config/paypal", adminHandler.GetPayPalConfig)
			admin.GET("/config/smtp", adminHandler.GetSMTPConfig)
			admin.GET("/config/security", adminHandler.GetSecurityConfig)

			// User Management
			admin.GET("/users", adminHandler.GetUsers)
			admin.GET("/users/:id", adminHandler.GetUser)
			admin.PUT("/users/:id", adminHandler.UpdateUser)
			admin.DELETE("/users/:id", adminHandler.DeleteUser)

			// PDF Tools Management
			admin.GET("/tools", adminHandler.GetPDFTools)
			admin.PUT("/tools/:id", adminHandler.UpdateToolStatus)
			admin.POST("/tools/enable-all", adminHandler.EnableAllTools)
			admin.POST("/tools/disable-all", adminHandler.DisableAllTools)

			// Pricing Management
			admin.GET("/pricing", adminHandler.GetPricing)
			admin.PUT("/pricing", adminHandler.UpdatePricing)
			admin.GET("/branding", adminHandler.GetBranding)
			admin.PUT("/branding", adminHandler.UpdateBranding)
			admin.POST("/branding/reset", adminHandler.ResetBranding)
			admin.POST("/branding/upload", adminHandler.UploadBrandingImage)
		}

	}
	// Admin Panel Static Route (outside API group)
	r.GET("/admin/index.html", adminHandler.ServeAdminPanel)
	// Add email preview route in development mode
	if cfg.Debug {
		r.GET("/email-preview", func(c *gin.Context) {
			c.HTML(http.StatusOK, "email_preview.html", gin.H{
				"title": "Email Preview",
				"body":  "This is a preview of an email that would be sent in production mode.",
			})
		})
	}

	// Swagger documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":        "ok",
			"config_source": "environment_variables",
		})
	})

	fmt.Println("Routes setup complete - including environment variable management")
}
