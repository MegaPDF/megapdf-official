// internal/handlers/invoice_handler.go
package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type InvoiceHandler struct {
	balanceService *services.BalanceService
	config         *config.Config
}

func NewInvoiceHandler(balanceService *services.BalanceService, cfg *config.Config) *InvoiceHandler {
	return &InvoiceHandler{
		balanceService: balanceService,
		config:         cfg,
	}
}

// InvoiceData represents the structure for invoice data
type InvoiceData struct {
	// Company Information
	CompanyName    string `json:"companyName"`
	CompanyAddress string `json:"companyAddress"`
	CompanyPhone   string `json:"companyPhone"`
	CompanyEmail   string `json:"companyEmail"`
	CompanyLogo    string `json:"companyLogo,omitempty"` // Base64 encoded logo

	// Invoice Details
	InvoiceNumber string `json:"invoiceNumber"`
	InvoiceDate   string `json:"invoiceDate"`
	DueDate       string `json:"dueDate"`

	// Customer Information
	CustomerName    string `json:"customerName"`
	CustomerAddress string `json:"customerAddress"`
	CustomerPhone   string `json:"customerPhone,omitempty"`
	CustomerEmail   string `json:"customerEmail,omitempty"`

	// Invoice Items
	Items []InvoiceItem `json:"items"`

	// Totals
	Subtotal  float64 `json:"subtotal"`
	TaxRate   float64 `json:"taxRate"`
	TaxAmount float64 `json:"taxAmount"`
	Discount  float64 `json:"discount,omitempty"`
	Total     float64 `json:"total"`

	// Additional Information
	Notes         string `json:"notes,omitempty"`
	Terms         string `json:"terms,omitempty"`
	PaymentMethod string `json:"paymentMethod,omitempty"`

	// Template Configuration
	TemplateType string `json:"templateType"` // "form-fill" or "overlay"
}

type InvoiceItem struct {
	Description string  `json:"description"`
	Quantity    float64 `json:"quantity"`
	UnitPrice   float64 `json:"unitPrice"`
	Amount      float64 `json:"amount"`
}

// GenerateInvoice godoc
// @Summary Generate an invoice from template
// @Description Fills a PDF invoice template with provided data
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param template formData file false "PDF template file (optional, uses default if not provided)"
// @Param data formData string true "JSON string with invoice data"
// @Param templateType formData string false "Template filling method: form-fill or overlay" Enums(form-fill, overlay) default(overlay)
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,invoiceNumber=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/generate-invoice [post]
func (h *InvoiceHandler) GenerateInvoice(c *gin.Context) {
	// Process the operation charge
	userID, _ := c.Get("userId")
	result, err := h.balanceService.ProcessOperation(userID.(string), "generate-invoice")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process operation: " + err.Error(),
		})
		return
	}

	if !result.Success {
		c.JSON(http.StatusPaymentRequired, gin.H{
			"error": result.Error,
			"details": gin.H{
				"balance":                 result.CurrentBalance,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"operationCost":           constants.DEFAULT_OPERATION_COST,
			},
		})
		return
	}

	// Create necessary directories
	invoiceDir := filepath.Join(h.config.PublicDir, "invoices")
	if err := os.MkdirAll(invoiceDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create invoices directory: " + err.Error(),
		})
		return
	}

	// Parse invoice data from form
	dataStr := c.PostForm("data")
	if dataStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invoice data is required",
		})
		return
	}

	var invoiceData InvoiceData
	if err := json.Unmarshal([]byte(dataStr), &invoiceData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid invoice data format: " + err.Error(),
		})
		return
	}

	// Validate required fields
	if err := h.validateInvoiceData(&invoiceData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid invoice data: " + err.Error(),
		})
		return
	}

	// Get template type
	templateType := c.DefaultPostForm("templateType", "overlay")
	invoiceData.TemplateType = templateType

	// Handle template file
	var templatePath string
	templateFile, err := c.FormFile("template")

	if err != nil {
		// Use default template
		templatePath = h.getDefaultTemplatePath()
		if templatePath == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "No template provided and no default template available",
			})
			return
		}
	} else {
		// Validate uploaded template
		if !strings.HasSuffix(strings.ToLower(templateFile.Filename), ".pdf") {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Template must be a PDF file",
			})
			return
		}

		// Save uploaded template
		uniqueID := uuid.New().String()
		templatePath = filepath.Join(h.config.TempDir, uniqueID+"-template.pdf")
		if err := c.SaveUploadedFile(templateFile, templatePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save template: " + err.Error(),
			})
			return
		}
		defer os.Remove(templatePath) // Clean up uploaded template
	}

	// Generate unique ID for output
	uniqueID := uuid.New().String()
	outputPath := filepath.Join(invoiceDir, uniqueID+"-invoice.pdf")

	// Generate invoice based on template type
	var generateErr error
	if templateType == "form-fill" {
		generateErr = h.generateInvoiceWithFormFill(templatePath, outputPath, &invoiceData)
	} else {
		generateErr = h.generateInvoiceWithOverlay(templatePath, outputPath, &invoiceData)
	}

	if generateErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate invoice: " + generateErr.Error(),
		})
		return
	}

	// Verify output file was created
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Invoice file was not created successfully",
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=invoices&filename=%s-invoice.pdf", uniqueID)

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"message":       "Invoice generated successfully",
		"fileUrl":       fileURL,
		"filename":      fmt.Sprintf("%s-invoice.pdf", uniqueID),
		"invoiceNumber": invoiceData.InvoiceNumber,
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           constants.DEFAULT_OPERATION_COST,
		},
	})
}

