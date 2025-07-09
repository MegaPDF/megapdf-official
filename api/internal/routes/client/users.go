package client

import (
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupUserRoutes sets up user management routes for client API
func SetupUserRoutes(r *gin.RouterGroup, userHandler *handlers.UserHandler, jwtSecret string) {
	users := r.Group("/users")
	users.Use(middleware.AuthMiddleware(jwtSecret))
	{
		// User profile routes
		users.GET("/profile", userHandler.GetProfile)
		users.PUT("/profile", userHandler.UpdateProfile)
		users.GET("/profile/:id", userHandler.GetUserProfile)
		
		// User search and discovery
		users.GET("/search", userHandler.SearchUsers)
		users.GET("/suggestions", userHandler.GetSuggestions)
		
		// User statistics
		users.GET("/stats", userHandler.GetStats)
	}
}