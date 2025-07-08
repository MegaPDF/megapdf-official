// internal/repository/branding_repository.go
package repository

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// BrandingRepository handles database operations for branding settings
type BrandingRepository struct{}

// NewBrandingRepository creates a new BrandingRepository
func NewBrandingRepository() *BrandingRepository {
	return &BrandingRepository{}
}

// GetBrandingSettings retrieves all branding settings
func (r *BrandingRepository) GetBrandingSettings() (*models.BrandingConfig, error) {
	fmt.Println("BRANDING REPO: Fetching branding settings from database")

	var setting models.BrandingSetting
	result := db.DB.Where("`key` = ?", "branding_settings").First(&setting)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		fmt.Println("BRANDING REPO: No branding settings found in database, returning defaults")

		// Return default settings if not found
		return models.DefaultBrandingConfig(), nil
	} else if result.Error != nil {
		fmt.Printf("BRANDING REPO ERROR: Failed to fetch branding settings: %v\n", result.Error)
		return nil, result.Error
	}

	// Unmarshal the settings
	fmt.Printf("BRANDING REPO: Retrieved settings from database, raw value: %s\n", setting.Value)
	var branding models.BrandingConfig
	if err := json.Unmarshal([]byte(setting.Value), &branding); err != nil {
		fmt.Printf("BRANDING REPO CRITICAL ERROR: Failed to unmarshal branding settings: %v\n", err)
		fmt.Printf("Raw JSON: %s\n", setting.Value)
		return nil, err
	}

	fmt.Printf("BRANDING REPO SUCCESS: Unmarshaled settings: app=%s, description=%s\n",
		branding.AppName, branding.AppDescription)

	return &branding, nil
}

// SaveBrandingSettings saves branding settings to the database
func (r *BrandingRepository) SaveBrandingSettings(branding *models.BrandingConfig) error {
	fmt.Printf("BRANDING REPO: Saving branding settings: app=%s, description=%s\n",
		branding.AppName, branding.AppDescription)

	// Marshal the settings to JSON
	brandingJSON, err := json.Marshal(branding)
	if err != nil {
		fmt.Printf("BRANDING REPO ERROR: Failed to marshal branding settings: %v\n", err)
		return err
	}

	// Check if record exists
	var setting models.BrandingSetting
	result := db.DB.Where("`key` = ?", "branding_settings").First(&setting)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		fmt.Println("BRANDING REPO: Creating new branding settings record")

		// Create new record
		setting = models.BrandingSetting{
			ID:          uuid.New().String(),
			Key:         "branding_settings",
			Value:       string(brandingJSON),
			Description: "Dynamic branding settings for application",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		err := db.DB.Create(&setting).Error
		if err != nil {
			fmt.Printf("BRANDING REPO ERROR: Failed to create branding settings: %v\n", err)
		} else {
			fmt.Println("BRANDING REPO SUCCESS: Created new branding settings")
		}
		return err
	} else if result.Error != nil {
		fmt.Printf("BRANDING REPO ERROR: Failed to check for existing branding settings: %v\n", result.Error)
		return result.Error
	}

	fmt.Printf("BRANDING REPO: Updating existing branding settings with ID %s\n", setting.ID)

	// Update existing record
	err = db.DB.Model(&setting).Updates(map[string]interface{}{
		"value":      string(brandingJSON),
		"updated_at": time.Now(),
	}).Error

	if err != nil {
		fmt.Printf("BRANDING REPO ERROR: Failed to update branding settings: %v\n", err)
	} else {
		fmt.Println("BRANDING REPO SUCCESS: Updated branding settings")
	}

	return err
}