// validateInvoiceData validates the required invoice data
func (h *InvoiceHandler) validateInvoiceData(data *InvoiceData) error {
	if data.CompanyName == "" {
		return fmt.Errorf("company name is required")
	}
	if data.InvoiceNumber == "" {
		return fmt.Errorf("invoice number is required")
	}
	if data.CustomerName == "" {
		return fmt.Errorf("customer name is required")
	}
	if len(data.Items) == 0 {
		return fmt.Errorf("at least one invoice item is required")
	}

	// Validate items
	for i, item := range data.Items {
		if item.Description == "" {
			return fmt.Errorf("item %d: description is required", i+1)
		}
		if item.Quantity <= 0 {
			return fmt.Errorf("item %d: quantity must be greater than 0", i+1)
		}
		if item.UnitPrice < 0 {
			return fmt.Errorf("item %d: unit price cannot be negative", i+1)
		}
	}

	// Calculate and validate totals
	h.calculateTotals(data)

	return nil
}

// calculateTotals calculates invoice totals
func (h *InvoiceHandler) calculateTotals(data *InvoiceData) {
	subtotal := 0.0

	// Calculate item amounts and subtotal
	for i := range data.Items {
		data.Items[i].Amount = data.Items[i].Quantity * data.Items[i].UnitPrice
		subtotal += data.Items[i].Amount
	}

	data.Subtotal = subtotal
	data.TaxAmount = (data.Subtotal - data.Discount) * data.TaxRate / 100
	data.Total = data.Subtotal - data.Discount + data.TaxAmount
}

// getDefaultTemplatePath returns the path to the default invoice template
func (h *InvoiceHandler) getDefaultTemplatePath() string {
	// Look for default template in templates directory
	templatesDir := filepath.Join(h.config.PublicDir, "templates")
	defaultTemplate := filepath.Join(templatesDir, "invoice-template.pdf")

	if _, err := os.Stat(defaultTemplate); err == nil {
		return defaultTemplate
	}

	// Alternative location
	altTemplate := filepath.Join("templates", "invoice-template.pdf")
	if _, err := os.Stat(altTemplate); err == nil {
		return altTemplate
	}

	return "" // No default template found
}

// generateInvoiceWithFormFill fills PDF form fields (if template has form fields)
func (h *InvoiceHandler) generateInvoiceWithFormFill(templatePath, outputPath string, data *InvoiceData) error {
	// Create a temporary FDF (Forms Data Format) file
	fdfPath := templatePath + ".fdf"
	defer os.Remove(fdfPath)

	// Generate FDF content
	fdfContent := h.generateFDFContent(data)
	if err := os.WriteFile(fdfPath, []byte(fdfContent), 0644); err != nil {
		return fmt.Errorf("failed to create FDF file: %w", err)
	}

	// Use pdftk to fill the form (if available)
	if h.commandExists("pdftk") {
		cmd := exec.Command("pdftk", templatePath, "fill_form", fdfPath, "output", outputPath, "flatten")
		output, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("pdftk form fill failed: %v - %s", err, string(output))
		}
		return nil
	}

	// Fallback to pdfcpu form fill (if supported)
	// Note: pdfcpu has limited form filling support
	return fmt.Errorf("form filling requires pdftk to be installed")
}

