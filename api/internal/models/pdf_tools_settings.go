// internal/models/pdf_tools_settings.go
package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// PDFToolSettings stores PDF tool configuration
type PDFToolSettings struct {
	ID          string `gorm:"primaryKey;type:text"`
	Settings    string `gorm:"type:text"` // JSON configuration
	Description string `gorm:"type:text"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// ToolStatus represents the status of a single PDF tool
type ToolStatus struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Description   string  `json:"description"`
	Enabled       bool    `json:"enabled"`
	Category      string  `json:"category"`
	OperationCost float64 `json:"operationCost"`
}

// PDFToolsConfig represents the configuration for all PDF tools
type PDFToolsConfig struct {
	Tools []ToolStatus `json:"tools"`
}

// Value implements the driver.Valuer interface for PDFToolsConfig
func (ptc PDFToolsConfig) Value() (driver.Value, error) {
	return json.Marshal(ptc)
}

// Scan implements the sql.Scanner interface for PDFToolsConfig
func (ptc *PDFToolsConfig) Scan(value interface{}) error {
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, &ptc)
}

// GetDefaultTools returns a list of default PDF tools and their status
func GetDefaultTools() []ToolStatus {
	return []ToolStatus{
		{
			ID:            "convert",
			Name:          "Convert PDF",
			Description:   "Convert to and from PDF format",
			Enabled:       true,
			Category:      "Conversion",
			OperationCost: 0.005,
		},
		{
			ID:            "compress",
			Name:          "Compress PDF",
			Description:   "Reduce file size of PDF documents",
			Enabled:       true,
			Category:      "Optimization",
			OperationCost: 0.003,
		},
		{
			ID:            "merge",
			Name:          "Merge PDFs",
			Description:   "Combine multiple PDFs into one document",
			Enabled:       true,
			Category:      "Organization",
			OperationCost: 0.005,
		},
		{
			ID:            "split",
			Name:          "Split PDF",
			Description:   "Split a PDF into multiple documents",
			Enabled:       true,
			Category:      "Organization",
			OperationCost: 0.005,
		},
		{
			ID:            "protect",
			Name:          "Protect PDF",
			Description:   "Add password protection to PDF files",
			Enabled:       true,
			Category:      "Security",
			OperationCost: 0.004,
		},
		{
			ID:            "unlock",
			Name:          "Unlock PDF",
			Description:   "Remove password protection from PDF files",
			Enabled:       true,
			Category:      "Security",
			OperationCost: 0.005,
		},
		{
			ID:            "watermark",
			Name:          "Add Watermark",
			Description:   "Add text or image watermarks to PDFs",
			Enabled:       true,
			Category:      "Editing",
			OperationCost: 0.005,
		},
		{
			ID:            "sign",
			Name:          "Sign PDF",
			Description:   "Add signature to PDF documents",
			Enabled:       true,
			Category:      "Security",
			OperationCost: 0.005,
		},
		{
			ID:            "rotate",
			Name:          "Rotate PDF",
			Description:   "Rotate pages in PDF documents",
			Enabled:       true,
			Category:      "Editing",
			OperationCost: 0.005,
		},
		{
			ID:            "ocr",
			Name:          "OCR",
			Description:   "Optical Character Recognition for scanned PDFs",
			Enabled:       true,
			Category:      "Conversion",
			OperationCost: 0.010,
		},
		{
			ID:            "repair",
			Name:          "Repair PDF",
			Description:   "Fix corrupted PDF files",
			Enabled:       true,
			Category:      "Optimization",
			OperationCost: 0.005,
		},
		{
			ID:            "edit",
			Name:          "Edit PDF",
			Description:   "Edit text and images in PDF documents",
			Enabled:       true,
			Category:      "Editing",
			OperationCost: 0.005,
		},
		{
			ID:            "remove",
			Name:          "Remove Pages",
			Description:   "Remove specific pages from PDF documents",
			Enabled:       true,
			Category:      "Editing",
			OperationCost: 0.005,
		},
		{
			ID:            "pagenumber",
			Name:          "Add Page Numbers",
			Description:   "Add page numbers to PDF documents",
			Enabled:       true,
			Category:      "Editing",
			OperationCost: 0.005,
		},
	}
}
