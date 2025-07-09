package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthHandler struct {
	service      *services.AuthService
	jwtSecret    string
	emailService *services.EmailService
	config       *config.Config
}

func NewAuthHandler(service *services.AuthService, jwtSecret string, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		service:   service,
		jwtSecret: jwtSecret,
		config:    cfg,
	}
}

func (h *AuthHandler) ValidateToken(c *gin.Context) {
	var token string
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
		token = strings.TrimPrefix(authHeader, "Bearer ")
	}
	if token == "" {
		cookieToken, err := c.Cookie("authToken")
		if err == nil && cookieToken != "" {
			token = cookieToken
		}
	}
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid": false,
			"error": "No token provided",
		})
		return
	}
	userID, err := h.service.ValidateToken(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid": false,
			"error": "Invalid token",
		})
		return
	}
	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"valid": false,
			"error": "User not found",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"valid":  true,
		"userId": userID,
		"role":   user.Role,
	})
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req struct {
		Name     string `json:"name" binding:"required"`
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := h.service.Register(req.Name, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !result.Success {
		c.JSON(http.StatusBadRequest, gin.H{"error": result.Error})
		return
	}
	emailSent := false
	if h.emailService != nil && result.User.VerificationToken != nil {
		verificationToken := *result.User.VerificationToken
		emailResult, emailErr := h.emailService.SendVerificationEmail(
			result.User.Email,
			verificationToken,
			result.User.Name,
		)
		if emailErr == nil && emailResult.Success {
			emailSent = true
			if c.GetString("mode") == "development" {
				fmt.Printf("[DEBUG] Verification email sent to %s\n", result.User.Email)
			}
		} else {
			errMsg := "Unknown error"
			if emailErr != nil {
				errMsg = emailErr.Error()
			} else if emailResult != nil {
				errMsg = emailResult.Error
			}
			fmt.Printf("Failed to send verification email: %s\n", errMsg)
		}
	} else {
		fmt.Println("Email service not configured or verification token missing")
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"token":   result.Token,
		"user": gin.H{
			"id":              result.User.ID,
			"name":            result.User.Name,
			"email":           result.User.Email,
			"isEmailVerified": result.User.IsEmailVerified,
		},
		"emailSent": emailSent,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	result, err := h.service.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !result.Success {
		c.JSON(http.StatusUnauthorized, gin.H{"error": result.Error})
		return
	}
	secure := c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https"
	c.SetCookie(
		"authToken",
		result.Token,
		60*60*24*7,
		"/",
		"",
		secure,
		true,
	)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"token":   result.Token,
		"user": gin.H{
			"id":              result.User.ID,
			"name":            result.User.Name,
			"email":           result.User.Email,
			"isEmailVerified": result.User.IsEmailVerified,
			"role":            result.User.Role,
		},
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	var token string
	cookieToken, err := c.Cookie("authToken")
	if err == nil {
		token = cookieToken
	} else {
		authHeader := c.GetHeader("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			token = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}
	if token != "" {
		db.DB.Where("session_token = ?", token).Delete(&models.Session{})
	}
	c.SetCookie(
		"authToken",
		"",
		-1,
		"/",
		"",
		false,
		true,
	)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Logged out successfully",
	})
}

func (h *AuthHandler) RequestPasswordReset(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}

	// IMPORTANT: Hard-code frontend URL for development
	frontendURL := "http://localhost:3000"

	// If config.AppURL is set properly, use that instead
	if h.config != nil && h.config.AppURL != "" && h.config.AppURL != "http://localhost:8080" {
		frontendURL = h.config.AppURL
	}

	fmt.Printf("\n*** PASSWORD RESET REQUEST ***\n")
	fmt.Printf("Email: %s\n", req.Email)
	fmt.Printf("Frontend URL: %s\n", frontendURL)
	fmt.Printf("Config AppURL: %s\n", h.config.AppURL)
	fmt.Printf("*****************************\n\n")

	token, err := h.service.RequestPasswordReset(req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process reset request"})
		return
	}

	if token == nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "If an account with this email exists, a password reset link has been sent",
		})
		return
	}

	if h.emailService != nil {
		emailResult, err := h.emailService.SendPasswordResetEmail(req.Email, token.Token)
		if err != nil || !emailResult.Success {
			errMsg := "Unknown error"
			if err != nil {
				errMsg = err.Error()
			} else if emailResult != nil {
				errMsg = emailResult.Error
			}
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"message": "Error sending password reset email. Please try again later.",
				"error":   errMsg,
			})
			return
		}

		devDetails := gin.H{}
		if c.GetString("mode") == "development" {
			// In development mode, show the token and preview URL
			resetUrl := fmt.Sprintf("%s/en/reset-password?token=%s", frontendURL, token.Token)
			devDetails["devToken"] = token.Token
			devDetails["devResetUrl"] = resetUrl
			devDetails["previewUrl"] = emailResult.MessageUrl

			fmt.Printf("DEV MODE: Reset URL for testing: %s\n", resetUrl)
		}

		c.JSON(http.StatusOK, gin.H{
			"success":    true,
			"message":    "Password reset link has been sent",
			"devDetails": devDetails,
		})
	} else {
		if c.GetString("mode") == "development" {
			resetUrl := fmt.Sprintf("%s/en/reset-password?token=%s", frontendURL, token.Token)
			c.JSON(http.StatusOK, gin.H{
				"success":  true,
				"message":  "DEVELOPMENT MODE: Password reset link would be sent in production",
				"token":    token.Token,
				"resetUrl": resetUrl,
			})

			fmt.Printf("DEV MODE: Reset URL for testing: %s\n", resetUrl)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Email service not configured",
			})
		}
	}
}

