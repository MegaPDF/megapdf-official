// internal/handlers/admin_handler.go
package handlers

import (
	"fmt"
	"net/http"
	"regexp"
	"strconv"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/MegaPDF/megapdf-official/api/internal/repository"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminHandler struct{}

func NewAdminHandler() *AdminHandler {
	return &AdminHandler{}
}

// GetDashboardStats returns aggregated stats for the admin dashboard
func (h *AdminHandler) GetDashboardStats(c *gin.Context) {
	// Get database stats
	var userCount int64
	if err := db.DB.Model(&models.User{}).Count(&userCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count users"})
		return
	}

	// Count active users (active in the last 30 days)
	var activeUserCount int64
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	if err := db.DB.Model(&models.ApiKey{}).Where("last_used > ?", thirtyDaysAgo).
		Distinct("user_id").Count(&activeUserCount).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count active users"})
		return
	}

	// Count new users this month
	var newUsersThisMonth int64
	startOfMonth := time.Now().AddDate(0, 0, -time.Now().Day()+1)
	startOfMonth = time.Date(startOfMonth.Year(), startOfMonth.Month(), startOfMonth.Day(), 0, 0, 0, 0, time.UTC)
	if err := db.DB.Model(&models.User{}).Where("created_at >= ?", startOfMonth).Count(&newUsersThisMonth).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count new users"})
		return
	}

	// Count users by subscription tier (in our case, free vs paid)
	var freeUsers, paidUsers int64

	// Users with positive balance are considered paid
	if err := db.DB.Model(&models.User{}).Where("balance > 0").Count(&paidUsers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count paid users"})
		return
	}

	freeUsers = userCount - paidUsers

	// Get API usage stats
	var totalAPIRequests int64
	if err := db.DB.Model(&models.UsageStats{}).Select("SUM(count)").Row().Scan(&totalAPIRequests); err != nil {
		// Don't fail if we can't get this, just set to 0
		totalAPIRequests = 0
	}

	// Get API usage by operation
	var usageStats []models.UsageStats
	if err := db.DB.Model(&models.UsageStats{}).Group("operation").Select("operation, SUM(count) as count").Find(&usageStats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get operation stats"})
		return
	}

	operationCounts := make(map[string]int)
	for _, stat := range usageStats {
		operationCounts[stat.Operation] = stat.Count
	}

	// Get top users by API usage
	type TopUser struct {
		UserID   string  `json:"userId"`
		Name     string  `json:"name"`
		Email    string  `json:"email"`
		Requests int     `json:"requests"`
		Balance  float64 `json:"balance"`
	}

	var topUsers []TopUser
	rows, err := db.DB.Raw(`
		SELECT u.id as user_id, u.name, u.email, SUM(us.count) as requests, u.balance
		FROM users u
		JOIN usage_stats us ON u.id = us.user_id
		GROUP BY u.id
		ORDER BY requests DESC
		LIMIT 5
	`).Rows()

	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var user TopUser
			rows.Scan(&user.UserID, &user.Name, &user.Email, &user.Requests, &user.Balance)
			topUsers = append(topUsers, user)
		}
	}

	// Get user growth data
	var userGrowth []gin.H
	lastSixMonths := time.Now().AddDate(0, -5, 0)
	rows, err = db.DB.Raw(`
		SELECT 
			strftime('%Y-%m', created_at) as date,
			COUNT(*) as users
		FROM users
		WHERE created_at >= ?
		GROUP BY strftime('%Y-%m', created_at)
		ORDER BY date
	`, lastSixMonths).Rows()

	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var date string
			var users int
			rows.Scan(&date, &users)

			userGrowth = append(userGrowth, gin.H{
				"date":   date,
				"users":  users,
				"active": users / 2, // Simplified approximation, replace with actual data if available
			})
		}
	}

	// Get recent activity
	type Activity struct {
		ID        string    `json:"id"`
		UserID    string    `json:"userId"`
		UserName  string    `json:"userName"`
		UserEmail string    `json:"userEmail"`
		Action    string    `json:"action"`
		Resource  string    `json:"resource"`
		Details   string    `json:"details"`
		Timestamp time.Time `json:"timestamp"`
		Type      string    `json:"type"`
	}

	var recentActivities []Activity

	// First, get API key usage activities
	apiActivitiesRows, err := db.DB.Raw(`
		SELECT 
			us.id, 
			u.id as user_id, 
			u.name as user_name, 
			u.email as user_email,
			us.operation as action,
			'api' as resource,
			'API operation performed' as details,
			us.created_at as timestamp,
			'api' as type
		FROM usage_stats us
		JOIN users u ON us.user_id = u.id
		ORDER BY us.created_at DESC
		LIMIT 10
	`).Rows()

	if err == nil {
		defer apiActivitiesRows.Close()
		for apiActivitiesRows.Next() {
			var activity Activity
			apiActivitiesRows.Scan(
				&activity.ID,
				&activity.UserID,
				&activity.UserName,
				&activity.UserEmail,
				&activity.Action,
				&activity.Resource,
				&activity.Details,
				&activity.Timestamp,
				&activity.Type,
			)
			recentActivities = append(recentActivities, activity)
		}
	}

	// Get system info
	systemHealth := gin.H{
		"health":      "healthy",
		"uptime":      "99.98%",
		"serverLoad":  35,
		"memoryUsage": 45,
		"diskUsage":   60,
	}

	// Construct and return dashboard stats
	c.JSON(http.StatusOK, gin.H{
		"users": gin.H{
			"total":        userCount,
			"active":       activeUserCount,
			"newThisMonth": newUsersThisMonth,
			"bySubscription": gin.H{
				"free": freeUsers,
				"paid": paidUsers,
			},
		},
		"apiUsage": gin.H{
			"totalRequests": totalAPIRequests,
			"byOperation":   operationCounts,
			"topUsers":      topUsers,
		},
		"userGrowth":     userGrowth,
		"recentActivity": recentActivities,
		"system":         systemHealth,
	})
}

