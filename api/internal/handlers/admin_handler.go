// internal/handlers/admin_handler.go
package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminHandler struct {
	adminService    *services.AdminService
	config          *config.Config
	brandingService *services.BrandingService
}

func NewAdminHandler(cfg *config.Config, db *gorm.DB) *AdminHandler {
	return &AdminHandler{
		adminService:    services.NewAdminService(cfg, db),
		config:          cfg,
		brandingService: services.NewBrandingService(),
	}
}

// Dashboard Routes

// @Summary Get admin dashboard data
// @Description Get comprehensive dashboard data including stats, recent activity, and system health
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} models.AdminDashboardData
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/dashboard [get]
func (h *AdminHandler) GetDashboard(c *gin.Context) {
	fmt.Println("=== DEBUG: Dashboard endpoint called ===")

	// Check if user is in context
	userID, exists := c.Get("userID")
	if !exists {
		fmt.Println("ERROR: No userID in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}
	fmt.Printf("User ID from context: %s\n", userID)

	userRole, exists := c.Get("userRole")
	if !exists {
		fmt.Println("ERROR: No userRole in context")
	} else {
		fmt.Printf("User role from context: %s\n", userRole)
	}

	fmt.Println("Calling adminService.GetDashboardData()...")
	dashboardData, err := h.adminService.GetDashboardData()
	if err != nil {
		fmt.Printf("ERROR: Dashboard data failed: %v\n", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	fmt.Println("Dashboard data retrieved successfully")
	c.JSON(http.StatusOK, dashboardData)
}

// Settings Routes

// @Summary Get all admin settings
// @Description Get all admin settings grouped by category
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} object{settings=[]models.AdminSettingsGroup}
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/settings [get]
func (h *AdminHandler) GetSettings(c *gin.Context) {
	category := c.Query("category")

	if category != "" {
		settings, err := h.adminService.GetSettingsByCategory(category)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"settings": settings})
		return
	}

	settings, err := h.adminService.GetAllSettings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"settings": settings})
}

// @Summary Get branding settings
// @Description Get current branding configuration
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} models.BrandingConfig
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/branding [get]
func (h *AdminHandler) GetBranding(c *gin.Context) {
	branding, err := h.brandingService.GetBrandingSettings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, branding)
}

// @Summary Update branding settings
// @Description Update branding configuration
// @Tags admin
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param branding body models.BrandingConfig true "Branding configuration"
// @Success 200 {object} object{message=string}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/branding [put]
func (h *AdminHandler) UpdateBranding(c *gin.Context) {
	var branding models.BrandingConfig
	if err := c.ShouldBindJSON(&branding); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	// Save branding settings
	if err := h.brandingService.UpdateBrandingSettings(&branding); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Branding updated successfully"})
}

// @Summary Reset branding to defaults
// @Description Reset branding configuration to default values
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} object{message=string}
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/branding/reset [post]
func (h *AdminHandler) ResetBranding(c *gin.Context) {
	if err := h.brandingService.ResetToDefaults(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Branding reset to defaults successfully"})
}

// @Summary Update admin settings
// @Description Update multiple admin settings
// @Tags admin
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param settings body models.AdminSettingsUpdate true "Settings to update"
// @Success 200 {object} object{message=string}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/settings [put]
func (h *AdminHandler) UpdateSettings(c *gin.Context) {
	var request models.AdminSettingsUpdate
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if err := h.adminService.UpdateSettings(request.Settings); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Settings updated successfully"})
}

// Configuration Routes

// @Summary Get app configuration
// @Description Get application configuration settings
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} models.AppConfig
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/config/app [get]
func (h *AdminHandler) GetAppConfig(c *gin.Context) {
	config, err := h.adminService.GetAppConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, config)
}

// @Summary Get PayPal configuration
// @Description Get PayPal payment configuration
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} models.PayPalConfig
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/config/paypal [get]
func (h *AdminHandler) GetPayPalConfig(c *gin.Context) {
	config, err := h.adminService.GetPayPalConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, config)
}

// @Summary Get SMTP configuration
// @Description Get email SMTP configuration
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} models.SMTPConfig
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/config/smtp [get]
func (h *AdminHandler) GetSMTPConfig(c *gin.Context) {
	config, err := h.adminService.GetSMTPConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, config)
}

// @Summary Get security configuration
// @Description Get security and authentication configuration
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} models.SecurityConfig
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/config/security [get]
func (h *AdminHandler) GetSecurityConfig(c *gin.Context) {
	config, err := h.adminService.GetSecurityConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, config)
}

// User Management Routes

