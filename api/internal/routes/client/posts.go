package client

import (
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupPostRoutes sets up post management routes for client API
func SetupPostRoutes(r *gin.RouterGroup, socialHandler *handlers.SocialHandler, jwtSecret string) {
	posts := r.Group("/posts")
	{
		// Public routes
		posts.GET("/", socialHandler.GetPosts)
		posts.GET("/:id", socialHandler.GetPost)
		
		// Protected routes
		protected := posts.Group("/")
		protected.Use(middleware.AuthMiddleware(jwtSecret))
		{
			protected.POST("/", socialHandler.CreatePost)
			protected.PUT("/:id", socialHandler.UpdatePost)
			protected.DELETE("/:id", socialHandler.DeletePost)
			protected.POST("/:id/like", socialHandler.LikePost)
		}
	}
}