// GetUsers returns a paginated list of users for admin management
func (h *AdminHandler) GetUsers(c *gin.Context) {
	// Parse query parameters
	page, _ := c.GetQuery("page")
	search, _ := c.GetQuery("search")
	tier, _ := c.GetQuery("tier")
	status, _ := c.GetQuery("status")
	role, _ := c.GetQuery("role")

	// Default to page 1 if not provided
	pageNum := 1
	if page != "" {
		// Parse the page number from string to int
		parsedPage, err := strconv.Atoi(page)
		if err == nil && parsedPage > 0 {
			pageNum = parsedPage
		}
	}

	// Define page size
	pageSize := 10
	offset := (pageNum - 1) * pageSize

	// Build query
	query := db.DB.Model(&models.User{})

	// Apply search filter
	if search != "" {
		query = query.Where(
			"name LIKE ? OR email LIKE ?",
			"%"+search+"%",
			"%"+search+"%",
		)
	}

	// Apply tier filter
	if tier == "paid" {
		query = query.Where("balance > 0")
	} else if tier == "free" {
		query = query.Where("balance = 0")
	}

	// Apply role filter
	if role != "all" && role != "" {
		query = query.Where("role = ?", role)
	}

	// Apply status filter (for suspension status)
	if status == "suspended" {
		query = query.Where("role = ?", "suspended")
	} else if status == "active" {
		query = query.Where("role <> ?", "suspended")
	}

	// Count total users with filters
	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count users"})
		return
	}

	// Calculate total pages
	totalPages := (int(total) + pageSize - 1) / pageSize

	// Get users with pagination
	var users []models.User
	if err := query.Limit(pageSize).Offset(offset).Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get users"})
		return
	}

	// Format users for response
	formattedUsers := make([]gin.H, len(users))
	for i, user := range users {
		// Get API keys for this user
		var apiKeys []models.ApiKey
		db.DB.Where("user_id = ?", user.ID).Find(&apiKeys)

		// Format API keys
		formattedKeys := make([]gin.H, len(apiKeys))
		for j, key := range apiKeys {
			formattedKeys[j] = gin.H{
				"id":       key.ID,
				"name":     key.Name,
				"lastUsed": key.LastUsed,
			}
		}

		// Get usage stats for this user
		var thisMonthUsage, lastMonthUsage, totalUsage int

		// This month
		startOfMonth := time.Now().AddDate(0, 0, -time.Now().Day()+1)
		startOfMonth = time.Date(startOfMonth.Year(), startOfMonth.Month(), startOfMonth.Day(), 0, 0, 0, 0, time.UTC)

		db.DB.Model(&models.UsageStats{}).
			Where("user_id = ? AND date >= ?", user.ID, startOfMonth).
			Select("SUM(count)").
			Row().
			Scan(&thisMonthUsage)

		// Last month
		startOfLastMonth := startOfMonth.AddDate(0, -1, 0)
		endOfLastMonth := startOfMonth.AddDate(0, 0, -1)

		db.DB.Model(&models.UsageStats{}).
			Where("user_id = ? AND date >= ? AND date <= ?", user.ID, startOfLastMonth, endOfLastMonth).
			Select("SUM(count)").
			Row().
			Scan(&lastMonthUsage)

		// Total
		db.DB.Model(&models.UsageStats{}).
			Where("user_id = ?", user.ID).
			Select("SUM(count)").
			Row().
			Scan(&totalUsage)

		// Calculate free operations remaining
		freeOpsRemaining := 0
		if time.Now().After(user.FreeOperationsReset) {
			// Reset date has passed, all free operations are available
			freeOpsRemaining = 500 // Use your FREE_OPERATIONS_MONTHLY constant here
		} else {
			// Calculate remaining
			freeOpsRemaining = 500 - user.FreeOperationsUsed
			if freeOpsRemaining < 0 {
				freeOpsRemaining = 0
			}
		}

		// Determine subscription tier
		var tier string
		if user.Balance > 0 {
			tier = "paid"
		} else {
			tier = "free"
		}

		// Format user
		formattedUsers[i] = gin.H{
			"id":         user.ID,
			"name":       user.Name,
			"email":      user.Email,
			"role":       user.Role,
			"createdAt":  user.CreatedAt,
			"lastActive": time.Now(), // We don't have this in our model currently
			"subscription": gin.H{
				"tier":   tier,
				"status": "active",
			},
			"balance":                 user.Balance,
			"freeOperationsUsed":      user.FreeOperationsUsed,
			"freeOperationsRemaining": freeOpsRemaining,
			"apiKeys":                 formattedKeys,
			"usage": gin.H{
				"total":     totalUsage,
				"thisMonth": thisMonthUsage,
				"lastMonth": lastMonthUsage,
			},
		}
	}

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"users":      formattedUsers,
		"total":      total,
		"page":       pageNum,
		"pageSize":   pageSize,
		"totalPages": totalPages,
	})
}

