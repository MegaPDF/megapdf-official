// internal/handlers/env_file_handler.go - Updated with config reload
package handlers

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
)

type EnvFileHandler struct {
	envService *services.EnvFileService
}

func NewEnvFileHandler() *EnvFileHandler {
	// Get env file path from config system
	envPath := config.GetEnvFilePath()
	if envPath == "" {
		// Look for .env file in current directory or parent directories
		currentDir, _ := os.Getwd()

		// Try current directory
		envPath = filepath.Join(currentDir, ".env")
		if _, err := os.Stat(envPath); os.IsNotExist(err) {
			// Try parent directory (for cases where we're in api/ subdirectory)
			parentDir := filepath.Dir(currentDir)
			envPath = filepath.Join(parentDir, ".env")
			if _, err := os.Stat(envPath); os.IsNotExist(err) {
				// Default to current directory
				envPath = ".env"
			}
		}
	}

	return &EnvFileHandler{
		envService: services.NewEnvFileService(envPath),
	}
}

// GetEnvironmentVariables gets all environment variables organized by category
func (h *EnvFileHandler) GetEnvironmentVariables(c *gin.Context) {
	categories, err := h.envService.GetCategorizedVariables()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read environment variables: " + err.Error(),
		})
		return
	}

	// Mask sensitive values for response
	for i := range categories {
		for j := range categories[i].Variables {
			if categories[i].Variables[j].Sensitive && categories[i].Variables[j].Value != "" {
				categories[i].Variables[j].Value = "********"
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success":    true,
		"categories": categories,
		"envFile":    h.envService.GetEnvFilePath(),
	})
}

