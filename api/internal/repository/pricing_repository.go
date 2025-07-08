// internal/repository/pricing_repository.go
package repository

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/db"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PricingRepository handles database operations for pricing settings
type PricingRepository struct{}

// NewPricingRepository creates a new PricingRepository
func NewPricingRepository() *PricingRepository {
	return &PricingRepository{}
}

// GetPricingSettings retrieves all pricing settings
func (r *PricingRepository) GetPricingSettings() (*models.CustomPricing, error) {
	fmt.Println("PRICING REPO: Fetching pricing settings from database")

	var setting models.PricingSetting
	result := db.DB.Where("`key` = ?", "pricing_settings").First(&setting)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		fmt.Println("PRICING REPO: No pricing settings found in database, returning defaults")

		// Return default settings if not found (no constants dependency)
		return &models.CustomPricing{
			OperationCost:         constants.DEFAULT_OPERATION_COST,
			FreeOperationsMonthly: constants.DEFAULT_FREE_OPERATIONS_MONTHLY,
			CustomPrices:          make(map[string]float64),
		}, nil
	} else if result.Error != nil {
		fmt.Printf("PRICING REPO ERROR: Failed to fetch pricing settings: %v\n", result.Error)
		return nil, result.Error
	}

	// Unmarshal the settings
	fmt.Printf("PRICING REPO: Retrieved settings from database, raw value: %s\n", setting.Value)
	var pricing models.CustomPricing
	if err := json.Unmarshal([]byte(setting.Value), &pricing); err != nil {
		fmt.Printf("PRICING REPO CRITICAL ERROR: Failed to unmarshal pricing settings: %v\n", err)
		fmt.Printf("Raw JSON: %s\n", setting.Value)
		return nil, err
	}

	fmt.Printf("PRICING REPO SUCCESS: Unmarshaled settings: global=%.6f, free=%d, custom prices=%+v\n",
		pricing.OperationCost, pricing.FreeOperationsMonthly, pricing.CustomPrices)

	return &pricing, nil
}

// SavePricingSettings saves pricing settings to the database
func (r *PricingRepository) SavePricingSettings(pricing *models.CustomPricing) error {
	fmt.Printf("PRICING REPO: Saving pricing settings: global=%.6f, free=%d, custom=%+v\n",
		pricing.OperationCost, pricing.FreeOperationsMonthly, pricing.CustomPrices)

	// Marshal the settings to JSON
	pricingJSON, err := json.Marshal(pricing)
	if err != nil {
		fmt.Printf("PRICING REPO ERROR: Failed to marshal pricing settings: %v\n", err)
		return err
	}

	// Check if record exists
	var setting models.PricingSetting
	result := db.DB.Where("`key` = ?", "pricing_settings").First(&setting)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		fmt.Println("PRICING REPO: Creating new pricing settings record")

		// Create new record
		setting = models.PricingSetting{
			ID:          uuid.New().String(),
			Key:         "pricing_settings",
			Value:       string(pricingJSON),
			Description: "Dynamic pricing settings for operations",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		}

		err := db.DB.Create(&setting).Error
		if err != nil {
			fmt.Printf("PRICING REPO ERROR: Failed to create pricing settings: %v\n", err)
		} else {
			fmt.Println("PRICING REPO SUCCESS: Created new pricing settings")
		}
		return err
	} else if result.Error != nil {
		fmt.Printf("PRICING REPO ERROR: Failed to check for existing pricing settings: %v\n", result.Error)
		return result.Error
	}

	fmt.Printf("PRICING REPO: Updating existing pricing settings with ID %s\n", setting.ID)

	// Update existing record
	err = db.DB.Model(&setting).Updates(map[string]interface{}{
		"value":      string(pricingJSON),
		"updated_at": time.Now(),
	}).Error

	if err != nil {
		fmt.Printf("PRICING REPO ERROR: Failed to update pricing settings: %v\n", err)
	} else {
		fmt.Println("PRICING REPO SUCCESS: Updated pricing settings")
	}

	return err
}