// GetUser returns details for a specific user
func (h *AdminHandler) GetUser(c *gin.Context) {
	userID := c.Param("id")

	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Get API keys
	var apiKeys []models.ApiKey
	db.DB.Where("user_id = ?", user.ID).Find(&apiKeys)

	// Format API keys
	formattedKeys := make([]gin.H, len(apiKeys))
	for i, key := range apiKeys {
		formattedKeys[i] = gin.H{
			"id":       key.ID,
			"name":     key.Name,
			"lastUsed": key.LastUsed,
		}
	}

	// Get usage stats
	var thisMonthUsage, lastMonthUsage, totalUsage int

	// This month
	startOfMonth := time.Now().AddDate(0, 0, -time.Now().Day()+1)
	startOfMonth = time.Date(startOfMonth.Year(), startOfMonth.Month(), startOfMonth.Day(), 0, 0, 0, 0, time.UTC)

	db.DB.Model(&models.UsageStats{}).
		Where("user_id = ? AND date >= ?", user.ID, startOfMonth).
		Select("SUM(count)").
		Row().
		Scan(&thisMonthUsage)

	// Last month
	startOfLastMonth := startOfMonth.AddDate(0, -1, 0)
	endOfLastMonth := startOfMonth.AddDate(0, 0, -1)

	db.DB.Model(&models.UsageStats{}).
		Where("user_id = ? AND date >= ? AND date <= ?", user.ID, startOfLastMonth, endOfLastMonth).
		Select("SUM(count)").
		Row().
		Scan(&lastMonthUsage)

	// Total
	db.DB.Model(&models.UsageStats{}).
		Where("user_id = ?", user.ID).
		Select("SUM(count)").
		Row().
		Scan(&totalUsage)

	// Get transactions
	var transactions []models.Transaction
	db.DB.Where("user_id = ?", user.ID).Order("created_at DESC").Limit(10).Find(&transactions)

	// Format transactions
	formattedTransactions := make([]gin.H, len(transactions))
	for i, tx := range transactions {
		formattedTransactions[i] = gin.H{
			"id":           tx.ID,
			"amount":       tx.Amount,
			"balanceAfter": tx.BalanceAfter,
			"description":  tx.Description,
			"status":       tx.Status,
			"createdAt":    tx.CreatedAt,
		}
	}

	// Calculate free operations remaining
	freeOpsRemaining := 0
	if time.Now().After(user.FreeOperationsReset) {
		// Reset date has passed, all free operations are available
		freeOpsRemaining = 500 // Use your FREE_OPERATIONS_MONTHLY constant
	} else {
		// Calculate remaining
		freeOpsRemaining = 500 - user.FreeOperationsUsed
		if freeOpsRemaining < 0 {
			freeOpsRemaining = 0
		}
	}

	// Determine subscription tier
	var tier string
	if user.Balance > 0 {
		tier = "paid"
	} else {
		tier = "free"
	}

	// Return user details
	c.JSON(http.StatusOK, gin.H{
		"id":        user.ID,
		"name":      user.Name,
		"email":     user.Email,
		"role":      user.Role,
		"createdAt": user.CreatedAt,
		"subscription": gin.H{
			"tier":   tier,
			"status": "active",
		},
		"balance":                 user.Balance,
		"freeOperationsUsed":      user.FreeOperationsUsed,
		"freeOperationsRemaining": freeOpsRemaining,
		"apiKeys":                 formattedKeys,
		"usage": gin.H{
			"total":     totalUsage,
			"thisMonth": thisMonthUsage,
			"lastMonth": lastMonthUsage,
		},
		"transactions": formattedTransactions,
	})
}

// CreateUser creates a new user (admin function)
func (h *AdminHandler) CreateUser(c *gin.Context) {
	var req struct {
		Name     string  `json:"name" binding:"required"`
		Email    string  `json:"email" binding:"required,email"`
		Password string  `json:"password" binding:"required,min=8"`
		Role     string  `json:"role"`
		Balance  float64 `json:"balance"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash password
	hashedPassword, err := models.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Set default role if not provided
	if req.Role == "" {
		req.Role = "user"
	}

	// Set reset date for free operations (first day of next month)
	now := time.Now()
	nextMonth := now.AddDate(0, 1, 0)
	resetDate := time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.UTC)

	// Create user
	user := models.User{
		ID:                  models.GenerateID(),
		Name:                req.Name,
		Email:               req.Email,
		Password:            hashedPassword,
		Role:                req.Role,
		Balance:             req.Balance,
		FreeOperationsUsed:  0,
		FreeOperationsReset: resetDate,
		CreatedAt:           time.Now(),
		UpdatedAt:           time.Now(),
	}

	if err := db.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"success": true,
		"user": gin.H{
			"id":    user.ID,
			"name":  user.Name,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

// UpdateUser updates a user's details (admin function)
func (h *AdminHandler) UpdateUser(c *gin.Context) {
	userID := c.Param("id")

	var req struct {
		Name               *string  `json:"name"`
		Email              *string  `json:"email"`
		Role               *string  `json:"role"`
		Balance            *float64 `json:"balance"`
		FreeOperationsUsed *int     `json:"freeOperationsUsed"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Find user
	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Update fields if provided
	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Email != nil {
		updates["email"] = *req.Email
	}
	if req.Role != nil {
		updates["role"] = *req.Role
	}
	if req.Balance != nil {
		// Record a transaction for the balance change
		oldBalance := user.Balance
		newBalance := *req.Balance

		if newBalance != oldBalance {
			// Create transaction record
			transaction := models.Transaction{
				ID:           models.GenerateID(),
				UserID:       user.ID,
				Amount:       newBalance - oldBalance,
				BalanceAfter: newBalance,
				Description:  "Admin balance adjustment",
				Status:       "completed",
				CreatedAt:    time.Now(),
			}

			if err := db.DB.Create(&transaction).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record transaction"})
				return
			}
		}

		updates["balance"] = newBalance
	}
	if req.FreeOperationsUsed != nil {
		updates["free_operations_used"] = *req.FreeOperationsUsed
	}

	// Add updated_at timestamp
	updates["updated_at"] = time.Now()

	// Update user
	if err := db.DB.Model(&user).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User updated successfully",
	})
}

