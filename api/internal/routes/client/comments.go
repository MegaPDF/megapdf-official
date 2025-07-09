package client

import (
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupCommentRoutes sets up comment management routes for client API
func SetupCommentRoutes(r *gin.RouterGroup, commentHandler *handlers.CommentHandler, jwtSecret string) {
	comments := r.Group("/comments")
	comments.Use(middleware.AuthMiddleware(jwtSecret))
	{
		// Comment CRUD operations
		comments.POST("/", commentHandler.CreateComment)
		comments.GET("/post/:post_id", commentHandler.GetCommentsByPost)
		comments.PUT("/:id", commentHandler.UpdateComment)
		comments.DELETE("/:id", commentHandler.DeleteComment)
		
		// Comment interactions
		comments.POST("/:id/like", commentHandler.LikeComment)
		comments.POST("/:id/reply", commentHandler.ReplyToComment)
	}
}