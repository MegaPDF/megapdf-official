// internal/handlers/user_handlers.go
package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// GetUserProfile returns the profile information for the authenticated user
func GetUserProfile(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Fetch user from database
	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	// Check if free operations should be reset
	now := time.Now().UTC()
	firstDayOfMonth := models.GetFirstDayOfMonth(now.Format(time.RFC3339))

	var usageStats []models.UsageStats
	if err := db.DB.Where("user_id = ? AND date >= ?", userID, firstDayOfMonth).Find(&usageStats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch usage statistics",
		})
		return
	}

	// Calculate total operations
	operations := 0
	for _, stat := range usageStats {
		operations += stat.Count
	}

	// Get user's current balance
	currentBalance := user.Balance

	// For backward compatibility with frontend, simulate subscription period
	// Using today as start and end of next month as end
	currentPeriodStart := now.Format(time.RFC3339)
	currentPeriodEnd := models.GetLastDayOfMonth(now.Format(time.RFC3339)).Format(time.RFC3339)

	// Check if user has made any deposits
	var transactions []models.Transaction
	hasPaid := false

	if err := db.DB.Where("user_id = ? AND amount > 0 AND status = ?", userID, "completed").
		Limit(1).Find(&transactions).Error; err == nil && len(transactions) > 0 {
		hasPaid = true
	}

	// Determine account tier
	tier := "free"
	if hasPaid || user.Balance > 0 {
		tier = "paid"
	}

	// Check if free operations reset date has passed
	freeOpsRemaining := 0
	freeOpsReset := user.FreeOperationsReset
	freeOpsUsed := user.FreeOperationsUsed

	if user.FreeOperationsReset.Before(now) {
		// If reset date has passed, user has all free operations available
		freeOpsRemaining = constants.DEFAULT_FREE_OPERATIONS_MONTHLY

		// Next reset date would be first day of next month
		nextMonth := now.AddDate(0, 1, 0)
		freeOpsReset = time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.UTC)
		freeOpsUsed = 0

		// Update the user
		if err := db.DB.Model(&user).Updates(map[string]interface{}{
			"free_operations_used":  0,
			"free_operations_reset": freeOpsReset,
		}).Error; err != nil {
			// Log but don't fail the request
			fmt.Printf("Error updating free operations reset: %v\n", err)
		}
	} else {
		// Otherwise calculate remaining based on used count
		freeOpsRemaining = constants.DEFAULT_FREE_OPERATIONS_MONTHLY - freeOpsUsed
		if freeOpsRemaining < 0 {
			freeOpsRemaining = 0
		}
	}

	// Construct the response
	c.JSON(http.StatusOK, gin.H{
		"id":                      user.ID,
		"name":                    user.Name,
		"email":                   user.Email,
		"role":                    user.Role,
		"isEmailVerified":         user.IsEmailVerified,
		"tier":                    tier,
		"status":                  "active", // Always active in pay-as-you-go
		"currentPeriodStart":      currentPeriodStart,
		"currentPeriodEnd":        currentPeriodEnd,
		"operations":              operations,
		"limit":                   constants.DEFAULT_FREE_OPERATIONS_MONTHLY,
		"balance":                 currentBalance,
		"freeOperationsUsed":      freeOpsUsed,
		"freeOperationsRemaining": freeOpsRemaining,
		"freeOperationsReset":     freeOpsReset.Format(time.RFC3339),
	})
}

// UpdateUserProfile updates the profile information for the authenticated user
func UpdateUserProfile(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Parse request body
	var requestBody struct {
		Name string `json:"name"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	// Update user in database
	if err := db.DB.Model(&models.User{}).Where("id = ?", userID).Update("name", requestBody.Name).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update user profile",
		})
		return
	}

	// Fetch updated user
	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch updated user",
		})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
		},
	})
}

// ChangeUserPassword changes the password for the authenticated user
func ChangeUserPassword(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Parse request body
	var requestBody struct {
		CurrentPassword string `json:"currentPassword" binding:"required"`
		NewPassword     string `json:"newPassword" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	// Get user from database
	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(requestBody.CurrentPassword)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Current password is incorrect",
		})
		return
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(requestBody.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to hash new password",
		})
		return
	}

	// Update password in database
	if err := db.DB.Model(&user).Update("password", string(hashedPassword)).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update password",
		})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Password updated successfully",
	})
}