// UpdateEnvironmentVariables updates environment variables and reloads config
func (h *EnvFileHandler) UpdateEnvironmentVariables(c *gin.Context) {
	var req struct {
		Variables map[string]string `json:"variables" binding:"required"`
		Restart   bool              `json:"restart"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format: " + err.Error(),
		})
		return
	}

	// Read current variables to preserve existing ones not being updated
	currentVars, err := h.envService.ReadEnvFile()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read current environment variables: " + err.Error(),
		})
		return
	}

	// Process updates
	for key, value := range req.Variables {
		// Skip empty values for sensitive fields unless explicitly setting them
		if value == "********" {
			// Don't update if it's the masked value
			continue
		}

		// Validate key format
		if !isValidEnvKey(key) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Invalid environment variable key: %s", key),
			})
			return
		}

		// Update the variable
		if strings.TrimSpace(value) == "" {
			// Remove empty variables
			delete(currentVars, key)
		} else {
			currentVars[key] = strings.TrimSpace(value)
		}
	}

	// Validate required variables
	if err := h.envService.ValidateVariables(currentVars); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Validation failed: " + err.Error(),
		})
		return
	}

	// Write updated variables to file
	if err := h.envService.WriteEnvFile(currentVars); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to write environment variables: " + err.Error(),
		})
		return
	}

	// IMPORTANT: Reload application configuration from updated .env file
	if err := config.UpdateConfigFromEnvFile(); err != nil {
		// Log error but don't fail the request
		fmt.Printf("Warning: Failed to reload config from .env file: %v\n", err)
	}

	// Update current process environment variables for immediate effect
	for key, value := range req.Variables {
		if value != "********" && strings.TrimSpace(value) != "" {
			os.Setenv(key, value)
		}
	}

	response := gin.H{
		"success": true,
		"message": "Environment variables updated successfully",
	}

	// Add restart recommendation for certain variables
	criticalVars := []string{"JWT_SECRET", "DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD"}
	needsRestart := false
	for _, criticalVar := range criticalVars {
		if _, updated := req.Variables[criticalVar]; updated {
			needsRestart = true
			break
		}
	}

	if needsRestart {
		response["restartRecommended"] = true
		response["message"] = "Environment variables updated successfully. Configuration reloaded, but restart recommended for database changes."
	} else {
		response["configReloaded"] = true
		response["message"] = "Environment variables updated and configuration reloaded successfully."
	}

	c.JSON(http.StatusOK, response)
}

// GetEnvironmentFileContent gets the raw content of the .env file
func (h *EnvFileHandler) GetEnvironmentFileContent(c *gin.Context) {
	envPath := h.envService.GetEnvFilePath()

	// Check if file exists
	if _, err := os.Stat(envPath); os.IsNotExist(err) {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"content": "",
			"exists":  false,
			"path":    envPath,
		})
		return
	}

	// Read file content
	content, err := os.ReadFile(envPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read .env file: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"content": string(content),
		"exists":  true,
		"path":    envPath,
	})
}

// CreateEnvironmentFile creates a new .env file with default values
func (h *EnvFileHandler) CreateEnvironmentFile(c *gin.Context) {
	var req struct {
		Template string `json:"template"` // "basic", "production", "development"
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		req.Template = "basic"
	}

	// Get template variables
	templateVars := h.getTemplateVariables(req.Template)

	// Write to file
	if err := h.envService.WriteEnvFile(templateVars); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create .env file: " + err.Error(),
		})
		return
	}

	// Reload configuration after creating new file
	if err := config.UpdateConfigFromEnvFile(); err != nil {
		fmt.Printf("Warning: Failed to reload config after creating .env file: %v\n", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"message":        "Environment file created and configuration loaded successfully",
		"template":       req.Template,
		"path":           h.envService.GetEnvFilePath(),
		"configReloaded": true,
	})
}

// GetBackupFiles gets list of backup files
func (h *EnvFileHandler) GetBackupFiles(c *gin.Context) {
	backups, err := h.envService.GetBackupFiles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get backup files: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"backups": backups,
	})
}

// RestoreFromBackup restores .env file from backup
func (h *EnvFileHandler) RestoreFromBackup(c *gin.Context) {
	backupName := c.Param("backup")
	if backupName == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Backup name is required",
		})
		return
	}

	if err := h.envService.RestoreFromBackup(backupName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to restore from backup: " + err.Error(),
		})
		return
	}

	// Reload configuration after restore
	if err := config.UpdateConfigFromEnvFile(); err != nil {
		fmt.Printf("Warning: Failed to reload config after restore: %v\n", err)
	}

	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"message":        "Successfully restored from backup and reloaded configuration: " + backupName,
		"configReloaded": true,
	})
}

// ValidateEnvironmentVariables validates environment variables without saving
func (h *EnvFileHandler) ValidateEnvironmentVariables(c *gin.Context) {
	var req struct {
		Variables map[string]string `json:"variables" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request format: " + err.Error(),
		})
		return
	}

	// Validate variables
	if err := h.envService.ValidateVariables(req.Variables); err != nil {
		c.JSON(http.StatusOK, gin.H{
			"valid": false,
			"error": err.Error(),
		})
		return
	}

	// Additional validation checks
	warnings := []string{}

	// Check for common issues
	if jwtSecret, exists := req.Variables["JWT_SECRET"]; exists {
		if len(jwtSecret) < 32 {
			warnings = append(warnings, "JWT_SECRET should be at least 32 characters long for security")
		}
	}

	if dbPassword, exists := req.Variables["DB_PASSWORD"]; exists {
		if len(dbPassword) < 8 {
			warnings = append(warnings, "DB_PASSWORD should be at least 8 characters long")
		}
	}

	// Check URL formats
	urlVars := []string{"APP_URL", "API_URL", "OAUTH_REDIRECT_URL"}
	for _, urlVar := range urlVars {
		if url, exists := req.Variables[urlVar]; exists && url != "" {
			if !strings.HasPrefix(url, "http://") && !strings.HasPrefix(url, "https://") {
				warnings = append(warnings, fmt.Sprintf("%s should start with http:// or https://", urlVar))
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"valid":    true,
		"warnings": warnings,
	})
}