// generateInvoiceWithOverlay overlays text on specific positions
func (h *InvoiceHandler) generateInvoiceWithOverlay(templatePath, outputPath string, data *InvoiceData) error {
	// Copy template to output first
	if err := h.copyFile(templatePath, outputPath); err != nil {
		return fmt.Errorf("failed to copy template: %w", err)
	}

	// Define text overlays based on common invoice template positions
	overlays := h.generateTextOverlays(data)

	// Apply each overlay using pdfcpu stamp
	for _, overlay := range overlays {
		tempOutput := outputPath + ".temp"

		// Build pdfcpu stamp command
		args := []string{
			"stamp", "add",
			"-mode", "text",
			"--", overlay.Text, overlay.Description, outputPath, tempOutput,
		}

		cmd := exec.Command("pdfcpu", args...)
		output, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("failed to apply text overlay '%s': %v - %s", overlay.Text, err, string(output))
		}

		// Replace original with stamped version
		if err := os.Rename(tempOutput, outputPath); err != nil {
			return fmt.Errorf("failed to update output file: %w", err)
		}
	}

	return nil
}

// TextOverlay represents a text overlay configuration
type TextOverlay struct {
	Text        string
	Description string
}

// generateTextOverlays creates text overlays for invoice data
func (h *InvoiceHandler) generateTextOverlays(data *InvoiceData) []TextOverlay {
	var overlays []TextOverlay

	// Company information (top-left)
	overlays = append(overlays, TextOverlay{
		Text:        data.CompanyName,
		Description: "fontname:Helvetica-Bold, points:14, pos:tl, offset:50 -50, fillcolor:#000000",
	})

	// Invoice number (top-right)
	overlays = append(overlays, TextOverlay{
		Text:        "Invoice #" + data.InvoiceNumber,
		Description: "fontname:Helvetica-Bold, points:12, pos:tr, offset:-50 -50, fillcolor:#000000",
	})

	// Invoice date (top-right, below invoice number)
	if data.InvoiceDate != "" {
		overlays = append(overlays, TextOverlay{
			Text:        "Date: " + data.InvoiceDate,
			Description: "fontname:Helvetica, points:10, pos:tr, offset:-50 -70, fillcolor:#000000",
		})
	}

	// Due date (top-right, below date)
	if data.DueDate != "" {
		overlays = append(overlays, TextOverlay{
			Text:        "Due: " + data.DueDate,
			Description: "fontname:Helvetica, points:10, pos:tr, offset:-50 -85, fillcolor:#000000",
		})
	}

	// Customer information (left side, below company info)
	overlays = append(overlays, TextOverlay{
		Text:        "Bill To:",
		Description: "fontname:Helvetica-Bold, points:11, pos:tl, offset:50 -120, fillcolor:#000000",
	})

	overlays = append(overlays, TextOverlay{
		Text:        data.CustomerName,
		Description: "fontname:Helvetica, points:10, pos:tl, offset:50 -135, fillcolor:#000000",
	})

	if data.CustomerAddress != "" {
		overlays = append(overlays, TextOverlay{
			Text:        data.CustomerAddress,
			Description: "fontname:Helvetica, points:9, pos:tl, offset:50 -150, fillcolor:#666666",
		})
	}

	// Invoice items (you might need to adjust positions based on your template)
	yOffset := -200
	for i, item := range data.Items {
		if i >= 10 { // Limit to prevent overlapping
			break
		}

		itemText := fmt.Sprintf("%s - Qty: %.0f @ $%.2f = $%.2f",
			item.Description, item.Quantity, item.UnitPrice, item.Amount)

		overlays = append(overlays, TextOverlay{
			Text:        itemText,
			Description: fmt.Sprintf("fontname:Helvetica, points:9, pos:tl, offset:50 %d, fillcolor:#000000", yOffset),
		})

		yOffset -= 15
	}

	// Totals (bottom-right)
	overlays = append(overlays, TextOverlay{
		Text:        fmt.Sprintf("Subtotal: $%.2f", data.Subtotal),
		Description: "fontname:Helvetica, points:10, pos:br, offset:-50 120, fillcolor:#000000",
	})

	if data.Discount > 0 {
		overlays = append(overlays, TextOverlay{
			Text:        fmt.Sprintf("Discount: -$%.2f", data.Discount),
			Description: "fontname:Helvetica, points:10, pos:br, offset:-50 105, fillcolor:#000000",
		})
	}

	if data.TaxAmount > 0 {
		overlays = append(overlays, TextOverlay{
			Text:        fmt.Sprintf("Tax (%.1f%%): $%.2f", data.TaxRate, data.TaxAmount),
			Description: "fontname:Helvetica, points:10, pos:br, offset:-50 90, fillcolor:#000000",
		})
	}

	overlays = append(overlays, TextOverlay{
		Text:        fmt.Sprintf("Total: $%.2f", data.Total),
		Description: "fontname:Helvetica-Bold, points:12, pos:br, offset:-50 70, fillcolor:#000000",
	})

	// Notes (bottom-left)
	if data.Notes != "" {
		overlays = append(overlays, TextOverlay{
			Text:        "Notes: " + data.Notes,
			Description: "fontname:Helvetica, points:9, pos:bl, offset:50 100, fillcolor:#666666",
		})
	}

	return overlays
}

