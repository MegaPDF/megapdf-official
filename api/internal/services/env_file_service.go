// internal/services/env_file_service.go
package services

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

type EnvFileService struct {
	envFilePath string
}

type EnvVariable struct {
	Key         string `json:"key"`
	Value       string `json:"value"`
	Description string `json:"description"`
	Category    string `json:"category"`
	Required    bool   `json:"required"`
	Sensitive   bool   `json:"sensitive"`
	Example     string `json:"example"`
}

type EnvCategory struct {
	Name        string        `json:"name"`
	Description string        `json:"description"`
	Variables   []EnvVariable `json:"variables"`
}

func NewEnvFileService(envFilePath string) *EnvFileService {
	if envFilePath == "" {
		envFilePath = ".env"
	}
	return &EnvFileService{
		envFilePath: envFilePath,
	}
}

// GetEnvFilePath returns the current .env file path
func (s *EnvFileService) GetEnvFilePath() string {
	return s.envFilePath
}

// ReadEnvFile reads and parses the .env file
func (s *EnvFileService) ReadEnvFile() (map[string]string, error) {
	envVars := make(map[string]string)

	// Check if file exists
	if _, err := os.Stat(s.envFilePath); os.IsNotExist(err) {
		// Return empty map if file doesn't exist
		return envVars, nil
	}

	file, err := os.Open(s.envFilePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open .env file: %w", err)
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	lineNumber := 0

	for scanner.Scan() {
		lineNumber++
		line := strings.TrimSpace(scanner.Text())

		// Skip empty lines and comments
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		// Parse key=value pairs
		parts := strings.SplitN(line, "=", 2)
		if len(parts) != 2 {
			continue // Skip invalid lines
		}

		key := strings.TrimSpace(parts[0])
		value := strings.TrimSpace(parts[1])

		// Remove quotes if present
		if len(value) >= 2 {
			if (strings.HasPrefix(value, "\"") && strings.HasSuffix(value, "\"")) ||
				(strings.HasPrefix(value, "'") && strings.HasSuffix(value, "'")) {
				value = value[1 : len(value)-1]
			}
		}

		envVars[key] = value
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("error reading .env file: %w", err)
	}

	return envVars, nil
}

// WriteEnvFile writes environment variables to the .env file
func (s *EnvFileService) WriteEnvFile(envVars map[string]string) error {
	// Create backup first
	if err := s.createBackup(); err != nil {
		return fmt.Errorf("failed to create backup: %w", err)
	}

	// Ensure directory exists
	dir := filepath.Dir(s.envFilePath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	file, err := os.Create(s.envFilePath)
	if err != nil {
		return fmt.Errorf("failed to create .env file: %w", err)
	}
	defer file.Close()

	// Write header comment
	_, err = file.WriteString(fmt.Sprintf("# MegaPDF Environment Configuration\n"))
	if err != nil {
		return err
	}
	_, err = file.WriteString(fmt.Sprintf("# Generated on %s\n", time.Now().Format("2006-01-02 15:04:05")))
	if err != nil {
		return err
	}
	_, err = file.WriteString(fmt.Sprintf("# DO NOT EDIT MANUALLY - Use admin panel to modify\n\n"))
	if err != nil {
		return err
	}

	// Get categorized variables
	categories := s.getCategorizedVariables(envVars)

	// Write variables by category
	for _, category := range categories {
		if len(category.Variables) == 0 {
			continue
		}

		// Write category header
		_, err = file.WriteString(fmt.Sprintf("# %s\n", category.Name))
		if err != nil {
			return err
		}
		if category.Description != "" {
			_, err = file.WriteString(fmt.Sprintf("# %s\n", category.Description))
			if err != nil {
				return err
			}
		}

		// Write variables in this category
		for _, variable := range category.Variables {
			if value, exists := envVars[variable.Key]; exists {
				// Add description as comment if available
				if variable.Description != "" {
					_, err = file.WriteString(fmt.Sprintf("# %s\n", variable.Description))
					if err != nil {
						return err
					}
				}

				// Quote value if it contains spaces or special characters
				if strings.Contains(value, " ") || strings.Contains(value, "#") || strings.Contains(value, "=") {
					_, err = file.WriteString(fmt.Sprintf("%s=\"%s\"\n", variable.Key, value))
				} else {
					_, err = file.WriteString(fmt.Sprintf("%s=%s\n", variable.Key, value))
				}
				if err != nil {
					return err
				}
			}
		}
		_, err = file.WriteString("\n")
		if err != nil {
			return err
		}
	}

	return nil
}

// GetCategorizedVariables returns environment variables organized by category
func (s *EnvFileService) GetCategorizedVariables() ([]EnvCategory, error) {
	envVars, err := s.ReadEnvFile()
	if err != nil {
		return nil, err
	}

	return s.getCategorizedVariables(envVars), nil
}

// getCategorizedVariables organizes variables by category
func (s *EnvFileService) getCategorizedVariables(envVars map[string]string) []EnvCategory {
	// Define variable definitions with categories
	variableDefinitions := s.getVariableDefinitions()

	// Group by category
	categoryMap := make(map[string]*EnvCategory)

	for _, varDef := range variableDefinitions {
		if _, exists := categoryMap[varDef.Category]; !exists {
			categoryMap[varDef.Category] = &EnvCategory{
				Name:        varDef.Category,
				Description: s.getCategoryDescription(varDef.Category),
				Variables:   []EnvVariable{},
			}
		}

		// Set current value
		if value, exists := envVars[varDef.Key]; exists {
			varDef.Value = value
		}

		categoryMap[varDef.Category].Variables = append(categoryMap[varDef.Category].Variables, varDef)
	}

	// Convert to slice and sort
	categories := make([]EnvCategory, 0, len(categoryMap))
	for _, category := range categoryMap {
		// Sort variables within category
		sort.Slice(category.Variables, func(i, j int) bool {
			return category.Variables[i].Key < category.Variables[j].Key
		})
		categories = append(categories, *category)
	}

	// Sort categories
	sort.Slice(categories, func(i, j int) bool {
		order := map[string]int{
			"Application":  1,
			"Database":     2,
			"Security":     3,
			"Email":        4,
			"Payment":      5,
			"OAuth":        6,
			"File Storage": 7,
			"Development":  8,
		}
		return order[categories[i].Name] < order[categories[j].Name]
	})

	return categories
}

// getVariableDefinitions returns all supported environment variables
func (s *EnvFileService) getVariableDefinitions() []EnvVariable {
	return []EnvVariable{
		// Application
		{Key: "APP_URL", Category: "Application", Description: "Frontend application URL", Required: true, Example: "http://localhost:3000"},
		{Key: "API_URL", Category: "Application", Description: "Backend API URL", Required: true, Example: "http://localhost:8080"},
		{Key: "PORT", Category: "Application", Description: "Server port", Required: false, Example: "8080"},
		{Key: "DEBUG", Category: "Application", Description: "Enable debug mode", Required: false, Example: "true"},
		{Key: "TEMP_DIR", Category: "Application", Description: "Temporary files directory", Required: false, Example: "temp"},
		{Key: "UPLOAD_DIR", Category: "Application", Description: "Upload directory", Required: false, Example: "uploads"},
		{Key: "PUBLIC_DIR", Category: "Application", Description: "Public files directory", Required: false, Example: "public"},

		// Database
		{Key: "DB_HOST", Category: "Database", Description: "Database host", Required: true, Example: "localhost"},
		{Key: "DB_PORT", Category: "Database", Description: "Database port", Required: false, Example: "3306"},
		{Key: "DB_NAME", Category: "Database", Description: "Database name", Required: true, Example: "megapdf"},
		{Key: "DB_USER", Category: "Database", Description: "Database username", Required: true, Example: "root"},
		{Key: "DB_PASSWORD", Category: "Database", Description: "Database password", Required: true, Sensitive: true, Example: "your-password"},
		{Key: "DB_CHARSET", Category: "Database", Description: "Database charset", Required: false, Example: "utf8mb4"},
		{Key: "DB_COLLATION", Category: "Database", Description: "Database collation", Required: false, Example: "utf8mb4_unicode_ci"},
		{Key: "DB_TIMEZONE", Category: "Database", Description: "Database timezone", Required: false, Example: "UTC"},
		{Key: "DB_MAX_IDLE_CONNS", Category: "Database", Description: "Maximum idle connections", Required: false, Example: "10"},
		{Key: "DB_MAX_OPEN_CONNS", Category: "Database", Description: "Maximum open connections", Required: false, Example: "100"},

		// Security
		{Key: "JWT_SECRET", Category: "Security", Description: "JWT signing secret", Required: true, Sensitive: true, Example: "your-very-secure-secret-key"},

		// Email
		{Key: "EMAIL_FROM", Category: "Email", Description: "From email address", Required: false, Example: "noreply@mega-pdf.com"},
		{Key: "SMTP_HOST", Category: "Email", Description: "SMTP server host", Required: false, Example: "smtp.gmail.com"},
		{Key: "SMTP_PORT", Category: "Email", Description: "SMTP server port", Required: false, Example: "587"},
		{Key: "SMTP_USER", Category: "Email", Description: "SMTP username", Required: false, Example: "your-email@gmail.com"},
		{Key: "SMTP_PASS", Category: "Email", Description: "SMTP password", Required: false, Sensitive: true, Example: "your-app-password"},
		{Key: "SMTP_SECURE", Category: "Email", Description: "Use TLS/SSL", Required: false, Example: "true"},
		{Key: "CONTACT_RECIPIENT_EMAIL", Category: "Email", Description: "Contact form recipient", Required: false, Example: "support@mega-pdf.com"},

		// Payment
		{Key: "PAYPAL_CLIENT_ID", Category: "Payment", Description: "PayPal Client ID", Required: false, Sensitive: true, Example: "your-paypal-client-id"},
		{Key: "PAYPAL_CLIENT_SECRET", Category: "Payment", Description: "PayPal Client Secret", Required: false, Sensitive: true, Example: "your-paypal-secret"},
		{Key: "PAYPAL_API_BASE", Category: "Payment", Description: "PayPal API Base URL", Required: false, Example: "https://api-m.sandbox.paypal.com"},

		// OAuth
		{Key: "GOOGLE_CLIENT_ID", Category: "OAuth", Description: "Google OAuth Client ID", Required: false, Sensitive: true, Example: "your-google-client-id"},
		{Key: "GOOGLE_CLIENT_SECRET", Category: "OAuth", Description: "Google OAuth Client Secret", Required: false, Sensitive: true, Example: "your-google-secret"},
		{Key: "OAUTH_REDIRECT_URL", Category: "OAuth", Description: "OAuth redirect URL", Required: false, Example: "http://localhost:8080/api/auth/google/callback"},
	}
}

// getCategoryDescription returns description for a category
func (s *EnvFileService) getCategoryDescription(category string) string {
	descriptions := map[string]string{
		"Application":  "Basic application configuration",
		"Database":     "Database connection settings",
		"Security":     "Security and authentication settings",
		"Email":        "Email and SMTP configuration",
		"Payment":      "Payment gateway configuration",
		"OAuth":        "OAuth provider settings",
		"File Storage": "File storage and directory settings",
		"Development":  "Development and debugging settings",
	}
	return descriptions[category]
}

// createBackup creates a backup of the current .env file
func (s *EnvFileService) createBackup() error {
	// Check if original file exists
	if _, err := os.Stat(s.envFilePath); os.IsNotExist(err) {
		return nil // No backup needed if file doesn't exist
	}

	// Create backups directory
	backupDir := filepath.Join(filepath.Dir(s.envFilePath), "backups")
	if err := os.MkdirAll(backupDir, 0755); err != nil {
		return err
	}

	// Create backup filename with timestamp
	timestamp := time.Now().Format("20060102_150405")
	backupPath := filepath.Join(backupDir, fmt.Sprintf(".env.backup_%s", timestamp))

	// Copy file
	sourceFile, err := os.Open(s.envFilePath)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destFile, err := os.Create(backupPath)
	if err != nil {
		return err
	}
	defer destFile.Close()

	// Copy content
	scanner := bufio.NewScanner(sourceFile)
	for scanner.Scan() {
		_, err := destFile.WriteString(scanner.Text() + "\n")
		if err != nil {
			return err
		}
	}

	return scanner.Err()
}

// GetBackupFiles returns list of backup files
func (s *EnvFileService) GetBackupFiles() ([]string, error) {
	backupDir := filepath.Join(filepath.Dir(s.envFilePath), "backups")

	files, err := os.ReadDir(backupDir)
	if err != nil {
		if os.IsNotExist(err) {
			return []string{}, nil
		}
		return nil, err
	}

	var backups []string
	for _, file := range files {
		if strings.HasPrefix(file.Name(), ".env.backup_") {
			backups = append(backups, file.Name())
		}
	}

	// Sort by newest first
	sort.Sort(sort.Reverse(sort.StringSlice(backups)))
	return backups, nil
}

// RestoreFromBackup restores .env file from backup
func (s *EnvFileService) RestoreFromBackup(backupName string) error {
	backupDir := filepath.Join(filepath.Dir(s.envFilePath), "backups")
	backupPath := filepath.Join(backupDir, backupName)

	// Validate backup file exists
	if _, err := os.Stat(backupPath); os.IsNotExist(err) {
		return fmt.Errorf("backup file not found: %s", backupName)
	}

	// Create backup of current file before restore
	if err := s.createBackup(); err != nil {
		return fmt.Errorf("failed to backup current file before restore: %w", err)
	}

	// Copy backup to main file
	sourceFile, err := os.Open(backupPath)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destFile, err := os.Create(s.envFilePath)
	if err != nil {
		return err
	}
	defer destFile.Close()

	scanner := bufio.NewScanner(sourceFile)
	for scanner.Scan() {
		_, err := destFile.WriteString(scanner.Text() + "\n")
		if err != nil {
			return err
		}
	}

	return scanner.Err()
}

// ValidateVariables validates environment variables
func (s *EnvFileService) ValidateVariables(envVars map[string]string) error {
	definitions := s.getVariableDefinitions()

	for _, def := range definitions {
		if def.Required {
			if value, exists := envVars[def.Key]; !exists || strings.TrimSpace(value) == "" {
				return fmt.Errorf("required variable %s is missing or empty", def.Key)
			}
		}
	}

	return nil
}

// MaskSensitiveValues masks sensitive values in environment variables
func (s *EnvFileService) MaskSensitiveValues(envVars map[string]string) map[string]string {
	definitions := s.getVariableDefinitions()
	sensitiveKeys := make(map[string]bool)

	for _, def := range definitions {
		if def.Sensitive {
			sensitiveKeys[def.Key] = true
		}
	}

	masked := make(map[string]string)
	for key, value := range envVars {
		if sensitiveKeys[key] && value != "" {
			masked[key] = "********"
		} else {
			masked[key] = value
		}
	}

	return masked
}
