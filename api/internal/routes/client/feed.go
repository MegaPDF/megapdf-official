package client

import (
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupFeedRoutes sets up feed generation routes for client API
func SetupFeedRoutes(r *gin.RouterGroup, feedHandler *handlers.FeedHandler, jwtSecret string) {
	feed := r.Group("/feed")
	{
		// Public feed
		feed.GET("/public", feedHandler.GetPublicFeed)
		
		// Protected feed routes
		protected := feed.Group("/")
		protected.Use(middleware.AuthMiddleware(jwtSecret))
		{
			protected.GET("/", feedHandler.GetPersonalFeed)
			protected.GET("/following", feedHandler.GetFollowingFeed)
			protected.GET("/trending", feedHandler.GetTrendingFeed)
			protected.GET("/user/:user_id", feedHandler.GetUserFeed)
		}
	}
}