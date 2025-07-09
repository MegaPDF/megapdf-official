package client

import (
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupUploadRoutes sets up file upload routes for client API
func SetupUploadRoutes(r *gin.RouterGroup, uploadHandler *handlers.UploadHandler, jwtSecret string) {
	upload := r.Group("/upload")
	upload.Use(middleware.AuthMiddleware(jwtSecret))
	{
		// File upload operations
		upload.POST("/image", uploadHandler.UploadImage)
		upload.POST("/video", uploadHandler.UploadVideo)
		upload.POST("/avatar", uploadHandler.UploadAvatar)
		upload.POST("/cover", uploadHandler.UploadCover)
		
		// File management
		upload.DELETE("/:file_id", uploadHandler.DeleteFile)
		upload.GET("/presigned/:file_id", uploadHandler.GetPresignedURL)
	}
}