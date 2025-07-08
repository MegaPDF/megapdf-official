package middleware

import (
	"net/http"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AdminMiddleware ensures only admin users can access admin routes
func AdminMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from header or cookie
		var tokenString string

		// Try cookie first
		if cookieToken, err := c.Cookie("authToken"); err == nil {
			tokenString = cookieToken
		} else {
			// Try Authorization header
			authHeader := c.GetHeader("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString = strings.TrimPrefix(authHeader, "Bearer ")
			}
		}

		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "No authentication token provided",
			})
			c.Abort()
			return
		}

		// Parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid authentication token",
			})
			c.Abort()
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid token claims",
			})
			c.Abort()
			return
		}

		userID, ok := claims["sub"].(string)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Invalid user ID in token",
			})
			c.Abort()
			return
		}

		// Get user from database using global DB connection
		var user models.User
		if err := db.DB.Where("id = ?", userID).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "User not found",
			})
			c.Abort()
			return
		}

		// Check if user is admin
		if user.Role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Admin access required",
			})
			c.Abort()
			return
		}

		// Set user in context with the correct key names to match what the handler expects
		c.Set("userID", userID) // Note: userID not userId
		c.Set("userRole", user.Role)
		c.Set("user", user)

		c.Next()
	}
}
