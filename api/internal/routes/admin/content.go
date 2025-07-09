package admin

import (
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupContentManagementRoutes sets up content management routes for admin API
func SetupContentManagementRoutes(r *gin.RouterGroup, contentHandler *handlers.ContentManagementHandler, jwtSecret string) {
	content := r.Group("/content")
	content.Use(middleware.AuthMiddleware(jwtSecret))
	content.Use(middleware.AdminMiddleware(jwtSecret))
	{
		// Post management
		posts := content.Group("/posts")
		{
			posts.GET("/", contentHandler.GetPosts)
			posts.GET("/:id", contentHandler.GetPost)
			posts.PUT("/:id", contentHandler.UpdatePost)
			posts.DELETE("/:id", contentHandler.DeletePost)
			posts.POST("/:id/hide", contentHandler.HidePost)
			posts.POST("/:id/unhide", contentHandler.UnhidePost)
			posts.POST("/bulk/delete", contentHandler.BulkDeletePosts)
		}
		
		// Comment management
		comments := content.Group("/comments")
		{
			comments.GET("/", contentHandler.GetComments)
			comments.GET("/:id", contentHandler.GetComment)
			comments.PUT("/:id", contentHandler.UpdateComment)
			comments.DELETE("/:id", contentHandler.DeleteComment)
			comments.POST("/:id/hide", contentHandler.HideComment)
			comments.POST("/:id/unhide", contentHandler.UnhideComment)
			comments.POST("/bulk/delete", contentHandler.BulkDeleteComments)
		}
		
		// Report management
		reports := content.Group("/reports")
		{
			reports.GET("/", contentHandler.GetReports)
			reports.GET("/:id", contentHandler.GetReport)
			reports.PUT("/:id", contentHandler.UpdateReport)
			reports.POST("/:id/resolve", contentHandler.ResolveReport)
			reports.POST("/:id/dismiss", contentHandler.DismissReport)
			reports.POST("/bulk/resolve", contentHandler.BulkResolveReports)
		}
	}
}