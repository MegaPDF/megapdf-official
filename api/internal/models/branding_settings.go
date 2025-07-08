// internal/models/branding_settings.go
package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
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
	LogoURL       string `json:"logoUrl"`
	LogoAltText   string `json:"logoAltText"`
	FaviconURL    string `json:"faviconUrl"`
	IconURL       string `json:"iconUrl"`
	
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
	Email       string `json:"email"`
	Phone       string `json:"phone"`
	Address     string `json:"address"`
	SupportURL  string `json:"supportUrl"`
	DocumentationURL string `json:"documentationUrl"`
}

// FooterConfig for footer content
type FooterConfig struct {
	CompanyName  string            `json:"companyName"`
	Copyright    string            `json:"copyright"`
	Links        []FooterLink      `json:"links"`
	LegalLinks   []FooterLink      `json:"legalLinks"`
	ShowBranding bool              `json:"showBranding"`
	CustomText   string            `json:"customText"`
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
		
		LogoURL:     "/images/logo.png",
		LogoAltText: "MegaPDF Logo",
		FaviconURL:  "/favicon.ico",
		IconURL:     "/images/icon.png",
		
		SEO: SEOConfig{
			MetaTitle:       "MegaPDF - Professional PDF Tools",
			MetaDescription: "Professional PDF tools for converting, merging, splitting, and editing PDF documents. Free online PDF tools with premium features.",
			MetaKeywords:    []string{"PDF", "tools", "convert", "merge", "split", "compress", "online"},
			OGTitle:         "MegaPDF - Professional PDF Tools",
			OGDescription:   "Transform your PDFs with our professional online tools",
			OGImage:         "/images/og-image.png",
			TwitterCard:     "summary_large_image",
			TwitterSite:     "@megapdf",
		},
		

		Contact: ContactConfig{
			Email:             "hello@megapdf.com",
			SupportURL:        "/support",
			DocumentationURL:  "/docs",
		},
	
		Footer: FooterConfig{
			CompanyName:  "MegaPDF",
			Copyright:    "© 2024 MegaPDF. All rights reserved.",
			ShowBranding: true,
			Links: []FooterLink{
				{Title: "About", URL: "/about"},
				{Title: "Features", URL: "/features"},
				{Title: "Pricing", URL: "/pricing"},
				{Title: "API", URL: "/api-docs"},
			},
			LegalLinks: []FooterLink{
				{Title: "Privacy Policy", URL: "/privacy"},
				{Title: "Terms of Service", URL: "/terms"},
				{Title: "Cookie Policy", URL: "/cookies"},
			},
		},
	}
}