package admin

import (
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupUserManagementRoutes sets up user management routes for admin API
func SetupUserManagementRoutes(r *gin.RouterGroup, userManagementHandler *handlers.UserManagementHandler, jwtSecret string) {
	users := r.Group("/users")
	users.Use(middleware.AuthMiddleware(jwtSecret))
	users.Use(middleware.AdminMiddleware(jwtSecret))
	{
		// User management
		users.GET("/", userManagementHandler.GetUsers)
		users.GET("/:id", userManagementHandler.GetUser)
		users.PUT("/:id", userManagementHandler.UpdateUser)
		users.DELETE("/:id", userManagementHandler.DeleteUser)
		
		// User status management
		users.POST("/:id/suspend", userManagementHandler.SuspendUser)
		users.POST("/:id/unsuspend", userManagementHandler.UnsuspendUser)
		users.POST("/:id/verify", userManagementHandler.VerifyUser)
		users.POST("/:id/unverify", userManagementHandler.UnverifyUser)
		
		// User activity monitoring
		users.GET("/:id/activity", userManagementHandler.GetUserActivity)
		users.GET("/:id/posts", userManagementHandler.GetUserPosts)
		users.GET("/:id/reports", userManagementHandler.GetUserReports)
		
		// Bulk operations
		users.POST("/bulk/suspend", userManagementHandler.BulkSuspendUsers)
		users.POST("/bulk/delete", userManagementHandler.BulkDeleteUsers)
	}
}