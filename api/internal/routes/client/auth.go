package client

import (
	"github.com/MegaPDF/megapdf-official/api/internal/handlers"
	"github.com/MegaPDF/megapdf-official/api/internal/middleware"
	"github.com/gin-gonic/gin"
)

// SetupAuthRoutes sets up authentication routes for client API
func SetupAuthRoutes(r *gin.RouterGroup, authHandler *handlers.AuthHandler, jwtSecret string) {
	auth := r.Group("/auth")
	{
		// Public authentication routes
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
		auth.POST("/logout", authHandler.Logout)
		auth.POST("/verify-email", authHandler.VerifyEmail)
		auth.POST("/resend-verification", authHandler.ResendVerification)
		auth.POST("/forgot-password", authHandler.ForgotPassword)
		auth.POST("/reset-password", authHandler.ResetPassword)
		auth.POST("/refresh-token", authHandler.RefreshToken)

		// Protected authentication routes
		protected := auth.Group("/")
		protected.Use(middleware.AuthMiddleware(jwtSecret))
		{
			protected.GET("/me", authHandler.GetProfile)
			protected.PUT("/password", authHandler.ChangePassword)
		}
	}
}