// DeleteUser deletes a user (admin function)
func (h *AdminHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")

	// Find user to check if exists
	var user models.User
	if err := db.DB.First(&user, "id = ?", userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// Delete related records first (cascade delete doesn't always work reliably)
	// Delete API keys
	if err := db.DB.Where("user_id = ?", userID).Delete(&models.ApiKey{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user's API keys"})
		return
	}

	// Delete usage stats
	if err := db.DB.Where("user_id = ?", userID).Delete(&models.UsageStats{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user's usage stats"})
		return
	}

	// Delete transactions
	if err := db.DB.Where("user_id = ?", userID).Delete(&models.Transaction{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user's transactions"})
		return
	}

	// Delete sessions
	if err := db.DB.Where("user_id = ?", userID).Delete(&models.Session{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user's sessions"})
		return
	}

	// Finally delete the user
	if err := db.DB.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "User deleted successfully",
	})
}

// GetAPIUsage returns API usage statistics for the admin dashboard
func (h *AdminHandler) GetAPIUsage(c *gin.Context) {
	// Get daily API usage for the last 30 days
	var dailyUsage []gin.H
	rows, err := db.DB.Raw(`
    SELECT 
        DATE(date) as day,
        SUM(count) as requests,
        COUNT(DISTINCT user_id) as users
    FROM usage_stats
    WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    GROUP BY DATE(date)
    ORDER BY DATE(date)
`).Rows()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get daily usage"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var day string
		var requests, users int
		rows.Scan(&day, &requests, &users)

		// Calculate estimated revenue (this is just an example)
		revenue := float64(requests) * 0.005 // Using OPERATION_COST here

		dailyUsage = append(dailyUsage, gin.H{
			"date":     day,
			"requests": requests,
			"users":    users,
			"revenue":  revenue,
		})
	}

	// Get usage by operation
	var usageByOperation = make(map[string]int)
	opRows, err := db.DB.Raw(`
		SELECT 
			operation,
			SUM(count) as total
		FROM usage_stats
		GROUP BY operation
		ORDER BY total DESC
	`).Rows()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get operation usage"})
		return
	}
	defer opRows.Close()

	for opRows.Next() {
		var operation string
		var total int
		opRows.Scan(&operation, &total)
		usageByOperation[operation] = total
	}

	// Get usage by tier (free vs paid)
	var freeUsage, paidUsage int
	tierRows, err := db.DB.Raw(`
		SELECT 
			CASE WHEN u.balance > 0 THEN 'paid' ELSE 'free' END as tier,
			SUM(us.count) as total
		FROM usage_stats us
		JOIN users u ON us.user_id = u.id
		GROUP BY tier
	`).Rows()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get tier usage"})
		return
	}
	defer tierRows.Close()

	for tierRows.Next() {
		var tier string
		var total int
		tierRows.Scan(&tier, &total)

		if tier == "free" {
			freeUsage = total
		} else {
			paidUsage = total
		}
	}

	// Get top endpoints (operations) by usage and response time
	type TopEndpoint struct {
		Endpoint        string  `json:"endpoint"`
		Count           int     `json:"count"`
		AvgResponseTime float64 `json:"avgResponseTime"`
	}

	var topEndpoints []TopEndpoint

	// Since we don't have response times in our model, we'll estimate
	endpointRows, err := db.DB.Raw(`
		SELECT 
			operation as endpoint,
			SUM(count) as total
		FROM usage_stats
		GROUP BY operation
		ORDER BY total DESC
		LIMIT 10
	`).Rows()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get top endpoints"})
		return
	}
	defer endpointRows.Close()

	for endpointRows.Next() {
		var endpoint string
		var total int
		endpointRows.Scan(&endpoint, &total)

		// Generate a consistent but random-looking response time for demonstration
		// In a real app, you'd get this from monitoring data
		var avgResponseTime float64
		switch endpoint {
		case "compress":
			avgResponseTime = 245.8
		case "merge":
			avgResponseTime = 342.3
		case "split":
			avgResponseTime = 198.6
		case "convert":
			avgResponseTime = 275.1
		default:
			avgResponseTime = 220.0 + float64(len(endpoint)*7)
		}

		topEndpoints = append(topEndpoints, TopEndpoint{
			Endpoint:        endpoint,
			Count:           total,
			AvgResponseTime: avgResponseTime,
		})
	}

	// Return all the API usage data
	c.JSON(http.StatusOK, gin.H{
		"daily":       dailyUsage,
		"byOperation": usageByOperation,
		"byTier": gin.H{
			"free": freeUsage,
			"paid": paidUsage,
		},
		"topEndpoints": topEndpoints,
	})
}

// GetTransactions returns transaction history for admin viewing
func (h *AdminHandler) GetTransactions(c *gin.Context) {
	// Parse query parameters
	page, _ := c.GetQuery("page")
	search, _ := c.GetQuery("search")
	typeFilter, _ := c.GetQuery("type")
	status, _ := c.GetQuery("status")
	dateRange, _ := c.GetQuery("dateRange")

	// Default to page 1 if not provided
	pageNum := 1
	if page != "" {
		// Parse the page number from string to int
		parsedPage, err := strconv.Atoi(page)
		if err == nil && parsedPage > 0 {
			pageNum = parsedPage
		}
	}

	// Define page size
	pageSize := 50
	offset := (pageNum - 1) * pageSize

	// Build query
	query := db.DB.Model(&models.Transaction{}).Joins("JOIN users ON users.id = transactions.user_id")

	// Apply search filter
	if search != "" {
		query = query.Where(
			"users.name LIKE ? OR users.email LIKE ? OR transactions.description LIKE ?",
			"%"+search+"%",
			"%"+search+"%",
			"%"+search+"%",
		)
	}

	// Apply type filter
	if typeFilter == "deposit" {
		query = query.Where("transactions.amount > 0")
	} else if typeFilter == "operation" {
		query = query.Where("transactions.amount < 0 AND transactions.description LIKE 'Operation: %'")
	} else if typeFilter == "adjustment" {
		query = query.Where("transactions.description LIKE 'Admin %'")
	}

	// Apply status filter
	if status != "all" && status != "" {
		query = query.Where("transactions.status = ?", status)
	}

	// Apply date range filter
	var startDate time.Time
	if dateRange == "1h" {
		startDate = time.Now().Add(-time.Hour)
	} else if dateRange == "24h" {
		startDate = time.Now().AddDate(0, 0, -1)
	} else if dateRange == "7d" {
		startDate = time.Now().AddDate(0, 0, -7)
	} else if dateRange == "30d" {
		startDate = time.Now().AddDate(0, 0, -30)
	} else if dateRange == "90d" {
		startDate = time.Now().AddDate(0, 0, -90)
	}

	if !startDate.IsZero() {
		query = query.Where("transactions.created_at >= ?", startDate)
	}

	// Count total transactions with filters
	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count transactions"})
		return
	}

	// Calculate total pages
	totalPages := (int(total) + pageSize - 1) / pageSize

	// Get transactions with pagination
	type TransactionWithUser struct {
		ID           string    `json:"id"`
		UserID       string    `json:"userId"`
		UserName     string    `json:"userName"`
		UserEmail    string    `json:"userEmail"`
		Amount       float64   `json:"amount"`
		BalanceAfter float64   `json:"balanceAfter"`
		Description  string    `json:"description"`
		Status       string    `json:"status"`
		CreatedAt    time.Time `json:"createdAt"`
	}

	var transactions []TransactionWithUser
	rows, err := query.Select("transactions.*, users.name as user_name, users.email as user_email").
		Order("transactions.created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Rows()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get transactions"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var tx TransactionWithUser
		var id, userId, description, status, userName, userEmail string
		var amount, balanceAfter float64
		var createdAt time.Time

		rows.Scan(&id, &userId, &amount, &balanceAfter, &description, &status, &createdAt, &userName, &userEmail)

		tx = TransactionWithUser{
			ID:           id,
			UserID:       userId,
			UserName:     userName,
			UserEmail:    userEmail,
			Amount:       amount,
			BalanceAfter: balanceAfter,
			Description:  description,
			Status:       status,
			CreatedAt:    createdAt,
		}

		transactions = append(transactions, tx)
	}

	// Calculate statistics for the current filters
	var stats gin.H

	// Calculate total income
	var totalIncome, totalExpenses float64
	db.DB.Model(&models.Transaction{}).Where("amount > 0").Select("COALESCE(SUM(amount), 0)").Row().Scan(&totalIncome)
	db.DB.Model(&models.Transaction{}).Where("amount < 0").Select("COALESCE(SUM(amount), 0)").Row().Scan(&totalExpenses)

	// Calculate deposit stats
	var depositCount int64
	var totalDeposit float64
	db.DB.Model(&models.Transaction{}).Where("amount > 0").Count(&depositCount)
	db.DB.Model(&models.Transaction{}).Where("amount > 0").Select("COALESCE(SUM(amount), 0)").Row().Scan(&totalDeposit)

	var averageDeposit float64
	if depositCount > 0 {
		averageDeposit = totalDeposit / float64(depositCount)
	}

	// Count operations today
	var operationsToday int64
	db.DB.Model(&models.Transaction{}).
		Where("amount < 0 AND created_at >= ? AND description LIKE 'Operation: %'", time.Now().Truncate(24*time.Hour)).
		Count(&operationsToday)

	// Count total operations
	var totalOperations int64
	db.DB.Model(&models.Transaction{}).
		Where("amount < 0 AND description LIKE 'Operation: %'").
		Count(&totalOperations)

	stats = gin.H{
		"overview": gin.H{
			"total":           total,
			"income":          totalIncome,
			"expenses":        totalExpenses,
			"averageDeposit":  averageDeposit,
			"depositCount":    depositCount,
			"operationsToday": operationsToday,
			"totalOperations": totalOperations,
		},
	}

	// Return transactions
	c.JSON(http.StatusOK, gin.H{
		"transactions": transactions,
		"total":        total,
		"page":         pageNum,
		"pageSize":     pageSize,
		"totalPages":   totalPages,
		"stats":        stats,
	})
}

