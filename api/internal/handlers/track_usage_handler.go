// internal/services/track_usage_handler.go
package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/gin-gonic/gin"
)

type TrackUsageHandler struct{}

func NewTrackUsageHandler() *TrackUsageHandler {
	return &TrackUsageHandler{}
}

// GetUsageStats returns usage statistics for the authenticated user
func (h *TrackUsageHandler) GetUsageStats(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Get start of current month
	now := time.Now()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)

	// Get usage stats for current month
	var usageStats []models.UsageStats
	if err := db.DB.Where("user_id = ? AND date >= ?", userID, startOfMonth).Find(&usageStats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch usage statistics",
		})
		return
	}

	// Calculate totals
	totalOperations := 0
	operationCounts := make(map[string]int)

	for _, stat := range usageStats {
		// Skip any operation named "pdf" as it's not a real operation
		if strings.ToLower(stat.Operation) == "pdf" {
			continue
		}

		totalOperations += stat.Count
		operationCounts[stat.Operation] += stat.Count
	}

	// Get user's free operations data
	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to fetch user data",
		})
		return
	}

	// Calculate free operations remaining
	freeOpsRemaining := 0
	if user.FreeOperationsReset.Before(now) {
		// If reset date has passed, user has all free operations available
		freeOpsRemaining = constants.DEFAULT_FREE_OPERATIONS_MONTHLY
	} else {
		// Otherwise calculate remaining based on used count
		freeOpsRemaining = constants.DEFAULT_FREE_OPERATIONS_MONTHLY - user.FreeOperationsUsed
		if freeOpsRemaining < 0 {
			freeOpsRemaining = 0
		}
	}

	// Return stats
	c.JSON(http.StatusOK, gin.H{
		"success":                 true,
		"totalOperations":         totalOperations,
		"operationCounts":         operationCounts,
		"freeOperationsUsed":      user.FreeOperationsUsed,
		"freeOperationsRemaining": freeOpsRemaining,
		"freeOperationsTotal":     constants.DEFAULT_FREE_OPERATIONS_MONTHLY,
		"nextResetDate":           user.FreeOperationsReset,
		"period": gin.H{
			"start": startOfMonth,
			"end":   now,
		},
	})
}

// TrackOperation records an API operation in the usage stats
func (h *TrackUsageHandler) TrackOperation(c *gin.Context) {
	// Get user ID from context (set by middleware)
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	// Parse request
	var req struct {
		Operation string    `json:"operation" binding:"required"`
		Timestamp time.Time `json:"timestamp"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	// Set timestamp to now if not provided
	if req.Timestamp.IsZero() {
		req.Timestamp = time.Now()
	}

	// Get today's date (without time)
	today := time.Date(req.Timestamp.Year(), req.Timestamp.Month(), req.Timestamp.Day(), 0, 0, 0, 0, time.UTC)

	// Try to find existing stat record for today and this operation
	var stat models.UsageStats
	result := db.DB.Where("user_id = ? AND operation = ? AND date = ?", userID, req.Operation, today).First(&stat)

	if result.Error != nil {
		// Create new record if not found
		newStat := models.UsageStats{
			ID:        models.GenerateID(),
			UserID:    userID.(string),
			Operation: req.Operation,
			Count:     1,
			Date:      today,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		if err := db.DB.Create(&newStat).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to record operation",
			})
			return
		}
	} else {
		// Update existing record
		if err := db.DB.Model(&stat).Update("count", stat.Count+1).Update("updated_at", time.Now()).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to update operation count",
			})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
	})
}
