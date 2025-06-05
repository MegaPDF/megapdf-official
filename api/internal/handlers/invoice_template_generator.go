// internal/handlers/invoice_template_generator.go
package handlers

import (
	"fmt"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// CreateInvoiceTemplate creates a basic invoice template PDF
// @Summary Create a basic invoice template
// @Description Creates a basic invoice template PDF that can be used for invoice generation
// @Tags pdf
// @Accept json
// @Produce json
// @Param templateStyle query string false "Template style" Enums(basic, modern, professional) default(basic)
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/create-invoice-template [post]
func (h *InvoiceHandler) CreateInvoiceTemplate(c *gin.Context) {
	templateStyle := c.DefaultQuery("templateStyle", "basic")

	// Create templates directory if it doesn't exist
	templatesDir := filepath.Join(h.config.PublicDir, "templates")
	if err := os.MkdirAll(templatesDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create templates directory: " + err.Error(),
		})
		return
	}

	// Generate unique filename
	uniqueID := uuid.New().String()
	templatePath := filepath.Join(templatesDir, uniqueID+"-invoice-template.pdf")

	// Create the template based on style
	var err error
	switch templateStyle {
	case "modern":
		err = h.createModernInvoiceTemplate(templatePath)
	case "professional":
		err = h.createProfessionalInvoiceTemplate(templatePath)
	default:
		err = h.createBasicInvoiceTemplate(templatePath)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create invoice template: " + err.Error(),
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=templates&filename=%s-invoice-template.pdf", uniqueID)

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"message":  "Invoice template created successfully",
		"fileUrl":  fileURL,
		"filename": fmt.Sprintf("%s-invoice-template.pdf", uniqueID),
		"style":    templateStyle,
	})
}