// GetActivityLogs returns system activity logs for admin viewing
func (h *AdminHandler) GetActivityLogs(c *gin.Context) {
	// Parse query parameters
	page, _ := c.GetQuery("page")
	search, _ := c.GetQuery("search")
	typeFilter, _ := c.GetQuery("type")
	//status, _ := c.GetQuery("status")
	dateRange, _ := c.GetQuery("dateRange")

	// Default to page 1 if not provided
	pageNum := 1
	if page != "" {
		// Parse the page number from string to int
		parsedPage, err := strconv.Atoi(page)
		if err == nil && parsedPage > 0 {
			pageNum = parsedPage
		}
	}

	// Define page size
	pageSize := 50
	offset := (pageNum - 1) * pageSize

	// Since we don't have a dedicated activity log table,
	// we'll use usage_stats, transactions, and possibly other tables as sources

	// For now, we'll focus on usage stats as a proxy for activity
	query := db.DB.Model(&models.UsageStats{}).Joins("JOIN users ON users.id = usage_stats.user_id")

	// Apply search filter
	if search != "" {
		query = query.Where(
			"users.name LIKE ? OR users.email LIKE ? OR usage_stats.operation LIKE ?",
			"%"+search+"%",
			"%"+search+"%",
			"%"+search+"%",
		)
	}

	// Apply type filter
	if typeFilter == "auth" {
		// We don't have auth logs in our current schema
		// This would be a placeholder for a real implementation
		query = query.Where("1 = 0") // No results
	} else if typeFilter == "api" {
		// All usage stats are API calls
	} else if typeFilter == "subscription" {
		// We don't have subscription logs in our current schema
		query = query.Where("1 = 0") // No results
	} else if typeFilter == "system" {
		// We don't have system logs in our current schema
		query = query.Where("1 = 0") // No results
	}

	// Apply date range filter
	var startDate time.Time
	if dateRange == "1h" {
		startDate = time.Now().Add(-time.Hour)
	} else if dateRange == "24h" {
		startDate = time.Now().AddDate(0, 0, -1)
	} else if dateRange == "7d" {
		startDate = time.Now().AddDate(0, 0, -7)
	} else if dateRange == "30d" {
		startDate = time.Now().AddDate(0, 0, -30)
	}

	if !startDate.IsZero() {
		query = query.Where("usage_stats.created_at >= ?", startDate)
	}

	// Count total activities with filters
	var total int64
	if err := query.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count activity logs"})
		return
	}

	// Calculate total pages
	totalPages := (int(total) + pageSize - 1) / pageSize

	// Get activities with pagination
	type ActivityLog struct {
		ID        string    `json:"id"`
		Timestamp time.Time `json:"timestamp"`
		UserID    string    `json:"userId"`
		UserName  string    `json:"userName"`
		UserEmail string    `json:"userEmail"`
		Action    string    `json:"action"`
		Resource  string    `json:"resource"`
		Details   string    `json:"details"`
		IPAddress string    `json:"ipAddress"`
		UserAgent string    `json:"userAgent"`
		Status    string    `json:"status"`
	}

	var activities []ActivityLog
	rows, err := query.Select("usage_stats.id, usage_stats.created_at as timestamp, users.id as user_id, users.name as user_name, users.email as user_email, usage_stats.operation as action").
		Order("usage_stats.created_at DESC").
		Limit(pageSize).
		Offset(offset).
		Rows()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get activity logs"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var activity ActivityLog
		var id, userId, userName, userEmail, action string
		var timestamp time.Time

		rows.Scan(&id, &timestamp, &userId, &userName, &userEmail, &action)

		activity = ActivityLog{
			ID:        id,
			Timestamp: timestamp,
			UserID:    userId,
			UserName:  userName,
			UserEmail: userEmail,
			Action:    action,
			Resource:  "api",
			Details:   "API operation performed: " + action,
			IPAddress: "127.0.0.1",  // Placeholder
			UserAgent: "API Client", // Placeholder
			Status:    "success",    // Default to success
		}

		activities = append(activities, activity)
	}

	// Calculate statistics for the current filters
	var stats gin.H

	// Count by type
	var authCount, apiCount, subCount, sysCount int64
	apiCount = total // All our current activities are API calls

	// Count by status
	var successCount, errorCount, warningCount int64
	successCount = total // Default all to success for now

	stats = gin.H{
		"totalActivities": total,
		"byType": gin.H{
			"auth":         authCount,
			"api":          apiCount,
			"subscription": subCount,
			"system":       sysCount,
		},
		"byStatus": gin.H{
			"success": successCount,
			"error":   errorCount,
			"warning": warningCount,
		},
	}

	// Return activities
	c.JSON(http.StatusOK, gin.H{
		"activities": activities,
		"total":      total,
		"page":       pageNum,
		"pageSize":   pageSize,
		"totalPages": totalPages,
		"stats":      stats,
	})
}

