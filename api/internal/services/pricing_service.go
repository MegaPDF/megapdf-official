// internal/services/pricing_service.go
package services

import (
	"fmt"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/MegaPDF/megapdf-official/api/internal/repository"
)

// PricingService handles all pricing-related operations
type PricingService struct {
	pricingRepo *repository.PricingRepository
}

// NewPricingService creates a new pricing service
func NewPricingService() *PricingService {
	return &PricingService{
		pricingRepo: repository.NewPricingRepository(),
	}
}

// GetOperationCost returns the cost for a specific operation
func (s *PricingService) GetOperationCost(operation string) float64 {
	fmt.Printf("PRICING: Getting operation cost for '%s'\n", operation)

	// Get pricing from database
	pricing, err := s.pricingRepo.GetPricingSettings()
	if err != nil {
		fmt.Printf("PRICING ERROR: Failed to get pricing settings: %v, using default %.6f\n",
			err, constants.DEFAULT_OPERATION_COST)
		return constants.DEFAULT_OPERATION_COST
	}

	// Debug all pricing settings
	fmt.Printf("PRICING: Global price: %.6f, Custom prices: %+v\n",
		pricing.OperationCost, pricing.CustomPrices)

	// Check for custom price first
	if customPrice, ok := pricing.CustomPrices[operation]; ok {
		fmt.Printf("PRICING: Found custom price for '%s': %.6f\n", operation, customPrice)

		// Safety check - prevent unreasonable custom prices
		if customPrice > 1.0 || customPrice < 0.0001 {
			fmt.Printf("PRICING WARNING: Custom price for '%s' is outside reasonable range (%.6f), using global price\n",
				operation, customPrice)
			return pricing.OperationCost
		}

		return customPrice
	}

	// Use global price
	fmt.Printf("PRICING: Using global price for '%s': %.6f\n", operation, pricing.OperationCost)
	return pricing.OperationCost
}

// GetFreeOperationsLimit returns the monthly free operations limit
func (s *PricingService) GetFreeOperationsLimit() int {
	pricing, err := s.pricingRepo.GetPricingSettings()
	if err != nil {
		fmt.Printf("PRICING ERROR: Failed to get free operations limit: %v, using default %d\n",
			err, constants.DEFAULT_FREE_OPERATIONS_MONTHLY)
		return constants.DEFAULT_FREE_OPERATIONS_MONTHLY
	}

	fmt.Printf("PRICING: Free operations limit: %d\n", pricing.FreeOperationsMonthly)
	return pricing.FreeOperationsMonthly
}

// GetPricingSettings returns complete pricing configuration
func (s *PricingService) GetPricingSettings() (*models.CustomPricing, error) {
	return s.pricingRepo.GetPricingSettings()
}

// UpdatePricingSettings saves new pricing configuration
func (s *PricingService) UpdatePricingSettings(pricing *models.CustomPricing) error {
	fmt.Printf("PRICING: Updating pricing settings - global: %.6f, free: %d, custom: %+v\n",
		pricing.OperationCost, pricing.FreeOperationsMonthly, pricing.CustomPrices)

	return s.pricingRepo.SavePricingSettings(pricing)
}

// GetPricingInfo returns pricing info for external consumption (API responses)
func (s *PricingService) GetPricingInfo() map[string]interface{} {
	pricing, err := s.pricingRepo.GetPricingSettings()
	if err != nil {
		// Return default values if database fails
		return map[string]interface{}{
			"operationCost":         constants.DEFAULT_OPERATION_COST,
			"freeOperationsMonthly": constants.DEFAULT_FREE_OPERATIONS_MONTHLY,
			"customPrices":          make(map[string]float64),
			"lastUpdated":           time.Now().UTC(),
			"source":                "default",
		}
	}

	return map[string]interface{}{
		"operationCost":         pricing.OperationCost,
		"freeOperationsMonthly": pricing.FreeOperationsMonthly,
		"customPrices":          pricing.CustomPrices,
		"lastUpdated":           time.Now().UTC(),
		"source":                "database",
	}
}

// Validatepricing performs validation on pricing settings
func (s *PricingService) ValidatePricing(pricing *models.CustomPricing) error {
	// Validate global operation cost
	if pricing.OperationCost < 0.0001 || pricing.OperationCost > 1.0 {
		return fmt.Errorf("operation cost must be between $0.0001 and $1.0, got $%.6f", pricing.OperationCost)
	}

	// Validate free operations
	if pricing.FreeOperationsMonthly < 0 || pricing.FreeOperationsMonthly > 10000 {
		return fmt.Errorf("free operations monthly must be between 0 and 10000, got %d", pricing.FreeOperationsMonthly)
	}

	// Validate custom prices
	for operation, price := range pricing.CustomPrices {
		if price < 0.0001 || price > 1.0 {
			return fmt.Errorf("custom price for operation '%s' must be between $0.0001 and $1.0, got $%.6f", operation, price)
		}
	}

	return nil
}
