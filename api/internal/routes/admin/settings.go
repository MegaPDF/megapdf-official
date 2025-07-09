package admin

import (
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupSettingsRoutes sets up settings management routes for admin API
func SetupSettingsRoutes(r *gin.RouterGroup, settingsHandler *handlers.SettingsHandler, jwtSecret string) {
	settings := r.Group("/settings")
	settings.Use(middleware.AuthMiddleware(jwtSecret))
	settings.Use(middleware.AdminMiddleware(jwtSecret))
	{
		// General settings
		settings.GET("/", settingsHandler.GetSettings)
		settings.PUT("/", settingsHandler.UpdateSettings)
		settings.GET("/:key", settingsHandler.GetSetting)
		settings.PUT("/:key", settingsHandler.UpdateSetting)
		
		// SMTP configuration
		settings.GET("/smtp", settingsHandler.GetSMTPSettings)
		settings.PUT("/smtp", settingsHandler.UpdateSMTPSettings)
		settings.POST("/smtp/test", settingsHandler.TestSMTPConnection)
		
		// AWS S3 settings
		settings.GET("/s3", settingsHandler.GetS3Settings)
		settings.PUT("/s3", settingsHandler.UpdateS3Settings)
		settings.POST("/s3/test", settingsHandler.TestS3Connection)
		
		// Platform configuration
		settings.GET("/platform", settingsHandler.GetPlatformSettings)
		settings.PUT("/platform", settingsHandler.UpdatePlatformSettings)
		
		// Security settings
		settings.GET("/security", settingsHandler.GetSecuritySettings)
		settings.PUT("/security", settingsHandler.UpdateSecuritySettings)
		
		// Branding settings
		settings.GET("/branding", settingsHandler.GetBrandingSettings)
		settings.PUT("/branding", settingsHandler.UpdateBrandingSettings)
		settings.POST("/branding/logo", settingsHandler.UploadLogo)
		settings.POST("/branding/favicon", settingsHandler.UploadFavicon)
	}
}