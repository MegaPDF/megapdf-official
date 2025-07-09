package client

import (
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupSearchRoutes sets up search functionality routes for client API
func SetupSearchRoutes(r *gin.RouterGroup, searchHandler *handlers.SearchHandler, jwtSecret string) {
	search := r.Group("/search")
	{
		// Public search routes
		search.GET("/posts", searchHandler.SearchPosts)
		search.GET("/users", searchHandler.SearchUsers)
		search.GET("/hashtags", searchHandler.SearchHashtags)
		
		// Protected search routes
		protected := search.Group("/")
		protected.Use(middleware.AuthMiddleware(jwtSecret))
		{
			protected.GET("/history", searchHandler.GetSearchHistory)
			protected.POST("/history", searchHandler.SaveSearchHistory)
			protected.DELETE("/history/:id", searchHandler.DeleteSearchHistory)
		}
	}
}