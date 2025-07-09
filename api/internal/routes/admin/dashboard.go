package admin

import (
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupDashboardRoutes sets up dashboard analytics routes for admin API
func SetupDashboardRoutes(r *gin.RouterGroup, dashboardHandler *handlers.DashboardHandler, jwtSecret string) {
	dashboard := r.Group("/dashboard")
	dashboard.Use(middleware.AuthMiddleware(jwtSecret))
	dashboard.Use(middleware.AdminMiddleware(jwtSecret))
	{
		// Dashboard overview
		dashboard.GET("/overview", dashboardHandler.GetOverview)
		dashboard.GET("/stats", dashboardHandler.GetStats)
		
		// User analytics
		dashboard.GET("/users/stats", dashboardHandler.GetUserStats)
		dashboard.GET("/users/growth", dashboardHandler.GetUserGrowth)
		dashboard.GET("/users/engagement", dashboardHandler.GetUserEngagement)
		
		// Content analytics
		dashboard.GET("/posts/stats", dashboardHandler.GetPostStats)
		dashboard.GET("/posts/trending", dashboardHandler.GetTrendingPosts)
		dashboard.GET("/posts/performance", dashboardHandler.GetPostPerformance)
		
		// Platform analytics
		dashboard.GET("/platform/activity", dashboardHandler.GetPlatformActivity)
		dashboard.GET("/platform/metrics", dashboardHandler.GetPlatformMetrics)
	}
}