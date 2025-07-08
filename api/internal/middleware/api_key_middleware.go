// internal/middleware/api_key_middleware.go
package middleware

import (
	"net/http"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
)

// ApiKeyMiddleware validates API key and checks permissions
func ApiKeyMiddleware(keyService *services.KeyValidationService) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get operation from path
		path := c.Request.URL.Path
		pathParts := strings.Split(path, "/")
		operation := ""

		// Extract operation from path
		if len(pathParts) > 2 && pathParts[1] == "api" {
			if len(pathParts) > 3 && pathParts[2] == "pdf" {
				// For PDF operations like /api/pdf/compress, use the actual operation name
				operation = pathParts[3]
			} else {
				// For other operations, use the second path part
				operation = pathParts[2]
			}
		}

		// Check if this is a web UI request
		isWebsiteRequest := false

		// Method 1: Check for browser-like requests
		userAgent := c.GetHeader("User-Agent")
		accept := c.GetHeader("Accept")
		referer := c.GetHeader("Referer")
		origin := c.GetHeader("Origin")

		// Check user agent and accept header for browser characteristics
		if strings.Contains(accept, "text/html") && (strings.Contains(userAgent, "Mozilla/") ||
			strings.Contains(userAgent, "Chrome/") ||
			strings.Contains(userAgent, "Safari/") ||
			strings.Contains(userAgent, "Firefox/") ||
			strings.Contains(userAgent, "Edge/")) {
			isWebsiteRequest = true
		}

		// Method 2: Check origin/referer against allowed domains
		allowedDomains := []string{
			"mega-pdf.com",
			"www.mega-pdf.com",
			"localhost:3000",
			"127.0.0.1",
		}

		if referer != "" {
			for _, domain := range allowedDomains {
				if strings.Contains(referer, domain) {
					isWebsiteRequest = true
					break
				}
			}
		}

		if origin != "" {
			for _, domain := range allowedDomains {
				if strings.Contains(origin, domain) {
					isWebsiteRequest = true
					break
				}
			}
		}

		// BYPASS DATABASE COMPLETELY for website requests
		if isWebsiteRequest {
			// Set all necessary context values without database queries
			c.Set("userId", "website-user")
			c.Set("operationType", operation)
			c.Set("isWebsiteRequest", true)
			c.Set("freeOperationsRemaining", 999) // Unlimited for website
			c.Set("balance", 9999.0)              // High balance for website

			// Skip all further authentication/validation
			c.Next()
			return
		}

		// For non-website requests, perform normal API key validation
		apiKey := c.GetHeader("x-api-key")
		if apiKey == "" {
			apiKey = c.Query("api_key")
		}

		// Regular API key validation - DATABASE QUERY HAPPENS HERE
		// This won't execute for website requests since we've already called c.Next() and returned
		result, err := keyService.ValidateKey(apiKey, operation)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Error validating API key: " + err.Error(),
			})
			c.Abort()
			return
		}

		if !result.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": result.Error,
			})
			c.Abort()
			return
		}

		// Store user ID and operation type in context
		c.Set("userId", result.UserID)
		c.Set("operationType", operation)
		c.Set("freeOperationsRemaining", result.FreeOperationsRemaining)
		c.Set("balance", result.Balance)

		c.Next()
	}
}
