// api/internal/handlers/admin_dashboard_handler.go
package handlers

import (
	"net/http"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/gin-gonic/gin"
)

type AdminDashboardHandler struct {
	config *config.Config
}

func NewAdminDashboardHandler(cfg *config.Config) *AdminDashboardHandler {
	return &AdminDashboardHandler{
		config: cfg,
	}
}

// AdminLoginPage serves the admin login page
func (h *AdminDashboardHandler) AdminLoginPage(c *gin.Context) {
	c.HTML(http.StatusOK, "admin_login.html", gin.H{
		"title":  "Admin Login - MegaPDF",
		"apiUrl": h.config.APIUrl,
	})
}

// AdminDashboardPage serves the main admin dashboard
func (h *AdminDashboardHandler) AdminDashboardPage(c *gin.Context) {
	// Check if user is authenticated and is admin
	userRole, exists := c.Get("userRole")
	if !exists || userRole != "admin" {
		c.Redirect(http.StatusTemporaryRedirect, "/admin/login")
		return
	}

	// Get dashboard stats
	stats := h.getDashboardStats()

	c.HTML(http.StatusOK, "admin_dashboard.html", gin.H{
		"title":     "Admin Dashboard - MegaPDF",
		"apiUrl":    h.config.APIUrl,
		"stats":     stats,
		"debugMode": h.config.Debug,
	})
}

// AdminUsersPage serves the users management page
func (h *AdminDashboardHandler) AdminUsersPage(c *gin.Context) {
	userRole, exists := c.Get("userRole")
	if !exists || userRole != "admin" {
		c.Redirect(http.StatusTemporaryRedirect, "/admin/login")
		return
	}

	c.HTML(http.StatusOK, "admin_users.html", gin.H{
		"title":  "User Management - MegaPDF",
		"apiUrl": h.config.APIUrl,
	})
}

// AdminSettingsPage serves the settings page
func (h *AdminDashboardHandler) AdminSettingsPage(c *gin.Context) {
	userRole, exists := c.Get("userRole")
	if !exists || userRole != "admin" {
		c.Redirect(http.StatusTemporaryRedirect, "/admin/login")
		return
	}

	c.HTML(http.StatusOK, "admin_settings.html", gin.H{
		"title":  "Settings - MegaPDF",
		"apiUrl": h.config.APIUrl,
	})
}

// AdminAPIDocsPage serves the API documentation page
func (h *AdminDashboardHandler) AdminAPIDocsPage(c *gin.Context) {
	userRole, exists := c.Get("userRole")
	if !exists || userRole != "admin" {
		c.Redirect(http.StatusTemporaryRedirect, "/admin/login")
		return
	}

	c.HTML(http.StatusOK, "admin_api_docs.html", gin.H{
		"title":      "API Documentation - MegaPDF",
		"apiUrl":     h.config.APIUrl,
		"swaggerUrl": h.config.APIUrl + "/swagger/index.html",
	})
}

// AdminTransactionsPage serves the transactions page
func (h *AdminDashboardHandler) AdminTransactionsPage(c *gin.Context) {
	userRole, exists := c.Get("userRole")
	if !exists || userRole != "admin" {
		c.Redirect(http.StatusTemporaryRedirect, "/admin/login")
		return
	}

	c.HTML(http.StatusOK, "admin_transactions.html", gin.H{
		"title":  "Transactions - MegaPDF",
		"apiUrl": h.config.APIUrl,
	})
}

// Helper function to get dashboard statistics
func (h *AdminDashboardHandler) getDashboardStats() map[string]interface{} {
	stats := make(map[string]interface{})

	// Get user count
	var userCount int64
	db.DB.Model(&models.User{}).Count(&userCount)
	stats["userCount"] = userCount

	// Get admin count
	var adminCount int64
	db.DB.Model(&models.User{}).Where("role = ?", "admin").Count(&adminCount)
	stats["adminCount"] = adminCount

	// Get transaction count
	var transactionCount int64
	db.DB.Model(&models.Transaction{}).Count(&transactionCount)
	stats["transactionCount"] = transactionCount

	// Get total revenue
	var totalRevenue float64
	db.DB.Model(&models.Transaction{}).
		Where("status = ?", "completed").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalRevenue)
	stats["totalRevenue"] = totalRevenue

	// Get today's stats
	today := time.Now().Truncate(24 * time.Hour)
	var todayUsers int64
	var todayTransactions int64
	var todayRevenue float64

	db.DB.Model(&models.User{}).Where("created_at >= ?", today).Count(&todayUsers)
	db.DB.Model(&models.Transaction{}).Where("created_at >= ?", today).Count(&todayTransactions)
	db.DB.Model(&models.Transaction{}).
		Where("created_at >= ? AND status = ?", today, "completed").
		Select("COALESCE(SUM(amount), 0)").
		Scan(&todayRevenue)

	stats["todayUsers"] = todayUsers
	stats["todayTransactions"] = todayTransactions
	stats["todayRevenue"] = todayRevenue

	// Get API key count
	var apiKeyCount int64
	db.DB.Model(&models.ApiKey{}).Count(&apiKeyCount)
	stats["apiKeyCount"] = apiKeyCount

	return stats
}