func (h *AdminHandler) GetPricingSettings(c *gin.Context) {
	// Get pricing settings from database
	pricingRepo := repository.NewPricingRepository()
	pricing, err := pricingRepo.GetPricingSettings()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to retrieve pricing settings: " + err.Error(),
		})
		return
	}

	// Return pricing data
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"pricing": gin.H{
			"operationCost":         pricing.OperationCost,
			"freeOperationsMonthly": pricing.FreeOperationsMonthly,
			"operations":            services.APIOperations, // Include the list of operations
			"customPrices":          pricing.CustomPrices,
			"customPlans": []gin.H{
				{
					"name":       "Free",
					"price":      0,
					"operations": pricing.FreeOperationsMonthly,
					"features": []string{
						"Basic PDF operations",
						"Limited to 500 operations per month",
						"No credit card required",
					},
				},
				{
					"name":             "Pay-as-you-go",
					"price":            pricing.OperationCost,
					"priceDescription": fmt.Sprintf("$%.3f per operation", pricing.OperationCost),
					"features": []string{
						"All PDF operations",
						"Unlimited usage",
						"Only pay for what you use",
						"No monthly fees",
					},
				},
			},
		},
	})
}

// internal/handlers/admin_handler.go - UpdateOperationPricing function updated

// UpdateOperationPricing updates operation-specific pricing
func (h *AdminHandler) UpdateOperationPricing(c *gin.Context) {
	// Parse pricing settings from request
	var req struct {
		CustomPrices map[string]float64 `json:"customPrices"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Debug log
	fmt.Printf("Received custom pricing update request: %v\n", req.CustomPrices)

	// Get current pricing settings
	pricingRepo := repository.NewPricingRepository()
	pricing, err := pricingRepo.GetPricingSettings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to retrieve current pricing settings: " + err.Error(),
		})
		return
	}

	// Debug log
	fmt.Printf("Current pricing before update: global=%.3f, custom=%v\n", pricing.OperationCost, pricing.CustomPrices)

	// Update custom prices
	pricing.CustomPrices = req.CustomPrices

	// Debug log
	fmt.Printf("New pricing to save: global=%.3f, custom=%v\n", pricing.OperationCost, pricing.CustomPrices)

	// Save updated settings
	if err := pricingRepo.SavePricingSettings(pricing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to save custom pricing: " + err.Error(),
		})
		return
	}

	// Verify the settings were saved correctly by fetching them again
	updatedPricing, err := pricingRepo.GetPricingSettings()
	if err != nil {
		fmt.Printf("Warning: Could not verify pricing was saved: %v\n", err)
	} else {
		fmt.Printf("Verified saved pricing: global=%.3f, custom=%v\n", updatedPricing.OperationCost, updatedPricing.CustomPrices)
	}

	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "Operation-specific pricing updated successfully",
		"customPrices": pricing.CustomPrices,
	})
}

// UpdateGlobalPricing function updated
func (h *AdminHandler) UpdatePricingSettings(c *gin.Context) {
	// Parse pricing settings from request
	var req struct {
		OperationCost         *float64 `json:"operationCost"`
		FreeOperationsMonthly *int     `json:"freeOperationsMonthly"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Debug log
	fmt.Printf("Received global pricing update request: cost=%.3f, freeOps=%d\n",
		*req.OperationCost, *req.FreeOperationsMonthly)

	// Get current pricing settings
	pricingRepo := repository.NewPricingRepository()
	pricing, err := pricingRepo.GetPricingSettings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to retrieve current pricing settings: " + err.Error(),
		})
		return
	}

	// Debug log
	fmt.Printf("Current pricing before update: global=%.3f, free=%d, custom=%v\n",
		pricing.OperationCost, pricing.FreeOperationsMonthly, pricing.CustomPrices)

	// Update with new values if provided
	if req.OperationCost != nil {
		pricing.OperationCost = *req.OperationCost
	}

	if req.FreeOperationsMonthly != nil {
		pricing.FreeOperationsMonthly = *req.FreeOperationsMonthly
	}

	// Debug log
	fmt.Printf("New pricing to save: global=%.3f, free=%d, custom=%v\n",
		pricing.OperationCost, pricing.FreeOperationsMonthly, pricing.CustomPrices)

	// Save updated settings
	if err := pricingRepo.SavePricingSettings(pricing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to save pricing settings: " + err.Error(),
		})
		return
	}

	// Verify the settings were saved correctly by fetching them again
	updatedPricing, err := pricingRepo.GetPricingSettings()
	if err != nil {
		fmt.Printf("Warning: Could not verify pricing was saved: %v\n", err)
	} else {
		fmt.Printf("Verified saved pricing: global=%.3f, free=%d, custom=%v\n",
			updatedPricing.OperationCost, updatedPricing.FreeOperationsMonthly, updatedPricing.CustomPrices)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pricing settings updated successfully",
		"pricing": gin.H{
			"operationCost":         pricing.OperationCost,
			"freeOperationsMonthly": pricing.FreeOperationsMonthly,
		},
	})
}