// createBasicInvoiceTemplate creates a basic invoice template using HTML to PDF conversion
func (h *InvoiceHandler) createBasicInvoiceTemplate(outputPath string) error {
	// Create HTML content for the invoice template
	htmlContent := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice Template</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            color: #333;
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 40px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .company-info h1 { 
            margin: 0; 
            color: #2c5aa0;
            font-size: 24px;
        }
        .invoice-info { 
            text-align: right; 
        }
        .invoice-info h2 { 
            margin: 0; 
            font-size: 20px;
            color: #333;
        }
        .billing-info { 
            display: flex; 
            justify-content: space-between; 
            margin: 40px 0;
        }
        .bill-to, .ship-to { 
            width: 45%; 
        }
        .bill-to h3, .ship-to h3 { 
            margin-bottom: 10px;
            color: #2c5aa0;
        }
        .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 30px 0;
        }
        .items-table th, .items-table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left;
        }
        .items-table th { 
            background-color: #f8f9fa;
            color: #333;
            font-weight: bold;
        }
        .totals { 
            margin-left: auto; 
            width: 300px; 
            margin-top: 20px;
        }
        .totals table { 
            width: 100%; 
            border-collapse: collapse;
        }
        .totals td { 
            padding: 8px; 
            border-bottom: 1px solid #ddd;
        }
        .totals .total-row { 
            font-weight: bold; 
            border-top: 2px solid #333;
            background-color: #f8f9fa;
        }
        .footer { 
            margin-top: 50px; 
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
        .placeholder {
            background-color: #f0f0f0;
            padding: 5px;
            border: 1px dashed #ccc;
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h1>[COMPANY NAME]</h1>
            <div class="placeholder">[Company Address]</div>
            <div class="placeholder">[Phone] | [Email]</div>
        </div>
        <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> <span class="placeholder">[INVOICE NUMBER]</span></p>
            <p><strong>Date:</strong> <span class="placeholder">[INVOICE DATE]</span></p>
            <p><strong>Due Date:</strong> <span class="placeholder">[DUE DATE]</span></p>
        </div>
    </div>

    <div class="billing-info">
        <div class="bill-to">
            <h3>Bill To:</h3>
            <div class="placeholder">[Customer Name]</div>
            <div class="placeholder">[Customer Address]</div>
            <div class="placeholder">[City, State ZIP]</div>
            <div class="placeholder">[Phone] | [Email]</div>
        </div>
        <div class="ship-to">
            <h3>Ship To:</h3>
            <div class="placeholder">[Shipping Address]</div>
            <div class="placeholder">[City, State ZIP]</div>
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 50%">Description</th>
                <th style="width: 15%">Quantity</th>
                <th style="width: 15%">Unit Price</th>
                <th style="width: 20%">Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="placeholder">[Item Description 1]</td>
                <td class="placeholder">[Qty]</td>
                <td class="placeholder">[$0.00]</td>
                <td class="placeholder">[$0.00]</td>
            </tr>
            <tr>
                <td class="placeholder">[Item Description 2]</td>
                <td class="placeholder">[Qty]</td>
                <td class="placeholder">[$0.00]</td>
                <td class="placeholder">[$0.00]</td>
            </tr>
            <tr>
                <td class="placeholder">[Item Description 3]</td>
                <td class="placeholder">[Qty]</td>
                <td class="placeholder">[$0.00]</td>
                <td class="placeholder">[$0.00]</td>
            </tr>
            <tr>
                <td colspan="4" style="height: 100px; border: 1px dashed #ccc; text-align: center; color: #ccc; vertical-align: middle;">
                    [Additional items will be added here]
                </td>
            </tr>
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td style="text-align: right;" class="placeholder">[$0.00]</td>
            </tr>
            <tr>
                <td>Discount:</td>
                <td style="text-align: right;" class="placeholder">[$0.00]</td>
            </tr>
            <tr>
                <td>Tax:</td>
                <td style="text-align: right;" class="placeholder">[$0.00]</td>
            </tr>
            <tr class="total-row">
                <td><strong>Total:</strong></td>
                <td style="text-align: right;" class="placeholder"><strong>[$0.00]</strong></td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p><strong>Notes:</strong></p>
        <div class="placeholder">[Payment terms and additional notes]</div>
        <br>
        <p><strong>Payment Method:</strong> <span class="placeholder">[Payment instructions]</span></p>
    </div>
</body>
</html>`

	// Save HTML to temporary file
	tempDir := h.config.TempDir
	htmlPath := filepath.Join(tempDir, uuid.New().String()+".html")

	if err := os.WriteFile(htmlPath, []byte(htmlContent), 0644); err != nil {
		return fmt.Errorf("failed to create HTML file: %w", err)
	}
	defer os.Remove(htmlPath)

	// Convert HTML to PDF using wkhtmltopdf (if available)
	if h.commandExists("wkhtmltopdf") {
		cmd := exec.Command("wkhtmltopdf",
			"--page-size", "A4",
			"--margin-top", "0.75in",
			"--margin-right", "0.75in",
			"--margin-bottom", "0.75in",
			"--margin-left", "0.75in",
			htmlPath, outputPath)

		output, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("wkhtmltopdf failed: %v - %s", err, string(output))
		}
		return nil
	}

	// Fallback: Use Chromium/Chrome headless (if available)
	if h.commandExists("google-chrome") || h.commandExists("chromium-browser") {
		browser := "google-chrome"
		if !h.commandExists("google-chrome") {
			browser = "chromium-browser"
		}

		cmd := exec.Command(browser,
			"--headless",
			"--disable-gpu",
			"--print-to-pdf="+outputPath,
			"--print-to-pdf-no-header",
			htmlPath)

		output, err := cmd.CombinedOutput()
		if err != nil {
			return fmt.Errorf("%s failed: %v - %s", browser, err, string(output))
		}
		return nil
	}

	return fmt.Errorf("no PDF generation tool available (wkhtmltopdf or Chrome/Chromium required)")
}

// createModernInvoiceTemplate creates a modern-styled invoice template
func (h *InvoiceHandler) createModernInvoiceTemplate(outputPath string) error {
	// Similar to basic but with modern styling
	htmlContent := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Modern Invoice Template</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            color: #2c3e50;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            background: white;
            margin: 20px;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 40px;
            align-items: center;
        }
        .company-info h1 { 
            margin: 0; 
            color: #667eea;
            font-size: 28px;
            font-weight: 300;
        }
        .invoice-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
        }
        .invoice-badge h2 { 
            margin: 0; 
            font-size: 24px;
            font-weight: 300;
        }
        .info-cards {
            display: flex;
            gap: 20px;
            margin: 40px 0;
        }
        .card {
            flex: 1;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .card h3 {
            margin-top: 0;
            color: #667eea;
            font-weight: 400;
        }
        .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 30px 0;
            overflow: hidden;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .items-table th { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            text-align: left;
            font-weight: 400;
        }
        .items-table td { 
            padding: 15px; 
            border-bottom: 1px solid #eee;
        }
        .items-table tr:hover {
            background-color: #f8f9fa;
        }
        .totals-section {
            display: flex;
            justify-content: flex-end;
            margin-top: 30px;
        }
        .totals-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            min-width: 300px;
        }
        .total-row {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin: -20px -20px 0 -20px;
            padding: 15px 20px;
            border-radius: 8px 8px 0 0;
        }
        .placeholder {
            background-color: #e9ecef;
            padding: 8px 12px;
            border-radius: 4px;
            color: #6c757d;
            font-style: italic;
            border: 2px dashed #ced4da;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="company-info">
                <h1>[COMPANY NAME]</h1>
                <div class="placeholder">[Company Address]</div>
            </div>
            <div class="invoice-badge">
                <h2>INVOICE</h2>
                <div class="placeholder">[INVOICE NUMBER]</div>
            </div>
        </div>

        <div class="info-cards">
            <div class="card">
                <h3>Bill To</h3>
                <div class="placeholder">[Customer Name]</div>
                <div class="placeholder">[Customer Address]</div>
            </div>
            <div class="card">
                <h3>Invoice Details</h3>
                <p><strong>Date:</strong> <span class="placeholder">[DATE]</span></p>
                <p><strong>Due:</strong> <span class="placeholder">[DUE DATE]</span></p>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr><td class="placeholder">[Item 1]</td><td class="placeholder">[1]</td><td class="placeholder">[$0.00]</td><td class="placeholder">[$0.00]</td></tr>
                <tr><td class="placeholder">[Item 2]</td><td class="placeholder">[1]</td><td class="placeholder">[$0.00]</td><td class="placeholder">[$0.00]</td></tr>
            </tbody>
        </table>

        <div class="totals-section">
            <div class="totals-card">
                <div class="total-row">
                    <strong>Total: <span class="placeholder">[$0.00]</span></strong>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`

	return h.createPDFFromHTML(htmlContent, outputPath)
}

// createProfessionalInvoiceTemplate creates a professional-styled invoice template
func (h *InvoiceHandler) createProfessionalInvoiceTemplate(outputPath string) error {
	// Professional black and white design
	htmlContent := `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Professional Invoice Template</title>
    <style>
        body { 
            font-family: 'Times New Roman', serif; 
            margin: 0; 
            color: #000;
            line-height: 1.4;
        }
        .container {
            padding: 60px;
        }
        .letterhead {
            border-bottom: 3px solid #000;
            padding-bottom: 20px;
            margin-bottom: 40px;
        }
        .company-name {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .invoice-title {
            font-size: 48px;
            font-weight: bold;
            text-align: center;
            margin: 40px 0;
            letter-spacing: 2px;
        }
        .two-column {
            display: flex;
            justify-content: space-between;
            margin: 30px 0;
        }
        .column {
            width: 45%;
        }
        .section-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .professional-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        .professional-table th {
            background: #000;
            color: white;
            padding: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 12px;
        }
        .professional-table td {
            padding: 12px;
            border-bottom: 1px solid #ccc;
        }
        .total-section {
            margin-top: 40px;
            float: right;
            width: 300px;
        }
        .total-line {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ccc;
        }
        .final-total {
            background: #000;
            color: white;
            padding: 15px;
            font-weight: bold;
            font-size: 18px;
        }
        .placeholder {
            background-color: #f5f5f5;
            padding: 5px 8px;
            border: 1px solid #ddd;
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="letterhead">
            <div class="company-name">[COMPANY NAME]</div>
            <div class="placeholder">[Complete Company Address and Contact Information]</div>
        </div>

        <div class="invoice-title">INVOICE</div>

        <div class="two-column">
            <div class="column">
                <div class="section-title">Bill To:</div>
                <div class="placeholder">[Client Company Name]</div>
                <div class="placeholder">[Client Address]</div>
                <div class="placeholder">[City, State ZIP Code]</div>
            </div>
            <div class="column">
                <div class="section-title">Invoice Details:</div>
                <p><strong>Invoice Number:</strong> <span class="placeholder">[INV-001]</span></p>
                <p><strong>Invoice Date:</strong> <span class="placeholder">[Date]</span></p>
                <p><strong>Due Date:</strong> <span class="placeholder">[Due Date]</span></p>
                <p><strong>Payment Terms:</strong> <span class="placeholder">[Net 30]</span></p>
            </div>
        </div>

        <table class="professional-table">
            <thead>
                <tr>
                    <th>Description of Services</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="placeholder">[Service Description 1]</td>
                    <td class="placeholder">[Hours/Units]</td>
                    <td class="placeholder">[$00.00]</td>
                    <td class="placeholder">[$000.00]</td>
                </tr>
                <tr>
                    <td class="placeholder">[Service Description 2]</td>
                    <td class="placeholder">[Hours/Units]</td>
                    <td class="placeholder">[$00.00]</td>
                    <td class="placeholder">[$000.00]</td>
                </tr>
            </tbody>
        </table>

        <div class="total-section">
            <div class="total-line">
                <span>Subtotal:</span>
                <span class="placeholder">[$000.00]</span>
            </div>
            <div class="total-line">
                <span>Tax:</span>
                <span class="placeholder">[$00.00]</span>
            </div>
            <div class="final-total">
                <div style="display: flex; justify-content: space-between;">
                    <span>TOTAL DUE:</span>
                    <span class="placeholder">[$000.00]</span>
                </div>
            </div>
        </div>

        <div style="clear: both; margin-top: 60px;">
            <div class="section-title">Payment Instructions:</div>
            <div class="placeholder">[Bank details, payment methods, and additional terms]</div>
        </div>
    </div>
</body>
</html>`

	return h.createPDFFromHTML(htmlContent, outputPath)
}

// createPDFFromHTML converts HTML content to PDF
func (h *InvoiceHandler) createPDFFromHTML(htmlContent, outputPath string) error {
	tempDir := h.config.TempDir
	htmlPath := filepath.Join(tempDir, uuid.New().String()+".html")

	if err := os.WriteFile(htmlPath, []byte(htmlContent), 0644); err != nil {
		return fmt.Errorf("failed to create HTML file: %w", err)
	}
	defer os.Remove(htmlPath)

	// Try different PDF generation methods
	if h.commandExists("wkhtmltopdf") {
		cmd := exec.Command("wkhtmltopdf",
			"--page-size", "A4",
			"--margin-top", "0.5in",
			"--margin-right", "0.5in",
			"--margin-bottom", "0.5in",
			"--margin-left", "0.5in",
			"--disable-smart-shrinking",
			htmlPath, outputPath)

		if output, err := cmd.CombinedOutput(); err != nil {
			return fmt.Errorf("wkhtmltopdf failed: %v - %s", err, string(output))
		}
		return nil
	}

	// Fallback methods...
	browsers := []string{"google-chrome", "chromium-browser", "chrome"}
	for _, browser := range browsers {
		if h.commandExists(browser) {
			cmd := exec.Command(browser,
				"--headless",
				"--disable-gpu",
				"--print-to-pdf="+outputPath,
				"--print-to-pdf-no-header",
				"--virtual-time-budget=1000",
				htmlPath)

			if output, err := cmd.CombinedOutput(); err == nil {
				return nil
			} else {
				fmt.Printf("Browser %s failed: %v - %s\n", browser, err, string(output))
			}
		}
	}

	return fmt.Errorf("no PDF generation tool available")
}