// @Summary Get all users
// @Description Get paginated list of all users with their stats
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Success 200 {object} object{users=[]models.AdminUserView,total=int64,page=int,limit=int}
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/users [get]
func (h *AdminHandler) GetUsers(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	users, total, err := h.adminService.GetAllUsers(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users": users,
		"total": total,
		"page":  page,
		"limit": limit,
	})
}

// @Summary Get user by ID
// @Description Get detailed information about a specific user
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} models.AdminUserView
// @Failure 401 {object} object{error=string}
// @Failure 404 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/users/{id} [get]
func (h *AdminHandler) GetUser(c *gin.Context) {
	userID := c.Param("id")

	user, err := h.adminService.GetUser(userID)
	if err != nil {
		if strings.Contains(err.Error(), "not found") {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

// @Summary Update user
// @Description Update user information (balance, role, etc.)
// @Tags admin
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "User ID"
// @Param action body models.UserManagementAction true "User action"
// @Success 200 {object} object{message=string}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 404 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/users/{id} [put]
func (h *AdminHandler) UpdateUser(c *gin.Context) {
	userID := c.Param("id")

	var action models.UserManagementAction
	if err := c.ShouldBindJSON(&action); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	switch action.Action {
	case "update_balance":
		balance, ok := action.Value.(float64)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid balance value"})
			return
		}
		if err := h.adminService.UpdateUserBalance(userID, balance); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

	case "update_role":
		role, ok := action.Value.(string)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role value"})
			return
		}
		if err := h.adminService.UpdateUserRole(userID, role); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid action"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully"})
}

// @Summary Delete user
// @Description Delete a user and all associated data
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Param id path string true "User ID"
// @Success 200 {object} object{message=string}
// @Failure 401 {object} object{error=string}
// @Failure 404 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/users/{id} [delete]
func (h *AdminHandler) DeleteUser(c *gin.Context) {
	userID := c.Param("id")

	if err := h.adminService.DeleteUser(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

// PDF Tools Management Routes

// @Summary Get PDF tools status
// @Description Get status of all PDF processing tools
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} object{tools=[]models.ToolStatus}
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/tools [get]
func (h *AdminHandler) GetPDFTools(c *gin.Context) {
	tools, err := h.adminService.GetPDFTools()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"tools": tools})
}

// @Summary Update tool status
// @Description Enable or disable a specific PDF tool
// @Tags admin
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param id path string true "Tool ID"
// @Param status body object{enabled=bool} true "Tool status"
// @Success 200 {object} object{message=string}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/tools/{id} [put]
func (h *AdminHandler) UpdateToolStatus(c *gin.Context) {
	toolID := c.Param("id")

	var request struct {
		Enabled bool `json:"enabled"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if err := h.adminService.UpdateToolStatus(toolID, request.Enabled); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tool status updated successfully"})
}

// @Summary Enable all tools
// @Description Enable all PDF processing tools
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} object{message=string}
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/tools/enable-all [post]
func (h *AdminHandler) EnableAllTools(c *gin.Context) {
	if err := h.adminService.EnableAllTools(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All tools enabled successfully"})
}

// @Summary Disable all tools
// @Description Disable all PDF processing tools
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} object{message=string}
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/tools/disable-all [post]
func (h *AdminHandler) DisableAllTools(c *gin.Context) {
	if err := h.adminService.DisableAllTools(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All tools disabled successfully"})
}

// Pricing Management Routes

// @Summary Get pricing settings
// @Description Get current pricing configuration
// @Tags admin
// @Security BearerAuth
// @Produce json
// @Success 200 {object} models.CustomPricing
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/pricing [get]
func (h *AdminHandler) GetPricing(c *gin.Context) {
	pricing, err := h.adminService.GetPricingSettings()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, pricing)
}

// @Summary Update pricing settings
// @Description Update pricing configuration
// @Tags admin
// @Security BearerAuth
// @Accept json
// @Produce json
// @Param pricing body models.CustomPricing true "Pricing configuration"
// @Success 200 {object} object{message=string}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/admin/pricing [put]
func (h *AdminHandler) UpdatePricing(c *gin.Context) {
	var pricing models.CustomPricing
	if err := c.ShouldBindJSON(&pricing); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
		return
	}

	if err := h.adminService.UpdatePricingSettings(&pricing); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pricing updated successfully"})
}

// Static Admin Panel Route
// @Summary Serve admin panel
// @Description Serve the admin panel HTML interface
// @Tags admin
// @Produce html
// @Success 200 {string} string "HTML content"
// @Router /admin [get]
func (h *AdminHandler) ServeAdminPanel(c *gin.Context) {
	c.HTML(http.StatusOK, "index.html", gin.H{ // ✅ Correct path
		"title":  "MegaPDF Admin Panel",
		"apiUrl": h.config.APIUrl,
	})
}