// GetEnvironmentStatus gets the current status of environment configuration
func (h *EnvFileHandler) GetEnvironmentStatus(c *gin.Context) {
	envPath := h.envService.GetEnvFilePath()

	// Check if file exists
	fileExists := true
	if _, err := os.Stat(envPath); os.IsNotExist(err) {
		fileExists = false
	}

	// Get current environment variables
	currentVars, err := h.envService.ReadEnvFile()
	if err != nil && fileExists {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read environment file: " + err.Error(),
		})
		return
	}

	// Get backups
	backups, _ := h.envService.GetBackupFiles()

	// Check configuration completeness
	categories, _ := h.envService.GetCategorizedVariables()
	requiredMissing := []string{}
	optionalMissing := []string{}
	configured := 0
	total := 0

	for _, category := range categories {
		for _, variable := range category.Variables {
			total++
			if value, exists := currentVars[variable.Key]; exists && strings.TrimSpace(value) != "" {
				configured++
			} else {
				if variable.Required {
					requiredMissing = append(requiredMissing, variable.Key)
				} else {
					optionalMissing = append(optionalMissing, variable.Key)
				}
			}
		}
	}

	status := "incomplete"
	if len(requiredMissing) == 0 {
		if configured == total {
			status = "complete"
		} else {
			status = "partial"
		}
	}

	// Get current config status
	currentConfig := config.GetConfig()
	configStatus := map[string]interface{}{
		"jwtSecret": currentConfig.JWTSecret != "your-default-secret-key",
		"database":  currentConfig.DBHost != "" && currentConfig.DBUser != "",
		"email":     currentConfig.SMTPHost != "",
		"paypal":    currentConfig.PayPalClientID != "",
		"google":    currentConfig.GoogleClientID != "",
	}

	c.JSON(http.StatusOK, gin.H{
		"success":         true,
		"fileExists":      fileExists,
		"filePath":        envPath,
		"status":          status,
		"configured":      configured,
		"total":           total,
		"requiredMissing": requiredMissing,
		"optionalMissing": optionalMissing,
		"backupCount":     len(backups),
		"lastBackup": func() string {
			if len(backups) > 0 {
				return backups[0]
			} else {
				return ""
			}
		}(),
		"configStatus": configStatus,
		"configLoaded": currentConfig != nil,
	})
}

// Helper functions

func isValidEnvKey(key string) bool {
	if key == "" {
		return false
	}

	// Check if key contains only valid characters (letters, numbers, underscore)
	for _, char := range key {
		if !((char >= 'A' && char <= 'Z') || (char >= '0' && char <= '9') || char == '_') {
			return false
		}
	}

	return true
}

func (h *EnvFileHandler) getTemplateVariables(template string) map[string]string {
	baseVars := map[string]string{
		"APP_URL":     "http://localhost:3000",
		"API_URL":     "http://localhost:8080",
		"PORT":        "8080",
		"JWT_SECRET":  "your-very-secure-secret-key-change-this-in-production",
		"DB_HOST":     "localhost",
		"DB_PORT":     "3306",
		"DB_NAME":     "megapdf",
		"DB_USER":     "root",
		"DB_PASSWORD": "",
		"EMAIL_FROM":  "noreply@mega-pdf.com",
	}

	switch template {
	case "development":
		baseVars["DEBUG"] = "true"
		baseVars["SMTP_HOST"] = ""
		baseVars["SMTP_PORT"] = "587"
		baseVars["SMTP_USER"] = ""
		baseVars["SMTP_PASS"] = ""

	case "production":
		baseVars["DEBUG"] = "false"
		baseVars["APP_URL"] = "https://your-domain.com"
		baseVars["API_URL"] = "https://api.your-domain.com"
		baseVars["SMTP_HOST"] = "smtp.gmail.com"
		baseVars["SMTP_PORT"] = "587"
		baseVars["SMTP_SECURE"] = "true"
		baseVars["PAYPAL_API_BASE"] = "https://api-m.paypal.com"

	default: // basic
		// Just use base variables
	}

	return baseVars
}