// In internal/handlers/admin_handler.go - Add this debugging function
func DebugPricingSettings() {
	pricingRepo := repository.NewPricingRepository()
	pricing, err := pricingRepo.GetPricingSettings()
	if err != nil {
		fmt.Printf("ADMIN PRICING ERROR: Failed to retrieve pricing settings: %v\n", err)
		return
	}

	fmt.Printf("ADMIN PRICING DEBUG: Current settings:\n")
	fmt.Printf("  - Global operation cost: %.6f\n", pricing.OperationCost)
	fmt.Printf("  - Free operations monthly: %d\n", pricing.FreeOperationsMonthly)
	fmt.Printf("  - Custom prices: %+v\n", pricing.CustomPrices)

	// Check database raw value
	var rawValue string
	if err := db.DB.Model(&models.PricingSetting{}).
		Where("`key` = ?", "pricing_settings").
		Select("value").
		Row().Scan(&rawValue); err == nil {
		fmt.Println("ADMIN PRICING DEBUG: Raw JSON from database:", rawValue)
	} else {
		fmt.Printf("ADMIN PRICING ERROR: Failed to get raw JSON: %v\n", err)
	}
}

// GetAllSettings returns all application settings grouped by category
func (h *AdminHandler) GetAllSettings(c *gin.Context) {
	var settings []models.AppSetting

	// Get all settings ordered by category, group, and order
	if err := db.DB.Order("category, `group`, `order`, key").Find(&settings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to retrieve settings",
			"details": err.Error(),
		})
		return
	}

	// Group settings by category
	categorizedSettings := make(map[string][]models.AppSetting)

	// Hide secret values and organize by category
	for i := range settings {
		if settings[i].IsSecret && settings[i].Value != "" {
			settings[i].Value = "***HIDDEN***"
		}

		category := settings[i].Category
		if categorizedSettings[category] == nil {
			categorizedSettings[category] = []models.AppSetting{}
		}
		categorizedSettings[category] = append(categorizedSettings[category], settings[i])
	}

	c.JSON(http.StatusOK, gin.H{
		"success":              true,
		"settings":             settings,
		"categorized_settings": categorizedSettings,
		"total_count":          len(settings),
	})
}

// GetSettingsByCategory returns settings for a specific category
func (h *AdminHandler) GetSettingsByCategory(c *gin.Context) {
	category := c.Param("category")
	if category == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Category parameter is required",
		})
		return
	}

	var settings []models.AppSetting
	if err := db.DB.Where("category = ?", category).Order("`group`, `order`, key").Find(&settings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to retrieve settings for category",
			"details": err.Error(),
		})
		return
	}

	// Hide secret values
	for i := range settings {
		if settings[i].IsSecret && settings[i].Value != "" {
			settings[i].Value = "***HIDDEN***"
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"category": category,
		"settings": settings,
		"count":    len(settings),
	})
}

// GetSetting returns a single setting
func (h *AdminHandler) GetSetting(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Key parameter is required",
		})
		return
	}

	var setting models.AppSetting
	if err := db.DB.Where("`key` = ?", key).First(&setting).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Setting not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to retrieve setting",
				"details": err.Error(),
			})
		}
		return
	}

	// Hide secret value
	if setting.IsSecret && setting.Value != "" {
		setting.Value = "***HIDDEN***"
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"setting": setting,
	})
}

// UpdateSettings updates multiple settings at once
func (h *AdminHandler) UpdateSettings(c *gin.Context) {
	var request map[string]interface{}
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Get user ID for audit trail
	userID, _ := c.Get("userID")
	userIDStr := ""
	if userID != nil {
		userIDStr = userID.(string)
	}

	// Start transaction
	tx := db.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	updatedSettings := []models.AppSetting{}
	historyEntries := []models.SettingHistory{}

	// Process each setting update
	for key, value := range request {
		var setting models.AppSetting
		if err := tx.Where("`key` = ?", key).First(&setting).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Setting '" + key + "' not found",
			})
			return
		}

		// Check if setting is read-only
		if setting.IsReadOnly {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Setting '" + key + "' is read-only",
			})
			return
		}

		// Store old value for history
		oldValue := setting.Value

		// Validate and set new value
		if err := setting.SetValue(value); err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Invalid value for setting '" + key + "'",
				"details": err.Error(),
			})
			return
		}

		// Additional validation based on setting rules
		if err := h.validateSettingValue(&setting, value); err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{
				"success": false,
				"error":   "Validation failed for setting '" + key + "'",
				"details": err.Error(),
			})
			return
		}

		setting.UpdatedBy = userIDStr

		// Save setting
		if err := tx.Save(&setting).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to update setting '" + key + "'",
				"details": err.Error(),
			})
			return
		}

		updatedSettings = append(updatedSettings, setting)

		// Create history entry if value changed
		if oldValue != setting.Value {
			history := models.SettingHistory{
				SettingID: setting.ID,
				OldValue:  oldValue,
				NewValue:  setting.Value,
				ChangedBy: userIDStr,
				Reason:    "Admin panel update",
			}
			historyEntries = append(historyEntries, history)
		}
	}

	// Save history entries
	for _, history := range historyEntries {
		if err := tx.Create(&history).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to save change history",
				"details": err.Error(),
			})
			return
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to save settings",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":          true,
		"message":          "Settings updated successfully",
		"updated_count":    len(updatedSettings),
		"updated_settings": updatedSettings,
	})
}

