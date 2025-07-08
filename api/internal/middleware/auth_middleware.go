package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// AuthMiddleware authenticates users via JWT token with detailed logging
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip authentication for certain endpoints
		skipPaths := []string{
			"/api/validate-token",
			"/api/auth/reset-password",
			"/api/auth/login",
			"/api/auth/register",
			"/api/auth/google",
			"/api/webhooks",
			"/health",
		}

		requestPath := c.Request.URL.Path
		for _, path := range skipPaths {
			if strings.Contains(requestPath, path) {
				c.Next()
				return
			}
		}

		var token string
		authSource := "none"
		clientIP := c.ClientIP()
		userAgent := c.GetHeader("User-Agent")

		// Log incoming request
		fmt.Printf("[AUTH] %s - %s %s from %s\n",
			time.Now().Format("2006-01-02 15:04:05"),
			c.Request.Method, requestPath, clientIP)

		// Try to get token from Authorization header first
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			token = strings.TrimPrefix(authHeader, "Bearer ")
			authSource = "header"
		}

		// If no token in header, try cookie
		if token == "" {
			cookieToken, err := c.Cookie("authToken")
			if err == nil && cookieToken != "" {
				token = cookieToken
				authSource = "cookie"
			}
		}

		// Safely truncate user agent for logging
		userAgentTruncated := userAgent
		if len(userAgent) > 50 {
			userAgentTruncated = userAgent[:50]
		}

		fmt.Printf("[AUTH] Token source: %s, Has token: %v, User-Agent: %s\n",
			authSource, token != "", userAgentTruncated)

		if token == "" {
			fmt.Printf("[AUTH] FAILED - No token provided for %s from %s\n", requestPath, clientIP)
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "Authentication required",
				"details": "No authentication token provided. Please log in.",
				"code":    "NO_TOKEN",
			})
			c.Abort()
			return
		}

		// Validate token using environment-based JWT secret
		authService := services.NewAuthService(db.DB, jwtSecret)
		userID, err := authService.ValidateToken(token)
		if err != nil {
			fmt.Printf("[AUTH] FAILED - Token validation error for %s from %s: %v\n", requestPath, clientIP, err)

			// Detailed session checking for troubleshooting
			var session models.Session
			sessionErr := db.DB.Where("session_token = ?", token).First(&session).Error

			if sessionErr == gorm.ErrRecordNotFound {
				fmt.Printf("[AUTH] FAILED - Session not found in database for %s\n", clientIP)
				c.JSON(http.StatusUnauthorized, gin.H{
					"error":   "Session not found",
					"details": "Your session was not found. Please log in again.",
					"code":    "SESSION_NOT_FOUND",
				})
			} else if sessionErr == nil && session.Expires.Before(time.Now()) {
				fmt.Printf("[AUTH] FAILED - Session expired for user %s (expired: %v)\n", session.UserID, session.Expires)
				c.JSON(http.StatusUnauthorized, gin.H{
					"error":   "Session expired",
					"details": "Your session has expired. Please log in again.",
					"code":    "SESSION_EXPIRED",
				})
			} else if sessionErr != nil {
				fmt.Printf("[AUTH] FAILED - Database error checking session: %v\n", sessionErr)
				c.JSON(http.StatusUnauthorized, gin.H{
					"error":   "Authentication error",
					"details": "Unable to verify session. Please try logging in again.",
					"code":    "SESSION_ERROR",
				})
			} else {
				fmt.Printf("[AUTH] FAILED - Token parsing/validation error: %v\n", err)
				c.JSON(http.StatusUnauthorized, gin.H{
					"error":   "Invalid token",
					"details": "Authentication token is invalid. Please log in again.",
					"code":    "INVALID_TOKEN",
				})
			}
			c.Abort()
			return
		}

		// Verify user exists and is active
		var user models.User
		if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
			fmt.Printf("[AUTH] FAILED - User not found for ID %s: %v\n", userID, err)
			c.JSON(http.StatusUnauthorized, gin.H{
				"error":   "User not found",
				"details": "Your user account was not found. Please contact support.",
				"code":    "USER_NOT_FOUND",
			})
			c.Abort()
			return
		}

		// Update session last activity (optional, doesn't fail auth if it errors)
		updateErr := db.DB.Model(&models.Session{}).
			Where("session_token = ?", token).
			Update("updated_at", time.Now()).Error
		if updateErr != nil {
			fmt.Printf("[AUTH] Warning: Failed to update session activity: %v\n", updateErr)
		}

		// Log successful authentication
		fmt.Printf("[AUTH] SUCCESS - User %s (%s, role: %s) authenticated for %s from %s\n",
			userID, user.Email, user.Role, requestPath, clientIP)

		// Store user information in context - FIXED: Use consistent key names
		c.Set("userID", userID) // Use userID (matches admin handler expectation)
		c.Set("userId", userID) // Also set userId for backward compatibility
		c.Set("userEmail", user.Email)
		c.Set("userRole", user.Role)
		c.Set("authSource", authSource)

		c.Next()
	}
}

// Helper function
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
