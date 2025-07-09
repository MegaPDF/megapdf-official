package client

import (
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupNotificationRoutes sets up notification routes for client API
func SetupNotificationRoutes(r *gin.RouterGroup, notificationHandler *handlers.NotificationHandler, jwtSecret string) {
	notifications := r.Group("/notifications")
	notifications.Use(middleware.AuthMiddleware(jwtSecret))
	{
		// Notification operations
		notifications.GET("/", notificationHandler.GetNotifications)
		notifications.PUT("/:id/read", notificationHandler.MarkAsRead)
		notifications.PUT("/read-all", notificationHandler.MarkAllAsRead)
		notifications.DELETE("/:id", notificationHandler.DeleteNotification)
		
		// Notification stats
		notifications.GET("/unread-count", notificationHandler.GetUnreadCount)
		notifications.GET("/settings", notificationHandler.GetNotificationSettings)
		notifications.PUT("/settings", notificationHandler.UpdateNotificationSettings)
	}
}