// UpdateSetting updates a single setting
func (h *AdminHandler) UpdateSetting(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Key parameter is required",
		})
		return
	}

	var request struct {
		Value  interface{} `json:"value" binding:"required"`
		Reason string      `json:"reason"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Get user ID for audit trail
	userID, _ := c.Get("userID")
	userIDStr := ""
	if userID != nil {
		userIDStr = userID.(string)
	}

	var setting models.AppSetting
	if err := db.DB.Where("`key` = ?", key).First(&setting).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Setting not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to retrieve setting",
				"details": err.Error(),
			})
		}
		return
	}

	// Check if setting is read-only
	if setting.IsReadOnly {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Setting is read-only",
		})
		return
	}

	// Store old value for history
	oldValue := setting.Value

	// Validate and set new value
	if err := setting.SetValue(request.Value); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid value format",
			"details": err.Error(),
		})
		return
	}

	// Additional validation
	if err := h.validateSettingValue(&setting, request.Value); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Validation failed",
			"details": err.Error(),
		})
		return
	}

	setting.UpdatedBy = userIDStr

	// Start transaction
	tx := db.DB.Begin()

	// Save setting
	if err := tx.Save(&setting).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to update setting",
			"details": err.Error(),
		})
		return
	}

	// Create history entry if value changed
	if oldValue != setting.Value {
		history := models.SettingHistory{
			SettingID: setting.ID,
			OldValue:  oldValue,
			NewValue:  setting.Value,
			ChangedBy: userIDStr,
			Reason:    request.Reason,
		}

		if err := tx.Create(&history).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to save change history",
				"details": err.Error(),
			})
			return
		}
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to save setting",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Setting updated successfully",
		"setting": setting,
	})
}

// ResetSetting resets a setting to its default value
func (h *AdminHandler) ResetSetting(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Key parameter is required",
		})
		return
	}

	// Get user ID for audit trail
	userID, _ := c.Get("userID")
	userIDStr := ""
	if userID != nil {
		userIDStr = userID.(string)
	}

	var setting models.AppSetting
	if err := db.DB.Where("`key` = ?", key).First(&setting).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Setting not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to retrieve setting",
				"details": err.Error(),
			})
		}
		return
	}

	// Check if setting is read-only
	if setting.IsReadOnly {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Setting is read-only",
		})
		return
	}

	// Store old value for history
	oldValue := setting.Value

	// Reset to default value
	setting.Value = setting.DefaultValue
	setting.UpdatedBy = userIDStr

	// Start transaction
	tx := db.DB.Begin()

	// Save setting
	if err := tx.Save(&setting).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to reset setting",
			"details": err.Error(),
		})
		return
	}

	// Create history entry
	history := models.SettingHistory{
		SettingID: setting.ID,
		OldValue:  oldValue,
		NewValue:  setting.Value,
		ChangedBy: userIDStr,
		Reason:    "Reset to default value",
	}

	if err := tx.Create(&history).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to save change history",
			"details": err.Error(),
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to reset setting",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Setting reset to default value",
		"setting": setting,
	})
}

// GetSettingHistory returns change history for a setting
func (h *AdminHandler) GetSettingHistory(c *gin.Context) {
	key := c.Param("key")
	if key == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Key parameter is required",
		})
		return
	}

	// Get setting
	var setting models.AppSetting
	if err := db.DB.Where("`key` = ?", key).First(&setting).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"success": false,
				"error":   "Setting not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"success": false,
				"error":   "Failed to retrieve setting",
				"details": err.Error(),
			})
		}
		return
	}

	// Get history
	var history []models.SettingHistory
	if err := db.DB.Where("setting_id = ?", setting.ID).Order("created_at DESC").Find(&history).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to retrieve setting history",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"setting": setting,
		"history": history,
		"count":   len(history),
	})
}

// ExportSettings exports all settings as JSON
func (h *AdminHandler) ExportSettings(c *gin.Context) {
	var settings []models.AppSetting
	if err := db.DB.Order("category, key").Find(&settings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to retrieve settings",
			"details": err.Error(),
		})
		return
	}

	// Don't export secret values
	for i := range settings {
		if settings[i].IsSecret {
			settings[i].Value = ""
		}
	}

	exportData := map[string]interface{}{
		"exported_at": time.Now(),
		"version":     "1.0",
		"settings":    settings,
	}

	c.Header("Content-Disposition", "attachment; filename=settings-export.json")
	c.JSON(http.StatusOK, exportData)
}

// ImportSettings imports settings from JSON
func (h *AdminHandler) ImportSettings(c *gin.Context) {
	var request struct {
		Settings  []models.AppSetting `json:"settings" binding:"required"`
		Overwrite bool                `json:"overwrite"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	// Get user ID for audit trail
	userID, _ := c.Get("userID")
	userIDStr := ""
	if userID != nil {
		userIDStr = userID.(string)
	}

	// Start transaction
	tx := db.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	importedCount := 0
	skippedCount := 0

	for _, importSetting := range request.Settings {
		var existingSetting models.AppSetting
		exists := tx.Where("`key` = ?", importSetting.Key).First(&existingSetting).Error == nil

		if exists && !request.Overwrite {
			skippedCount++
			continue
		}

		if exists {
			// Update existing setting
			existingSetting.Value = importSetting.Value
			existingSetting.Description = importSetting.Description
			existingSetting.UpdatedBy = userIDStr

			if err := tx.Save(&existingSetting).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"error":   "Failed to update setting: " + importSetting.Key,
					"details": err.Error(),
				})
				return
			}
		} else {
			// Create new setting
			importSetting.ID = ""
			importSetting.CreatedBy = userIDStr
			importSetting.UpdatedBy = userIDStr

			if err := tx.Create(&importSetting).Error; err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{
					"success": false,
					"error":   "Failed to create setting: " + importSetting.Key,
					"details": err.Error(),
				})
				return
			}
		}

		importedCount++
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error":   "Failed to import settings",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"message":        "Settings imported successfully",
		"imported_count": importedCount,
		"skipped_count":  skippedCount,
	})
}

// Helper function to validate setting values
func (h *AdminHandler) validateSettingValue(setting *models.AppSetting, value interface{}) error {
	rules := setting.GetValidationRules()
	if rules == nil {
		return nil
	}

	// Implement validation logic based on rules
	if minLen, exists := rules["min_length"]; exists {
		if str, ok := value.(string); ok {
			if len(str) < int(minLen.(float64)) {
				return fmt.Errorf("value must be at least %v characters", minLen)
			}
		}
	}

	if maxLen, exists := rules["max_length"]; exists {
		if str, ok := value.(string); ok {
			if len(str) > int(maxLen.(float64)) {
				return fmt.Errorf("value must be at most %v characters", maxLen)
			}
		}
	}

	if pattern, exists := rules["pattern"]; exists {
		if str, ok := value.(string); ok {
			matched, _ := regexp.MatchString(pattern.(string), str)
			if !matched {
				return fmt.Errorf("value does not match required pattern")
			}
		}
	}

	if min, exists := rules["min"]; exists {
		switch v := value.(type) {
		case int:
			if float64(v) < min.(float64) {
				return fmt.Errorf("value must be at least %v", min)
			}
		case float64:
			if v < min.(float64) {
				return fmt.Errorf("value must be at least %v", min)
			}
		}
	}

	if max, exists := rules["max"]; exists {
		switch v := value.(type) {
		case int:
			if float64(v) > max.(float64) {
				return fmt.Errorf("value must be at most %v", max)
			}
		case float64:
			if v > max.(float64) {
				return fmt.Errorf("value must be at most %v", max)
			}
		}
	}

	return nil
}
