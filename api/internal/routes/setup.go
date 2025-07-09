package routes

import (
	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/routes/client"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// SetupSocialRoutes sets up the social network routes
func SetupSocialRoutes(r *gin.Engine, db *gorm.DB, cfg *config.Config) {
	// Initialize handlers (these will be created as needed)
	authHandler := handlers.NewAuthHandler(nil, cfg.JWTSecret, cfg) // Will be updated with proper service
	
	// API v1 routes
	v1 := r.Group("/api/v1")
	{
		// Client API routes
		clientAPI := v1.Group("/client")
		{
			client.SetupAuthRoutes(clientAPI, authHandler, cfg.JWTSecret)
			
			// These routes will be set up once the handlers are created
			// client.SetupUserRoutes(clientAPI, userHandler, cfg.JWTSecret)
			// client.SetupPostRoutes(clientAPI, socialHandler, cfg.JWTSecret)
			// client.SetupCommentRoutes(clientAPI, commentHandler, cfg.JWTSecret)
			// client.SetupFollowRoutes(clientAPI, followHandler, cfg.JWTSecret)
			// client.SetupUploadRoutes(clientAPI, uploadHandler, cfg.JWTSecret)
			// client.SetupNotificationRoutes(clientAPI, notificationHandler, cfg.JWTSecret)
			// client.SetupFeedRoutes(clientAPI, feedHandler, cfg.JWTSecret)
			// client.SetupSearchRoutes(clientAPI, searchHandler, cfg.JWTSecret)
		}
		
		// Admin API routes will be added later
		// adminAPI := v1.Group("/admin")
		// {
		// 	// These routes will be set up once the handlers are created
		// 	// admin.SetupDashboardRoutes(adminAPI, dashboardHandler, cfg.JWTSecret)
		// 	// admin.SetupUserManagementRoutes(adminAPI, userManagementHandler, cfg.JWTSecret)
		// 	// admin.SetupContentManagementRoutes(adminAPI, contentHandler, cfg.JWTSecret)
		// 	// admin.SetupSettingsRoutes(adminAPI, settingsHandler, cfg.JWTSecret)
		// }
	}
}