// generateFDFContent generates FDF content for form filling
func (h *InvoiceHandler) generateFDFContent(data *InvoiceData) string {
	fdf := "%FDF-1.2\n"
	fdf += "1 0 obj\n"
	fdf += "<<\n"
	fdf += "/FDF\n"
	fdf += "<<\n"
	fdf += "/Fields [\n"

	// Add form field mappings (adjust field names based on your template)
	fields := map[string]string{
		"companyName":     data.CompanyName,
		"companyAddress":  data.CompanyAddress,
		"invoiceNumber":   data.InvoiceNumber,
		"invoiceDate":     data.InvoiceDate,
		"dueDate":         data.DueDate,
		"customerName":    data.CustomerName,
		"customerAddress": data.CustomerAddress,
		"subtotal":        fmt.Sprintf("%.2f", data.Subtotal),
		"taxAmount":       fmt.Sprintf("%.2f", data.TaxAmount),
		"total":           fmt.Sprintf("%.2f", data.Total),
		"notes":           data.Notes,
	}

	for fieldName, value := range fields {
		if value != "" {
			fdf += fmt.Sprintf("<< /T (%s) /V (%s) >>\n", fieldName, value)
		}
	}

	// Add item fields (assuming template has item1_desc, item1_qty, etc.)
	for i, item := range data.Items {
		if i >= 10 { // Limit items
			break
		}

		fdf += fmt.Sprintf("<< /T (item%d_desc) /V (%s) >>\n", i+1, item.Description)
		fdf += fmt.Sprintf("<< /T (item%d_qty) /V (%.0f) >>\n", i+1, item.Quantity)
		fdf += fmt.Sprintf("<< /T (item%d_price) /V (%.2f) >>\n", i+1, item.UnitPrice)
		fdf += fmt.Sprintf("<< /T (item%d_amount) /V (%.2f) >>\n", i+1, item.Amount)
	}

	fdf += "]\n"
	fdf += ">>\n"
	fdf += ">>\n"
	fdf += "endobj\n"
	fdf += "trailer\n"
	fdf += "\n"
	fdf += "<<\n"
	fdf += "/Root 1 0 R\n"
	fdf += ">>\n"
	fdf += "%%EOF\n"

	return fdf
}

// Helper functions

// commandExists checks if a command exists in PATH
func (h *InvoiceHandler) commandExists(cmd string) bool {
	_, err := exec.LookPath(cmd)
	return err == nil
}

// copyFile copies a file from src to dst
func (h *InvoiceHandler) copyFile(src, dst string) error {
	input, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	return os.WriteFile(dst, input, 0644)
}

// GetInvoiceTemplates returns available invoice templates
// @Summary Get available invoice templates
// @Description Returns a list of available invoice templates
// @Tags pdf
// @Accept json
// @Produce json
// @Success 200 {object} object{success=boolean,templates=array}
// @Router /api/pdf/invoice-templates [get]
func (h *InvoiceHandler) GetInvoiceTemplates(c *gin.Context) {
	templatesDir := filepath.Join(h.config.PublicDir, "templates")

	var templates []map[string]interface{}

	// Check for default templates
	if _, err := os.Stat(filepath.Join(templatesDir, "invoice-template.pdf")); err == nil {
		templates = append(templates, map[string]interface{}{
			"id":          "default",
			"name":        "Default Invoice Template",
			"description": "Standard invoice template with company and customer details",
			"url":         "/api/file?folder=templates&filename=invoice-template.pdf",
		})
	}

	// You can add more templates here
	templates = append(templates, map[string]interface{}{
		"id":          "modern",
		"name":        "Modern Invoice Template",
		"description": "Clean modern design with company branding",
		"url":         "/api/file?folder=templates&filename=modern-invoice-template.pdf",
	})

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"templates": templates,
	})
}
