// internal/services/branding_service.go - Updated with optional validation
package services

import (
	"fmt"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/MegaPDF/megapdf-official/api/internal/repository"
)

// BrandingService handles all branding-related operations
type BrandingService struct {
	brandingRepo *repository.BrandingRepository
}

// NewBrandingService creates a new branding service
func NewBrandingService() *BrandingService {
	return &BrandingService{
		brandingRepo: repository.NewBrandingRepository(),
	}
}

// GetBrandingSettings returns complete branding configuration
func (s *BrandingService) GetBrandingSettings() (*models.BrandingConfig, error) {
	return s.brandingRepo.GetBrandingSettings()
}

// UpdateBrandingSettings saves new branding configuration
func (s *BrandingService) UpdateBrandingSettings(branding *models.BrandingConfig) error {
	fmt.Printf("BRANDING SERVICE: Updating branding settings - app: %s, description: %s\n",
		branding.AppName, branding.AppDescription)

	// Validate branding settings (now with optional validation)
	if err := s.ValidateBranding(branding); err != nil {
		return err
	}

	return s.brandingRepo.SaveBrandingSettings(branding)
}

// GetPublicBrandingInfo returns branding info for external consumption (API responses)
func (s *BrandingService) GetPublicBrandingInfo() map[string]interface{} {
	branding, err := s.brandingRepo.GetBrandingSettings()
	if err != nil {
		// Return default values if database fails
		defaultBranding := models.DefaultBrandingConfig()
		return map[string]interface{}{
			"appName":        defaultBranding.AppName,
			"appDescription": defaultBranding.AppDescription,
			"appTagline":     defaultBranding.AppTagline,
			"logoUrl":        defaultBranding.LogoURL,
			"logoAltText":    defaultBranding.LogoAltText,
			"faviconUrl":     defaultBranding.FaviconURL,
			"iconUrl":        defaultBranding.IconURL,
			"seo":            defaultBranding.SEO,
			"socialMedia":    defaultBranding.SocialMedia,
			"contact":        defaultBranding.Contact,
			"footer":         defaultBranding.Footer,
			"lastUpdated":    time.Now().UTC(),
			"source":         "default",
		}
	}

	return map[string]interface{}{
		"appName":        branding.AppName,
		"appDescription": branding.AppDescription,
		"appTagline":     branding.AppTagline,
		"logoUrl":        branding.LogoURL,
		"logoAltText":    branding.LogoAltText,
		"faviconUrl":     branding.FaviconURL,
		"iconUrl":        branding.IconURL,
		"seo":            branding.SEO,
		"socialMedia":    branding.SocialMedia,
		"contact":        branding.Contact,
		"footer":         branding.Footer,
		"lastUpdated":    time.Now().UTC(),
		"source":         "database",
	}
}

// GetSEOData returns SEO-specific data for meta tags
func (s *BrandingService) GetSEOData() (*models.SEOConfig, error) {
	branding, err := s.GetBrandingSettings()
	if err != nil {
		// Return default SEO if database fails
		defaultBranding := models.DefaultBrandingConfig()
		return &defaultBranding.SEO, nil
	}

	return &branding.SEO, nil
}

// GetAppInfo returns basic app information
func (s *BrandingService) GetAppInfo() map[string]string {
	branding, err := s.GetBrandingSettings()
	if err != nil {
		defaultBranding := models.DefaultBrandingConfig()
		return map[string]string{
			"name":        defaultBranding.AppName,
			"description": defaultBranding.AppDescription,
			"tagline":     defaultBranding.AppTagline,
			"logo":        defaultBranding.LogoURL,
			"favicon":     defaultBranding.FaviconURL,
		}
	}

	return map[string]string{
		"name":        branding.AppName,
		"description": branding.AppDescription,
		"tagline":     branding.AppTagline,
		"logo":        branding.LogoURL,
		"favicon":     branding.FaviconURL,
	}
}

// ValidateBranding performs validation on branding settings - NOW ALL OPTIONAL
func (s *BrandingService) ValidateBranding(branding *models.BrandingConfig) error {
	// Only validate length limits, not required fields

	// Validate app name length (if provided)
	if branding.AppName != "" && len(branding.AppName) > 100 {
		return fmt.Errorf("app name must be 100 characters or less")
	}

	// Validate app description length (if provided)
	if branding.AppDescription != "" && len(branding.AppDescription) > 500 {
		return fmt.Errorf("app description must be 500 characters or less")
	}

	// Validate SEO meta title length (if provided)
	if branding.SEO.MetaTitle != "" && len(branding.SEO.MetaTitle) > 60 {
		return fmt.Errorf("SEO meta title should be 60 characters or less for optimal display")
	}

	// Validate SEO meta description length (if provided)
	if branding.SEO.MetaDescription != "" && len(branding.SEO.MetaDescription) > 160 {
		return fmt.Errorf("SEO meta description should be 160 characters or less for optimal display")
	}

	// No logo alt text requirement - completely optional now
	// No footer company name requirement - completely optional now
	// No app name requirement - completely optional now
	// No app description requirement - completely optional now

	return nil
}

// ResetToDefaults resets branding to default values
func (s *BrandingService) ResetToDefaults() error {
	defaultBranding := models.DefaultBrandingConfig()
	return s.UpdateBrandingSettings(defaultBranding)
}
