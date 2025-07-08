// internal/models/branding_settings.go
package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"time"
)

// BrandingSetting model for database
type BrandingSetting struct {
	ID          string `gorm:"primaryKey;type:varchar(100)"`
	Key         string `gorm:"uniqueIndex;type:varchar(255)"`
	Value       string `gorm:"type:json"` // Using JSON type for complex branding data
	Description string `gorm:"type:text"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// BrandingConfig stores all branding-related settings
type BrandingConfig struct {
	// Basic App Info
	AppName        string `json:"appName"`
	AppDescription string `json:"appDescription"`
	AppTagline     string `json:"appTagline"`

	// Logo & Icons
	LogoURL     string `json:"logoUrl"`
	LogoAltText string `json:"logoAltText"`
	FaviconURL  string `json:"faviconUrl"`
	IconURL     string `json:"iconUrl"`

	// SEO Settings
	SEO SEOConfig `json:"seo"`

	// Social Media
	SocialMedia SocialMediaConfig `json:"socialMedia"`

	// Contact Info
	Contact ContactConfig `json:"contact"`

	// Footer
	Footer FooterConfig `json:"footer"`
}

// SEOConfig for search engine optimization
type SEOConfig struct {
	MetaTitle       string   `json:"metaTitle"`
	MetaDescription string   `json:"metaDescription"`
	MetaKeywords    []string `json:"metaKeywords"`
	OGTitle         string   `json:"ogTitle"`
	OGDescription   string   `json:"ogDescription"`
	OGImage         string   `json:"ogImage"`
	TwitterCard     string   `json:"twitterCard"`
	TwitterSite     string   `json:"twitterSite"`
	CanonicalURL    string   `json:"canonicalUrl"`
}

// SocialMediaConfig for social media links
type SocialMediaConfig struct {
	Facebook  string `json:"facebook"`
	Twitter   string `json:"twitter"`
	LinkedIn  string `json:"linkedin"`
	Instagram string `json:"instagram"`
	YouTube   string `json:"youtube"`
	GitHub    string `json:"github"`
}

// ContactConfig for contact information
type ContactConfig struct {
	Email            string `json:"email"`
	Phone            string `json:"phone"`
	Address          string `json:"address"`
	SupportURL       string `json:"supportUrl"`
	DocumentationURL string `json:"documentationUrl"`
}

// FooterConfig for footer content
type FooterConfig struct {
	CompanyName  string       `json:"companyName"`
	Copyright    string       `json:"copyright"`
	Links        []FooterLink `json:"links"`
	LegalLinks   []FooterLink `json:"legalLinks"`
	ShowBranding bool         `json:"showBranding"`
	CustomText   string       `json:"customText"`
}

// FooterLink represents a link in the footer
type FooterLink struct {
	Title string `json:"title"`
	URL   string `json:"url"`
	Icon  string `json:"icon,omitempty"`
}

// Implement the driver.Valuer interface for BrandingConfig
func (bc BrandingConfig) Value() (driver.Value, error) {
	return json.Marshal(bc)
}

// Implement the sql.Scanner interface for BrandingConfig
func (bc *BrandingConfig) Scan(value interface{}) error {
	var bytes []byte

	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("type assertion to []byte or string failed")
	}

	return json.Unmarshal(bytes, &bc)
}

// DefaultBrandingConfig returns default branding configuration
func DefaultBrandingConfig() *BrandingConfig {
	return &BrandingConfig{
		AppName:        "MegaPDF",
		AppDescription: "Professional PDF tools and document processing platform",
		AppTagline:     "Transform your PDFs with ease",
		LogoURL:        "/assets/images/default-logo.svg", // We'll create this
		LogoAltText:    "MegaPDF Logo",
		FaviconURL:     "/assets/images/favicon.ico",
		IconURL:        "/assets/images/app-icon.png",
		SEO: SEOConfig{
			MetaTitle:       "MegaPDF - Professional PDF Tools",
			MetaDescription: "Professional PDF tools for converting, merging, splitting, and editing PDF documents. Free online PDF tools with premium features.",
			MetaKeywords:    []string{"PDF", "tools", "convert", "merge", "split", "compress", "online"},
			OGImage:         "/assets/images/og-image.png",
			TwitterSite:     "@megapdf",
		},
		SocialMedia: SocialMediaConfig{
			Twitter:  "",
			Facebook: "",
			GitHub:   "",
			LinkedIn: "",
		},
		Contact: ContactConfig{
			Email:            "hello@megapdf.com",
			Phone:            "",
			SupportURL:       "/support",
			DocumentationURL: "/docs",
		},
		Footer: FooterConfig{
			CompanyName:  "MegaPDF",
			Copyright:    "© 2024 MegaPDF. All rights reserved.",
			CustomText:   "",
			ShowBranding: true,
			Links:        []FooterLink{},
			LegalLinks: []FooterLink{
				{Title: "Privacy Policy", URL: "/privacy"},
				{Title: "Terms of Service", URL: "/terms"},
			},
		},
	}
}

// CreateDefaultBrandingAssets creates default branding assets (SVG logo, etc.)
func CreateDefaultBrandingAssets() error {
	// Create default SVG logo
	defaultLogoSVG := `<svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="100" fill="url(#grad)" rx="10"/>
  <text x="100" y="45" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">MegaPDF</text>
  <text x="100" y="65" font-family="Arial, sans-serif" font-size="12" fill="white" text-anchor="middle" opacity="0.9">PDF Tools</text>
</svg>`

	// Create public/assets/images directory
	assetsDir := "public/assets/images"
	if err := os.MkdirAll(assetsDir, 0755); err != nil {
		return err
	}

	// Write default logo
	logoPath := filepath.Join(assetsDir, "default-logo.svg")
	if err := ioutil.WriteFile(logoPath, []byte(defaultLogoSVG), 0644); err != nil {
		return err
	}

	// Create a simple favicon (16x16 blue square)
	faviconSVG := `<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
  <rect width="16" height="16" fill="#3B82F6" rx="2"/>
  <text x="8" y="12" font-family="Arial" font-size="10" font-weight="bold" fill="white" text-anchor="middle">M</text>
</svg>`

	faviconPath := filepath.Join(assetsDir, "favicon.svg")
	if err := ioutil.WriteFile(faviconPath, []byte(faviconSVG), 0644); err != nil {
		return err
	}

	// Create app icon (512x512)
	appIconSVG := `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="appGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#appGrad)" rx="100"/>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="white" text-anchor="middle">M</text>
  <text x="256" y="350" font-family="Arial, sans-serif" font-size="40" fill="white" text-anchor="middle" opacity="0.9">PDF</text>
</svg>`

	appIconPath := filepath.Join(assetsDir, "app-icon.svg")
	if err := ioutil.WriteFile(appIconPath, []byte(appIconSVG), 0644); err != nil {
		return err
	}

	fmt.Println("Default branding assets created successfully")
	return nil
}

// Initialize default branding assets on startup
func init() {
	// Create default assets if they don't exist
	go func() {
		if err := CreateDefaultBrandingAssets(); err != nil {
			fmt.Printf("Warning: Failed to create default branding assets: %v\n", err)
		}
	}()
}