// internal/handlers/auth_handler.go (partial)

func (h *AuthHandler) ValidateResetToken(c *gin.Context) {
	// Log the request for debugging
	fmt.Printf("\n*** VALIDATE TOKEN REQUEST ***\n")
	fmt.Printf("Headers: %v\n", c.Request.Header)
	fmt.Printf("Token: %s\n", c.Query("token"))
	fmt.Printf("Request URL: %s\n", c.Request.URL.String())
	fmt.Printf("RemoteAddr: %s\n", c.Request.RemoteAddr)
	fmt.Printf("******************************\n\n")

	token := c.Query("token")
	if token == "" {
		fmt.Println("Token is missing in request")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required", "valid": false})
		return
	}

	// Add extra debug logs
	fmt.Printf("Validating token: %s\n", token)

	valid, err := h.service.ValidateResetToken(token)
	if err != nil {
		fmt.Printf("Error validating token: %v\n", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Failed to validate token: %v", err),
			"valid": false,
		})
		return
	}

	fmt.Printf("Token validation result: %v\n", valid)

	// Set CORS headers again to be safe
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")

	c.JSON(http.StatusOK, gin.H{
		"valid": valid,
		"message": map[bool]string{
			true:  "Token is valid",
			false: "Token is invalid or has expired",
		}[valid],
	})
}

