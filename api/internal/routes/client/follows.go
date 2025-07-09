package client

import (
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupFollowRoutes sets up follow management routes for client API
func SetupFollowRoutes(r *gin.RouterGroup, followHandler *handlers.FollowHandler, jwtSecret string) {
	follows := r.Group("/follows")
	follows.Use(middleware.AuthMiddleware(jwtSecret))
	{
		// Follow/unfollow operations
		follows.POST("/:user_id", followHandler.FollowUser)
		follows.DELETE("/:user_id", followHandler.UnfollowUser)
		
		// Follow lists
		follows.GET("/followers", followHandler.GetFollowers)
		follows.GET("/following", followHandler.GetFollowing)
		follows.GET("/followers/:user_id", followHandler.GetUserFollowers)
		follows.GET("/following/:user_id", followHandler.GetUserFollowing)
		
		// Follow status
		follows.GET("/status/:user_id", followHandler.GetFollowStatus)
	}
}