func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req struct {
		Token    string `json:"token" binding:"required"`
		Password string `json:"password" binding:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token and password are required"})
		return
	}
	var resetToken models.PasswordResetToken
	if err := db.DB.Where("token = ?", req.Token).First(&resetToken).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid token"})
		return
	}
	var user models.User
	if err := db.DB.Where("email = ?", resetToken.Email).First(&user).Error; err != nil {
		fmt.Printf("Warning: Could not get user details for reset confirmation email: %v\n", err)
	}
	// Use := to declare err for the ResetPassword call
	if err := h.service.ResetPassword(req.Token, req.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	emailSent := false
	if h.emailService != nil {
		emailResult, err := h.emailService.SendPasswordResetSuccessEmail(
			resetToken.Email,
			user.Name,
		)
		if err == nil && emailResult.Success {
			emailSent = true
			if c.GetString("mode") == "development" {
				fmt.Printf("[DEBUG] Password reset confirmation email sent to %s\n", resetToken.Email)
			}
		} else {
			errMsg := "Unknown error"
			if err != nil {
				errMsg = err.Error()
			} else if emailResult != nil {
				errMsg = emailResult.Error
			}
			fmt.Printf("Failed to send password reset confirmation email: %s\n", errMsg)
		}
	}
	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"message":   "Password has been reset successfully",
		"emailSent": emailSent,
	})
}
func (h *AuthHandler) VerifyEmail(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Verification token is required"})
		return
	}

	err := h.service.VerifyEmail(token)
	if err != nil {
		// For HTML response on error
		c.HTML(http.StatusBadRequest, "verify_email_error.html", gin.H{
			"error": "Invalid verification token",
		})
		return
	}

	// Return HTML success page instead of JSON
	c.HTML(http.StatusOK, "verify_email_success.html", gin.H{
		"appURL": h.config.AppURL,
	})
}

func (h *AuthHandler) ResendVerificationEmail(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Authentication required",
		})
		return
	}
	fmt.Printf("Request to resend verification email for user ID: %s\n", userID)
	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		fmt.Printf("Error finding user: %v\n", err)
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}
	if user.IsEmailVerified {
		fmt.Printf("User %s email is already verified\n", userID)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Email is already verified",
		})
		return
	}
	var verificationToken string
	if user.VerificationToken == nil || *user.VerificationToken == "" {
		verificationToken = uuid.New().String()
		if err := db.DB.Model(&user).Update("verification_token", verificationToken).Error; err != nil {
			fmt.Printf("Error updating verification token: %v\n", err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to generate verification token",
			})
			return
		}
	} else {
		verificationToken = *user.VerificationToken
	}
	fmt.Printf("Using verification token: %s for user: %s (%s)\n", verificationToken, user.ID, user.Email)
	if h.emailService == nil {
		fmt.Println("Email service is not initialized")
		if c.GetString("mode") == "development" {
			verifyUrl := fmt.Sprintf("%s/api/auth/verify-email?token=%s", h.config.AppURL, verificationToken)
			c.JSON(http.StatusOK, gin.H{
				"success":            true,
				"message":            "DEVELOPMENT MODE: Verification would be sent in production",
				"devVerificationUrl": verifyUrl,
				"devNote":            "Configure SMTP settings to send actual emails",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Email service not configured",
				"details": "The server's email configuration is incomplete",
			})
		}
		return
	}
	emailResult, err := h.emailService.SendVerificationEmail(user.Email, verificationToken, user.Name)
	if err != nil {
		if strings.Contains(err.Error(), "SMTP settings not configured") {
			if c.GetString("mode") == "development" {
				verifyUrl := fmt.Sprintf("%s/api/auth/verify-email?token=%s", h.config.AppURL, verificationToken)
				c.JSON(http.StatusOK, gin.H{
					"success":            true,
					"message":            "DEVELOPMENT MODE: Email sending skipped due to missing SMTP settings",
					"devVerificationUrl": verifyUrl,
					"devNote":            "Configure SMTP settings to send actual emails",
				})
			} else {
				c.JSON(http.StatusServiceUnavailable, gin.H{
					"error":   "Email service not properly configured",
					"details": "The server's email configuration is incomplete",
				})
			}
			return
		}
		fmt.Printf("Error sending verification email: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to send verification email: %v", err),
		})
		return
	}
	if !emailResult.Success {
		fmt.Printf("Email sending failed: %s\n", emailResult.Error)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to send verification email: %s", emailResult.Error),
		})
		return
	}
	fmt.Printf("Verification email sent successfully to %s\n", user.Email)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Verification email sent successfully",
	})
}

// GetResetTokenInfo provides information about a reset token without validating credentials
func (h *AuthHandler) GetResetTokenInfo(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required", "valid": false})
		return
	}

	// Look up the token directly in the database
	var resetToken models.PasswordResetToken
	result := db.DB.Where("token = ?", token).First(&resetToken)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Token not found in database
		c.JSON(http.StatusOK, gin.H{
			"valid":   false,
			"message": "Token is invalid or does not exist",
		})
		return
	} else if result.Error != nil {
		// Other database error
		c.JSON(http.StatusInternalServerError, gin.H{
			"valid": false,
			"error": "Database error: " + result.Error.Error(),
		})
		return
	}

	// Check if token has expired
	isValid := resetToken.Expires.After(time.Now())

	c.JSON(http.StatusOK, gin.H{
		"valid": isValid,
		"message": map[bool]string{
			true:  "Token is valid",
			false: "Token has expired",
		}[isValid],
		"email":   resetToken.Email, // Include email for debugging only
		"expires": resetToken.Expires,
		"created": resetToken.CreatedAt,
	})
}

func (h *AuthHandler) SetEmailService(emailService *services.EmailService) {
	h.emailService = emailService
}

// ResendVerification resends email verification
func (h *AuthHandler) ResendVerification(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Resend verification - not implemented yet"})
}

// ForgotPassword handles forgot password
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Forgot password - not implemented yet"})
}

// RefreshToken refreshes JWT token
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Refresh token - not implemented yet"})
}

// GetProfile gets user profile
func (h *AuthHandler) GetProfile(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Get profile - not implemented yet"})
}

// ChangePassword changes user password
func (h *AuthHandler) ChangePassword(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Change password - not implemented yet"})
}
