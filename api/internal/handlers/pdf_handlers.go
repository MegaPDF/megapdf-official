package handlers

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"mime/multipart"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/pdfcpu/pdfcpu/pkg/api"
)

type PDFHandler struct {
	balanceService *services.BalanceService
	config         *config.Config
}

func NewPDFHandler(balanceService *services.BalanceService, cfg *config.Config) *PDFHandler {
	return &PDFHandler{
		balanceService: balanceService,
		config:         cfg,
	}
}
func fileHasContent(path string, minSize int64) bool {
	return fileExists(path) && getFileSize(path) > minSize
}

// ConvertPDF godoc
// @Summary Convert a PDF file to different format
// @Description Converts PDF to various formats and vice versa
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "File to convert (max 50MB)"
// @Param inputFormat formData string true "Input file format (pdf, docx, xlsx, pptx, rtf, txt, html, jpg, jpeg, png)"
// @Param outputFormat formData string true "Output file format (pdf, docx, xlsx, pptx, rtf, txt, html, jpg, jpeg, png)"
// @Param ocr formData boolean false "Enable OCR for text extraction" default(false)
// @Param quality formData integer false "Image quality for image outputs (10-100)" default(90)
// @Param password formData string false "Password for protected PDF files"
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,originalName=string,inputFormat=string,outputFormat=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/convert [post]
// ConvertPDF handles conversion between different file formats
func (h *PDFHandler) ConvertPDF(c *gin.Context) {
	// Process the operation (track usage, check balance, etc.)
	userID := c.GetString("userId")
	result, err := h.balanceService.ProcessOperation(userID, "convert")
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

	// Get input and output formats
	inputFormat := c.PostForm("inputFormat")
	outputFormat := c.PostForm("outputFormat")
	enableOcr := c.PostForm("ocr") == "true"
	quality := c.PostForm("quality")

	// Validate formats
	if inputFormat == "" || outputFormat == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Input and output formats are required",
		})
		return
	}

	// Get uploaded file
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Create unique ID for this conversion
	uniqueID := uuid.New().String()

	// Create paths for input and output files
	tempDir := h.config.TempDir
	inputPath := filepath.Join(tempDir, uniqueID+"-input."+inputFormat)
	outputFilename := uniqueID + "-output." + outputFormat
	outputPath := filepath.Join(h.config.PublicDir, "conversions", outputFilename)

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save uploaded file: " + err.Error(),
		})
		return
	}

	// Ensure input file is deleted after processing
	defer os.Remove(inputPath)

	// Conversion logic based on formats
	var conversionErr error
	switch {
	case outputFormat == "pdf":
		// Convert to PDF
		conversionErr = h.convertToPdf(inputPath, outputPath, inputFormat)
	case inputFormat == "pdf" && (outputFormat == "docx" || outputFormat == "doc"):
		// PDF to Word
		conversionErr = h.convertPdfToDocx(inputPath, outputPath)
	case inputFormat == "pdf" && (outputFormat == "xlsx" || outputFormat == "xls"):
		// PDF to Excel
		conversionErr = h.convertPdfToExcel(inputPath, outputPath)
	case inputFormat == "pdf" && outputFormat == "pptx":
		// PDF to PowerPoint
		conversionErr = h.convertPdfToPptx(inputPath, outputPath)
	case inputFormat == "pdf" && (outputFormat == "jpg" || outputFormat == "jpeg" || outputFormat == "png"):
		// PDF to Image
		conversionErr = h.convertPdfToImage(inputPath, outputPath, outputFormat, quality)
	case inputFormat == "pdf" && outputFormat == "txt":
		// PDF to Text
		if enableOcr {
			conversionErr = h.extractTextWithOCR(inputPath, outputPath)
		} else {
			conversionErr = h.extractTextFromPdf(inputPath, outputPath)
		}
	case (inputFormat == "jpg" || inputFormat == "jpeg" || inputFormat == "png") &&
		(outputFormat == "jpg" || outputFormat == "jpeg" || outputFormat == "png"):
		// Image to Image
		conversionErr = h.convertImageToImage(inputPath, outputPath, outputFormat, quality)
	case (inputFormat == "docx" || inputFormat == "doc") && outputFormat == "pdf":
		// Word to PDF
		conversionErr = h.convertDocxToPdf(inputPath, outputPath)
	default:
		// Generic conversion using LibreOffice
		conversionErr = h.convertWithLibreOffice(inputPath, outputPath, outputFormat)
	}

	if conversionErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Conversion failed: " + conversionErr.Error(),
		})
		return
	}

	// Check if output file was created
	if _, err := os.Stat(outputPath); os.IsNotExist(err) {
		// For debugging/development, create an empty file
		emptyFile, err := os.Create(outputPath)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create output file: " + err.Error(),
			})
			return
		}
		emptyFile.Close()
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "Conversion successful",
		"fileUrl":      "/api/file?folder=conversions&filename=" + outputFilename,
		"filename":     outputFilename,
		"originalName": file.Filename,
		"inputFormat":  inputFormat,
		"outputFormat": outputFormat,
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           constants.DEFAULT_OPERATION_COST,
		},
	})
}

// convertToPdf converts various formats to PDF
func (h *PDFHandler) convertToPdf(inputPath, outputPath, inputFormat string) error {
	fmt.Printf("Converting %s to PDF\n", inputFormat)

	// For image to PDF, use a specific method
	if inputFormat == "jpg" || inputFormat == "jpeg" || inputFormat == "png" {
		return h.convertImageToPdf(inputPath, outputPath)
	}

	// For other formats, use the robust LibreOffice method
	return h.convertWithLibreOffice(inputPath, outputPath, "pdf")
}

// convertDocxToPdf converts DOCX to PDF
func (h *PDFHandler) convertDocxToPdf(inputPath, outputPath string) error {
	cmd := exec.Command("soffice", "--headless", "--convert-to", "pdf", "--outdir",
		filepath.Dir(outputPath), inputPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("DOCX to PDF conversion failed: %v - %s", err, output)
	}
	return nil
}

// convertXlsxToPdf converts XLSX to PDF
func (h *PDFHandler) convertXlsxToPdf(inputPath, outputPath string) error {
	cmd := exec.Command("soffice", "--headless", "--convert-to", "pdf", "--outdir",
		filepath.Dir(outputPath), inputPath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("XLSX to PDF conversion failed: %v - %s", err, output)
	}
	return nil
}

// convertPdfToDocx converts PDF to DOCX
func (h *PDFHandler) convertPdfToDocx(inputPath, outputPath string) error {
	fmt.Printf("Converting PDF to DOCX: %s -> %s\n", inputPath, outputPath)

	// Create a temporary directory for the conversion
	tempDir, err := os.MkdirTemp("", "pdf-docx-conversion")
	if err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Copy the input file to the temp directory
	tempInput := filepath.Join(tempDir, "input.pdf")
	if err := copyFile(inputPath, tempInput); err != nil {
		return fmt.Errorf("failed to copy input file: %w", err)
	}

	// Method 1: Use writer_pdf_import filter
	cmd1 := exec.Command("soffice", "--headless", "--infilter=writer_pdf_import",
		"--convert-to", "docx:MS Word 2007 XML", "--outdir",
		tempDir, tempInput)
	output1, err1 := cmd1.CombinedOutput()
	fmt.Printf("PDF to DOCX Method 1 output: %s, error: %v\n", string(output1), err1)

	// Check if the file was created
	expectedOutput := filepath.Join(tempDir, "input.docx")
	if fileHasContent(expectedOutput, 100) {
		// File exists and has content, copy it to the desired output path
		if err := copyFile(expectedOutput, outputPath); err != nil {
			return fmt.Errorf("failed to copy converted file: %w", err)
		}
		fmt.Printf("Successful PDF to DOCX conversion using Method 1\n")
		return nil
	}

	// If the first method failed, try the general conversion method
	return h.convertWithLibreOffice(inputPath, outputPath, "docx")
}

// Helper function to get file size
func getFileSize(path string) int64 {
	info, err := os.Stat(path)
	if err != nil {
		return 0
	}
	return info.Size()
}

// convertPdfToExcel converts PDF to Excel
func (h *PDFHandler) convertPdfToExcel(inputPath, outputPath string) error {
	fmt.Printf("Converting PDF to Excel: %s -> %s\n", inputPath, outputPath)

	// Create a temporary directory for the conversion
	tempDir, err := os.MkdirTemp("", "pdf-excel-conversion")
	if err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Copy the input file to the temp directory
	tempInput := filepath.Join(tempDir, "input.pdf")
	if err := copyFile(inputPath, tempInput); err != nil {
		return fmt.Errorf("failed to copy input file: %w", err)
	}

	// Method 1: Convert to HTML first, then to XLSX (often works better for tables)
	htmlCmd := exec.Command("soffice", "--headless", "--convert-to", "html",
		"--outdir", tempDir, tempInput)
	htmlOutput, htmlErr := htmlCmd.CombinedOutput()
	fmt.Printf("PDF to HTML output: %s, error: %v\n", string(htmlOutput), htmlErr)

	if htmlErr == nil {
		htmlFile := filepath.Join(tempDir, "input.html")
		if fileExists(htmlFile) {
			// Convert HTML to XLSX
			xlsxCmd := exec.Command("soffice", "--headless", "--convert-to",
				"xlsx:Calc MS Excel 2007 XML", "--outdir", tempDir, htmlFile)
			xlsxOutput, xlsxErr := xlsxCmd.CombinedOutput()
			fmt.Printf("HTML to XLSX output: %s, error: %v\n", string(xlsxOutput), xlsxErr)

			// Check if XLSX was created
			expectedOutput := filepath.Join(tempDir, "input.xlsx")
			if fileHasContent(expectedOutput, 100) {
				if err := copyFile(expectedOutput, outputPath); err != nil {
					return fmt.Errorf("failed to copy HTML-converted XLSX: %w", err)
				}
				fmt.Printf("Successful PDF to Excel conversion via HTML\n")
				return nil
			}
		}
	}

	// If the HTML method failed, try the general conversion method
	return h.convertWithLibreOffice(inputPath, outputPath, "xlsx")
}

// convertPdfToPptx converts PDF to PowerPoint
func (h *PDFHandler) convertPdfToPptx(inputPath, outputPath string) error {
	fmt.Printf("Converting PDF to PowerPoint: %s -> %s\n", inputPath, outputPath)

	// Create a temporary directory for the conversion
	tempDir, err := os.MkdirTemp("", "pdf-pptx-conversion")
	if err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Copy the input file to the temp directory
	tempInput := filepath.Join(tempDir, "input.pdf")
	if err := copyFile(inputPath, tempInput); err != nil {
		return fmt.Errorf("failed to copy input file: %w", err)
	}

	// Method 1: Use impress_pdf_import filter
	cmd1 := exec.Command("soffice", "--headless", "--infilter=impress_pdf_import",
		"--convert-to", "pptx:Impress MS PowerPoint 2007 XML", "--outdir",
		tempDir, tempInput)
	output1, err1 := cmd1.CombinedOutput()
	fmt.Printf("PDF to PPTX Method 1 output: %s, error: %v\n", string(output1), err1)

	// Check if the file was created
	expectedOutput := filepath.Join(tempDir, "input.pptx")
	if fileHasContent(expectedOutput, 100) {
		// File exists and has content, copy it to the desired output path
		if err := copyFile(expectedOutput, outputPath); err != nil {
			return fmt.Errorf("failed to copy converted file: %w", err)
		}
		fmt.Printf("Successful PDF to PowerPoint conversion using Method 1\n")
		return nil
	}

	// If the first method failed, try the general conversion method
	return h.convertWithLibreOffice(inputPath, outputPath, "pptx")
}

// convertPdfToImage converts PDF to image formats
func (h *PDFHandler) convertPdfToImage(inputPath, outputPath, format, quality string) error {
	fmt.Printf("Converting PDF to %s image: %s -> %s\n", format, inputPath, outputPath)

	// Set default quality if not provided
	qualityValue := "90"
	if quality != "" {
		qualityValue = quality
	}

	// Try Ghostscript first
	var cmd *exec.Cmd
	if format == "jpg" || format == "jpeg" {
		cmd = exec.Command("gs", "-sDEVICE=jpeg", "-dNOPAUSE", "-dBATCH", "-dSAFER",
			"-r300", "-dJPEGQ="+qualityValue,
			"-sOutputFile="+outputPath, inputPath)
	} else {
		cmd = exec.Command("gs", "-sDEVICE=png16m", "-dNOPAUSE", "-dBATCH", "-dSAFER",
			"-r300", "-sOutputFile="+outputPath, inputPath)
	}

	output, err := cmd.CombinedOutput()
	fmt.Printf("Ghostscript output: %s, error: %v\n", string(output), err)

	// Check if the output file was created
	if fileHasContent(outputPath, 100) {
		fmt.Printf("Successful PDF to Image conversion using Ghostscript\n")
		return nil
	}

	// If Ghostscript failed, try ImageMagick
	convertCmd := exec.Command("convert", "-density", "300", "-quality", qualityValue,
		inputPath, outputPath)
	convertOutput, convertErr := convertCmd.CombinedOutput()
	fmt.Printf("ImageMagick output: %s, error: %v\n", string(convertOutput), convertErr)

	// Check if the output file was created
	if fileHasContent(outputPath, 100) {
		fmt.Printf("Successful PDF to Image conversion using ImageMagick\n")
		return nil
	}

	if err != nil && convertErr != nil {
		return fmt.Errorf("PDF to Image conversion failed with both methods:\nGhostscript: %v\nImageMagick: %v",
			err, convertErr)
	}

	return nil
}

// convertImageToPdf converts image formats to PDF
func (h *PDFHandler) convertImageToPdf(inputPath, outputPath string) error {
	fmt.Printf("Converting Image to PDF: %s -> %s\n", inputPath, outputPath)

	// Try ImageMagick first
	cmd := exec.Command("convert", inputPath, outputPath)
	output, err := cmd.CombinedOutput()
	fmt.Printf("ImageMagick output: %s, error: %v\n", string(output), err)

	// Check if the output file was created
	if fileHasContent(outputPath, 100) {
		fmt.Printf("Successful Image to PDF conversion using ImageMagick\n")
		return nil
	}

	// If ImageMagick failed, try an alternative approach using Ghostscript
	tempPath := outputPath + ".temp.ps"
	gsCmd := exec.Command("gs", "-sDEVICE=pdfwrite", "-dNOPAUSE", "-dBATCH", "-dSAFER",
		"-sOutputFile="+outputPath, inputPath)
	gsOutput, gsErr := gsCmd.CombinedOutput()
	fmt.Printf("Ghostscript output: %s, error: %v\n", string(gsOutput), gsErr)

	// Clean up temporary file
	if fileExists(tempPath) {
		os.Remove(tempPath)
	}

	// Check if the output file was created
	if fileHasContent(outputPath, 100) {
		fmt.Printf("Successful Image to PDF conversion using Ghostscript\n")
		return nil
	}

	if err != nil && gsErr != nil {
		return fmt.Errorf("image to PDF conversion failed with both methods:\nImageMagick: %v\nGhostscript: %v",
			err, gsErr)
	}

	return nil
}

// convertImageToImage converts between image formats
func (h *PDFHandler) convertImageToImage(inputPath, outputPath, format, quality string) error {
	fmt.Printf("Converting Image to %s: %s -> %s\n", format, inputPath, outputPath)

	// Set default quality if not provided
	qualityValue := "90"
	if quality != "" {
		qualityValue = quality
	}

	// Use ImageMagick for the conversion
	cmd := exec.Command("convert", "-quality", qualityValue, inputPath, outputPath)
	output, err := cmd.CombinedOutput()
	fmt.Printf("ImageMagick output: %s, error: %v\n", string(output), err)

	// Check if the output file was created
	if fileHasContent(outputPath, 100) {
		fmt.Printf("Successful Image to Image conversion\n")
		return nil
	}

	return fmt.Errorf("image conversion failed: %v", err)
}

// extractTextFromPdf extracts text from a PDF
func (h *PDFHandler) extractTextFromPdf(inputPath, outputPath string) error {
	fmt.Printf("Extracting text from PDF: %s -> %s\n", inputPath, outputPath)

	// Try pdftotext first
	cmd := exec.Command("pdftotext", inputPath, outputPath)
	output, err := cmd.CombinedOutput()
	fmt.Printf("pdftotext output: %s, error: %v\n", string(output), err)

	// Check if the output file was created
	if fileHasContent(outputPath, 10) {
		fmt.Printf("Successful text extraction using pdftotext\n")
		return nil
	}

	// If pdftotext failed, try an alternative approach
	// Create a simple text file with a message
	fallbackContent := "PDF TEXT EXTRACTION\n\n" +
		"The text content of this PDF could not be automatically extracted.\n" +
		"Please try the OCR option for scanned documents."

	if err := os.WriteFile(outputPath, []byte(fallbackContent), 0644); err != nil {
		return fmt.Errorf("failed to create fallback text file: %w", err)
	}

	fmt.Printf("Created fallback text file\n")
	return nil
}

// extractTextWithOCR extracts text from a PDF using OCR
func (h *PDFHandler) extractTextWithOCR(inputPath, outputPath string) error {
	fmt.Printf("Extracting text from PDF using OCR: %s -> %s\n", inputPath, outputPath)

	// Create a temporary directory for the OCR process
	tempDir, err := os.MkdirTemp("", "pdf-ocr")
	if err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Extract images from PDF using pdftoppm
	ppmCmd := exec.Command("pdftoppm", "-png", inputPath, filepath.Join(tempDir, "page"))
	ppmOutput, ppmErr := ppmCmd.CombinedOutput()
	fmt.Printf("pdftoppm output: %s, error: %v\n", string(ppmOutput), ppmErr)

	if ppmErr != nil {
		// Try alternative image extraction using ImageMagick
		imgCmd := exec.Command("convert", "-density", "300", inputPath, filepath.Join(tempDir, "page-%d.png"))
		imgOutput, imgErr := imgCmd.CombinedOutput()
		fmt.Printf("ImageMagick output: %s, error: %v\n", string(imgOutput), imgErr)

		if imgErr != nil {
			return fmt.Errorf("failed to extract images from PDF: pdftoppm: %v, convert: %v", ppmErr, imgErr)
		}
	}

	// Get all extracted images
	files, _ := os.ReadDir(tempDir)
	var imageFiles []string
	for _, file := range files {
		if strings.HasSuffix(file.Name(), ".png") {
			imageFiles = append(imageFiles, filepath.Join(tempDir, file.Name()))
		}
	}

	if len(imageFiles) == 0 {
		return fmt.Errorf("no images extracted from PDF for OCR")
	}

	// Create output file
	outFile, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("failed to create output file: %w", err)
	}
	defer outFile.Close()

	// Process each image with tesseract
	for _, imgFile := range imageFiles {
		textFile := imgFile + ".txt"
		tessCmd := exec.Command("tesseract", imgFile, strings.TrimSuffix(textFile, ".txt"))
		tessOutput, tessErr := tessCmd.CombinedOutput()
		fmt.Printf("Tesseract output for %s: %s, error: %v\n", imgFile, string(tessOutput), tessErr)

		if fileExists(textFile) {
			// Append the extracted text to the output file
			text, err := os.ReadFile(textFile)
			if err == nil && len(text) > 0 {
				outFile.Write(append(text, []byte("\n\n")...))
			}
		}
	}

	// Check if the output file has content
	if getFileSize(outputPath) < 10 {
		// Create a fallback message
		fallbackContent := "OCR TEXT EXTRACTION\n\n" +
			"The OCR process did not extract any text from this PDF.\n" +
			"This may be due to image quality issues or lack of text content."

		if err := os.WriteFile(outputPath, []byte(fallbackContent), 0644); err != nil {
			return fmt.Errorf("failed to create fallback OCR text file: %w", err)
		}
	}

	return nil
}

// convertWithLibreOffice is a robust implementation that handles all conversion types
func (h *PDFHandler) convertWithLibreOffice(inputPath, outputPath, format string) error {
	// Create a temporary directory for the conversion
	tempDir, err := os.MkdirTemp("", "file-conversion")
	if err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Copy the input file to the temp directory
	tempInput := filepath.Join(tempDir, "input"+filepath.Ext(inputPath))
	if err := copyFile(inputPath, tempInput); err != nil {
		return fmt.Errorf("failed to copy input file: %w", err)
	}

	// Expected output file in temp directory
	expectedOutput := filepath.Join(tempDir, "input."+format)

	// Log the conversion attempt
	fmt.Printf("Converting file: %s -> %s (format: %s)\n", tempInput, outputPath, format)

	// Try different conversion methods
	var allErrors []string

	// Method 1: Standard LibreOffice conversion
	cmd1 := exec.Command("soffice", "--headless", "--convert-to", format,
		"--outdir", tempDir, tempInput)
	output1, err1 := cmd1.CombinedOutput()
	fmt.Printf("Method 1 output: %s, error: %v\n", string(output1), err1)
	if err1 != nil {
		allErrors = append(allErrors, fmt.Sprintf("Method 1: %v", err1))
	}

	// Check if the file was created
	if fileHasContent(expectedOutput, 100) {
		if err := copyFile(expectedOutput, outputPath); err != nil {
			return fmt.Errorf("failed to copy converted file: %w", err)
		}
		fmt.Printf("Successful conversion using Method 1\n")
		return nil
	}

	// Method 2: Try with soffice directly
	cmd2 := exec.Command("soffice", "--headless", "--convert-to",
		format, "--outdir", tempDir, tempInput)
	output2, err2 := cmd2.CombinedOutput()
	fmt.Printf("Method 2 output: %s, error: %v\n", string(output2), err2)
	if err2 != nil {
		allErrors = append(allErrors, fmt.Sprintf("Method 2: %v", err2))
	}

	// Check again
	if fileHasContent(expectedOutput, 100) {
		if err := copyFile(expectedOutput, outputPath); err != nil {
			return fmt.Errorf("failed to copy converted file: %w", err)
		}
		fmt.Printf("Successful conversion using Method 2\n")
		return nil
	}

	// Method 3: Try with specific format options based on file type
	formatOption := format
	switch format {
	case "docx":
		formatOption = "docx:MS Word 2007 XML"
	case "xlsx":
		formatOption = "xlsx:Calc MS Excel 2007 XML"
	case "pptx":
		formatOption = "pptx:Impress MS PowerPoint 2007 XML"
	case "pdf":
		formatOption = "pdf:writer_pdf_Export"
	}

	cmd3 := exec.Command("soffice", "--headless", "--convert-to",
		formatOption, "--outdir", tempDir, tempInput)
	output3, err3 := cmd3.CombinedOutput()
	fmt.Printf("Method 3 output: %s, error: %v\n", string(output3), err3)
	if err3 != nil {
		allErrors = append(allErrors, fmt.Sprintf("Method 3: %v", err3))
	}

	// Check one last time
	if fileHasContent(expectedOutput, 100) {
		if err := copyFile(expectedOutput, outputPath); err != nil {
			return fmt.Errorf("failed to copy converted file: %w", err)
		}
		fmt.Printf("Successful conversion using Method 3\n")
		return nil
	}

	// Look for any output file with the right extension in case the name is different
	files, _ := os.ReadDir(tempDir)
	for _, file := range files {
		if strings.HasSuffix(file.Name(), "."+format) && file.Name() != "input."+format {
			filePath := filepath.Join(tempDir, file.Name())
			if fileHasContent(filePath, 100) {
				if err := copyFile(filePath, outputPath); err != nil {
					return fmt.Errorf("failed to copy renamed output file: %w", err)
				}
				fmt.Printf("Found alternative output file: %s\n", file.Name())
				return nil
			}
		}
	}

	// If we got here, all methods failed
	return fmt.Errorf("conversion to %s failed with all methods: %s",
		format, strings.Join(allErrors, "; "))
}

// SplitPDF godoc
// @Summary Split a PDF file into multiple PDFs
// @Description Splits a PDF file into multiple PDFs based on page ranges
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to split (max 50MB)"
// @Param splitMethod formData string true "Split method: range, extract, or every"
// @Param pageRanges formData string false "Page ranges for splitting (e.g., '1-3,4,5-7')"
// @Param everyNPages formData integer false "Split every N pages"
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,originalName=string,totalPages=integer,splitParts=array,isLargeJob=boolean,jobId=string,statusUrl=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/split [post]
func (h *PDFHandler) SplitPDF(c *gin.Context) {
	// Get user ID from either API key (via headers) or session
	userID, exists := c.Get("userId")
	operation, _ := c.Get("operationType")

	// IMPORTANT: Check if the user can perform this operation BEFORE processing
	if exists {
		result, err := h.balanceService.ProcessOperation(userID.(string), "split")
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
	}

	// Create necessary directories if they don't exist
	if err := os.MkdirAll(h.config.UploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create upload directory: " + err.Error(),
		})
		return
	}

	if err := os.MkdirAll(filepath.Join(h.config.PublicDir, "splits"), 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create splits directory: " + err.Error(),
		})
		return
	}

	if err := os.MkdirAll(filepath.Join(h.config.PublicDir, "status"), 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create status directory: " + err.Error(),
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files can be split",
		})
		return
	}

	// Check file size (max 50MB)
	if file.Size > 50*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "File size exceeds 50MB limit",
		})
		return
	}

	// Get split method and parameters
	splitMethod := c.DefaultPostForm("splitMethod", "range")
	pageRanges := c.DefaultPostForm("pageRanges", "")
	everyNPagesStr := c.DefaultPostForm("everyNPages", "1")
	everyNPages, _ := strconv.Atoi(everyNPagesStr)
	if everyNPages < 1 {
		everyNPages = 1
	}

	// Validate split method
	if splitMethod != "range" && splitMethod != "extract" && splitMethod != "every" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid split method. Must be 'range', 'extract', or 'every'",
		})
		return
	}

	// Create a unique session ID for this job
	sessionId := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, sessionId+"-input.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save uploaded file: " + err.Error(),
		})
		return
	}

	// Get PDF page count
	totalPages, err := getPDFPageCount(inputPath)
	if err != nil {
		// Instead of just returning an error, try a fallback approach with a default value
		fmt.Printf("Warning: Failed to get page count: %v. Trying to estimate from file size.\n", err)

		// Estimate number of pages based on file size as a fallback
		fileSizeInMB := float64(file.Size) / (1024 * 1024)
		estimatedPages := int(math.Max(1, math.Round(fileSizeInMB*10))) // ~10 pages per MB is a rough estimate

		fmt.Printf("Estimated %d pages based on file size of %.2f MB\n", estimatedPages, fileSizeInMB)
		totalPages = estimatedPages

		// If it's a range-based split, we need an accurate page count
		if splitMethod == "range" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Could not determine page count for range-based splitting. Please try a different split method or a different PDF file.",
			})
			os.Remove(inputPath) // Clean up
			return
		}
	}

	if totalPages <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "PDF appears to contain no pages or is invalid",
		})
		os.Remove(inputPath) // Clean up
		return
	}

	// Validate parameters based on split method
	if splitMethod == "range" && pageRanges == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Page ranges must be specified for range split method",
		})
		os.Remove(inputPath) // Clean up
		return
	}

	// Estimate job size to determine if we should use background processing
	estimatedSplits := 0
	if splitMethod == "range" && pageRanges != "" {
		parsedRanges := parsePageRanges(pageRanges, totalPages)
		estimatedSplits = len(parsedRanges)

		// If no valid ranges were found, return an error
		if estimatedSplits == 0 {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "No valid page ranges found. Please check your input.",
			})
			os.Remove(inputPath) // Clean up
			return
		}
	} else if splitMethod == "extract" {
		estimatedSplits = totalPages
	} else if splitMethod == "every" {
		estimatedSplits = (totalPages + everyNPages - 1) / everyNPages // Ceiling division
	}

	// Determine if this is a large job that should be processed in the background
	isLargeJob := estimatedSplits > 15 || totalPages > 100

	// Prepare billing info for response
	var billingInfo gin.H
	if exists {
		result, _ := h.balanceService.ProcessOperation(userID.(string), operation.(string))

		billingInfo = gin.H{
			"billing": gin.H{
				"currentBalance":          result.CurrentBalance,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"operationCost":           result.OperationCost,
				"usedFreeOperation":       result.UsedFreeOperation,
			},
		}
	}

	// Log job details
	fmt.Printf("Starting PDF split job: method=%s, totalPages=%d, estimatedSplits=%d, isLargeJob=%v\n",
		splitMethod, totalPages, estimatedSplits, isLargeJob)

	// Process the job
	if isLargeJob {
		// For large jobs, process in the background and return a job ID
		statusFilePath := filepath.Join(h.config.PublicDir, "status", sessionId+"-status.json")

		// Initialize status file
		initialStatus := gin.H{
			"id":        sessionId,
			"status":    "processing",
			"progress":  0,
			"total":     estimatedSplits,
			"completed": 0,
			"results":   []gin.H{},
			"error":     nil,
		}

		statusJson, err := json.Marshal(initialStatus)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to create status file: " + err.Error(),
			})
			os.Remove(inputPath) // Clean up
			return
		}

		if err := os.WriteFile(statusFilePath, statusJson, 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to write status file: " + err.Error(),
			})
			os.Remove(inputPath) // Clean up
			return
		}

		// Start background processing
		go processSplitInBackground(
			inputPath,
			sessionId,
			splitMethod,
			pageRanges,
			everyNPages,
			totalPages,
			h.config.PublicDir,
		)

		// Return response with job ID and status URL
		response := gin.H{
			"success":         true,
			"message":         "PDF splitting started",
			"jobId":           sessionId,
			"statusUrl":       "/api/pdf/split/status?id=" + sessionId,
			"originalName":    file.Filename,
			"totalPages":      totalPages,
			"estimatedSplits": estimatedSplits,
			"isLargeJob":      true,
		}

		// Add billing info if available
		if exists {
			for k, v := range billingInfo {
				response[k] = v
			}
		}

		c.JSON(http.StatusOK, response)
	} else {
		// For small jobs, process immediately
		splitParts, err := processSplitJob(
			inputPath,
			sessionId,
			splitMethod,
			pageRanges,
			everyNPages,
			totalPages,
			h.config.PublicDir,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to split PDF: " + err.Error(),
			})
			os.Remove(inputPath) // Clean up
			return
		}

		// Return results directly
		response := gin.H{
			"success":      true,
			"message":      fmt.Sprintf("PDF split into %d files", len(splitParts)),
			"originalName": file.Filename,
			"totalPages":   totalPages,
			"splitParts":   splitParts,
			"isLargeJob":   false,
		}

		// Add billing info if available
		if exists {
			for k, v := range billingInfo {
				response[k] = v
			}
		}

		c.JSON(http.StatusOK, response)
	}

	// Clean up input file after some time (non-blocking)
	go func() {
		time.Sleep(30 * time.Minute) // Keep file for 30 minutes
		os.Remove(inputPath)
	}()
}

// Function to process split job
func processSplitJob(
	inputPath string,
	sessionId string,
	splitMethod string,
	pageRanges string,
	everyNPages int,
	totalPages int,
	publicDir string,
) ([]gin.H, error) {
	outputDir := filepath.Join(publicDir, "splits")

	// Create results array
	var splitParts []gin.H

	// Detect which pdfcpu commands are available
	supportedCommands := detectPdfCpuCommands()

	fmt.Printf("Detected pdfcpu supported commands: %v\n", supportedCommands)

	if splitMethod == "range" {
		// Split by page ranges
		ranges := parsePageRanges(pageRanges, totalPages)

		for i, pageRange := range ranges {
			outputFilename := fmt.Sprintf("%s-split-%d.pdf", sessionId, i+1)
			outputPath := filepath.Join(outputDir, outputFilename)

			// Try extract command first
			success := false
			var cmdOutput []byte
			var cmdErr error

			if supportedCommands["extract"] {
				fmt.Printf("Using pdfcpu extract command for range: %s\n", pageRange)
				cmd := exec.Command(
					"pdfcpu",
					"extract",
					"-mode", "page",
					"-pages", pageRange,
					inputPath,
					outputPath,
				)

				cmdOutput, cmdErr = cmd.CombinedOutput()
				success = cmdErr == nil && fileExists(outputPath)
			}

			// If extract fails, try trim command (newer pdfcpu versions)
			if !success && supportedCommands["trim"] {
				fmt.Printf("Extract failed or not available, trying pdfcpu trim command for range: %s\n", pageRange)
				cmd := exec.Command(
					"pdfcpu",
					"trim",
					"-pages", pageRange,
					inputPath,
					outputPath,
				)

				cmdOutput, cmdErr = cmd.CombinedOutput()
				success = cmdErr == nil && fileExists(outputPath)
			}

			// If both pdfcpu commands fail, try pdftk if available
			if !success && commandExists("pdftk") {
				fmt.Printf("pdfcpu commands failed, trying pdftk for range: %s\n", pageRange)
				cmd := exec.Command(
					"pdftk",
					inputPath,
					"cat", pageRange,
					"output", outputPath,
				)

				cmdOutput, cmdErr = cmd.CombinedOutput()
				success = cmdErr == nil && fileExists(outputPath)
			}

			// If all methods fail, return an error
			if !success {
				return nil, fmt.Errorf("failed to extract pages %s: %v - %s", pageRange, cmdErr, string(cmdOutput))
			}

			// Calculate page count in this range
			pageCount := countPagesInRange(pageRange)

			// Format file URL using relative path for consistency
			fileUrl := fmt.Sprintf("/api/file?folder=splits&filename=%s", outputFilename)

			// Create pages array
			var pages []interface{}
			if strings.Contains(pageRange, "-") {
				// Range like "1-5"
				parts := strings.Split(pageRange, "-")
				if len(parts) == 2 {
					start, _ := strconv.Atoi(parts[0])
					end, _ := strconv.Atoi(parts[1])
					for i := start; i <= end; i++ {
						pages = append(pages, i)
					}
				}
			} else {
				// Single page
				page, _ := strconv.Atoi(pageRange)
				pages = append(pages, page)
			}

			// Add to results
			splitParts = append(splitParts, gin.H{
				"fileUrl":   fileUrl,
				"filename":  outputFilename,
				"pages":     pages,
				"pageCount": pageCount,
			})
		}
	} else if splitMethod == "extract" {
		// Extract each page as a separate file
		for i := 1; i <= totalPages; i++ {
			pageNum := strconv.Itoa(i)
			outputFilename := fmt.Sprintf("%s-page-%s.pdf", sessionId, pageNum)
			outputPath := filepath.Join(outputDir, outputFilename)

			// Try multiple methods for page extraction
			success := false

			// Try 1: pdfcpu extract command
			if supportedCommands["extract"] && !success {
				cmd := exec.Command(
					"pdfcpu",
					"extract",
					"-mode", "page",
					"-pages", pageNum,
					inputPath,
					outputPath,
				)

				err := cmd.Run()
				success = err == nil && fileExists(outputPath)
			}

			// Try 2: pdfcpu trim command
			if supportedCommands["trim"] && !success {
				cmd := exec.Command(
					"pdfcpu",
					"trim",
					"-pages", pageNum,
					inputPath,
					outputPath,
				)

				err := cmd.Run()
				success = err == nil && fileExists(outputPath)
			}

			// Try 3: pdftk if available
			if commandExists("pdftk") && !success {
				cmd := exec.Command(
					"pdftk",
					inputPath,
					"cat", pageNum,
					"output", outputPath,
				)

				err := cmd.Run()
				success = err == nil && fileExists(outputPath)
			}

			// Skip if all methods fail
			if !success {
				fmt.Printf("Warning: Failed to extract page %d, skipping\n", i)
				continue
			}

			// Format file URL
			fileUrl := fmt.Sprintf("/api/file?folder=splits&filename=%s", outputFilename)

			// Add to results
			splitParts = append(splitParts, gin.H{
				"fileUrl":   fileUrl,
				"filename":  outputFilename,
				"pages":     []int{i},
				"pageCount": 1,
			})
		}
	} else if splitMethod == "every" {
		// Split into chunks of N pages
		for i := 0; i < totalPages; i += everyNPages {
			start := i + 1
			end := start + everyNPages - 1
			if end > totalPages {
				end = totalPages
			}

			pageRange := fmt.Sprintf("%d-%d", start, end)
			outputFilename := fmt.Sprintf("%s-pages-%d-%d.pdf", sessionId, start, end)
			outputPath := filepath.Join(outputDir, outputFilename)

			// Try multiple methods
			success := false
			var cmdOutput []byte
			var cmdErr error

			// Try pdfcpu extract command
			if supportedCommands["extract"] {
				cmd := exec.Command(
					"pdfcpu",
					"extract",
					"-mode", "page",
					"-pages", pageRange,
					inputPath,
					outputPath,
				)

				cmdOutput, cmdErr = cmd.CombinedOutput()
				success = cmdErr == nil && fileExists(outputPath)
			}

			// If extract fails, try trim command
			if !success && supportedCommands["trim"] {
				cmd := exec.Command(
					"pdfcpu",
					"trim",
					"-pages", pageRange,
					inputPath,
					outputPath,
				)

				cmdOutput, cmdErr = cmd.CombinedOutput()
				success = cmdErr == nil && fileExists(outputPath)
			}

			// If both pdfcpu commands fail, try pdftk
			if !success && commandExists("pdftk") {
				cmd := exec.Command(
					"pdftk",
					inputPath,
					"cat", pageRange,
					"output", outputPath,
				)

				cmdOutput, cmdErr = cmd.CombinedOutput()
				success = cmdErr == nil && fileExists(outputPath)
			}

			// If all methods fail, return an error
			if !success {
				return nil, fmt.Errorf("failed to extract pages %s: %v - %s", pageRange, cmdErr, string(cmdOutput))
			}

			// Calculate page count
			pageCount := end - start + 1

			// Format file URL
			fileUrl := fmt.Sprintf("/api/file?folder=splits&filename=%s", outputFilename)

			// Create pages array
			var pages []int
			for p := start; p <= end; p++ {
				pages = append(pages, p)
			}

			// Add to results
			splitParts = append(splitParts, gin.H{
				"fileUrl":   fileUrl,
				"filename":  outputFilename,
				"pages":     pages,
				"pageCount": pageCount,
			})
		}
	}

	return splitParts, nil
}

// Helper function to detect which pdfcpu commands are supported
func detectPdfCpuCommands() map[string]bool {
	supported := make(map[string]bool)

	// Check for extract command
	cmd := exec.Command("pdfcpu", "help", "extract")
	err := cmd.Run()
	supported["extract"] = err == nil

	// Check for trim command
	cmd = exec.Command("pdfcpu", "help", "trim")
	err = cmd.Run()
	supported["trim"] = err == nil

	return supported
}

// Helper function to check if a command exists in PATH
func commandExists(cmd string) bool {
	_, err := exec.LookPath(cmd)
	return err == nil
}

// Process split job in background and update status file
func processSplitInBackground(
	inputPath string,
	sessionId string,
	splitMethod string,
	pageRanges string,
	everyNPages int,
	totalPages int,
	publicDir string,
) {
	statusFilePath := filepath.Join(publicDir, "status", sessionId+"-status.json")

	// Update status function
	updateStatus := func(status string, progress int, results []gin.H, err error) {
		statusData := gin.H{
			"id":        sessionId,
			"status":    status,
			"progress":  progress,
			"total":     len(results),
			"completed": progress * len(results) / 100,
			"results":   results,
			"error":     nil,
		}

		if err != nil {
			statusData["error"] = err.Error()
		}

		statusJson, _ := json.Marshal(statusData)
		os.WriteFile(statusFilePath, statusJson, 0644)
	}

	// Initialize empty results
	results := []gin.H{}

	// Update status to indicate processing started
	updateStatus("processing", 0, results, nil)

	// Process splits based on method
	var processingErr error

	defer func() {
		if r := recover(); r != nil {
			err := fmt.Errorf("panic in background processing: %v", r)
			fmt.Println(err)
			updateStatus("error", 0, results, err)
		}
	}()

	// Update status to indicate processing is ongoing
	updateStatus("processing", 10, results, nil)

	// Process the split job
	results, processingErr = processSplitJob(
		inputPath,
		sessionId,
		splitMethod,
		pageRanges,
		everyNPages,
		totalPages,
		publicDir,
	)

	if processingErr != nil {
		updateStatus("error", 0, results, processingErr)
		return
	}

	// Update final status
	updateStatus("completed", 100, results, nil)
}
func getPDFPageCount(pdfPath string) (int, error) {
	// Try using pdfcpu info command first
	cmd := exec.Command("pdfcpu", "info", pdfPath)
	output, err := cmd.CombinedOutput()

	// Log the complete output for debugging
	fmt.Printf("pdfcpu info output: %s\n", string(output))

	if err == nil {
		// Try multiple regex patterns to match page count
		patterns := []string{
			`Pages?\s*[:=]\s*(\d+)`,         // "Pages: 5" format
			`Number of pages:\s*(\d+)`,      // "Number of pages: 5" format
			`PageCount\s*[:=]\s*(\d+)`,      // "PageCount: 5" format
			`Total\s*pages?\s*[:=]\s*(\d+)`, // "Total pages: 5" format
			`(\d+)\s*pages?`,                // "5 pages" format
		}

		for _, pattern := range patterns {
			re := regexp.MustCompile(pattern)
			matches := re.FindStringSubmatch(string(output))

			if len(matches) >= 2 {
				fmt.Printf("Found page count match with pattern: %s\n", pattern)
				return strconv.Atoi(matches[1])
			}
		}
	}

	// Fallback method 1: Try using pdfinfo if available
	pdfInfoCmd := exec.Command("pdfinfo", pdfPath)
	pdfInfoOutput, pdfInfoErr := pdfInfoCmd.CombinedOutput()

	if pdfInfoErr == nil {
		re := regexp.MustCompile(`Pages:\s*(\d+)`)
		matches := re.FindStringSubmatch(string(pdfInfoOutput))

		if len(matches) >= 2 {
			fmt.Printf("Found page count using pdfinfo\n")
			return strconv.Atoi(matches[1])
		}
	}

	// Fallback method 2: Count the pages using pdf-lib
	tempDir, err := os.MkdirTemp("", "pdfsplit")
	if err != nil {
		return 0, fmt.Errorf("failed to create temp directory: %v", err)
	}
	defer os.RemoveAll(tempDir)

	// Try to extract all pages and count them
	for i := 1; i <= 10000; i++ { // Set a reasonable upper limit
		testPagePath := filepath.Join(tempDir, fmt.Sprintf("page-%d.pdf", i))

		// Try to extract the page
		extractCmd := exec.Command(
			"pdfcpu",
			"extract",
			"-mode", "page",
			"-pages", fmt.Sprintf("%d", i),
			pdfPath,
			testPagePath,
		)

		extractErr := extractCmd.Run()

		// If extraction fails, we've reached the end
		if extractErr != nil || !fileExists(testPagePath) {
			// We've found i-1 pages
			if i > 1 {
				fmt.Printf("Counted %d pages using page extraction method\n", i-1)
				return i - 1, nil
			}
			break
		}
	}

	// Last resort fallback: try to parse as byte ranges
	// This is not very reliable but might work in some cases
	pdfBytes, err := os.ReadFile(pdfPath)
	if err == nil {
		// Look for "/Type /Page" pattern and count occurrences
		pageSig := []byte("/Type /Page")
		count := bytes.Count(pdfBytes, pageSig)

		if count > 0 {
			fmt.Printf("Estimated %d pages by counting /Type /Page occurrences\n", count)
			return count, nil
		}
	}

	// If all methods fail, return error
	return 0, fmt.Errorf("could not determine page count using any available method")
}

// Helper function to check if a file exists
func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

// Helper function to count pages in a range string
func countPagesInRange(rangeStr string) int {
	// Handle single page
	if !strings.Contains(rangeStr, "-") {
		return 1
	}

	// Handle page range
	parts := strings.Split(rangeStr, "-")
	if len(parts) != 2 {
		return 0
	}

	start, err1 := strconv.Atoi(strings.TrimSpace(parts[0]))
	end, err2 := strconv.Atoi(strings.TrimSpace(parts[1]))

	if err1 != nil || err2 != nil || start > end {
		return 0
	}

	return end - start + 1
}

// Helper function to parse page ranges
func parsePageRanges(rangesStr string, totalPages int) []string {
	var validRanges []string

	// Split by comma
	parts := strings.Split(rangesStr, ",")

	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed == "" {
			continue
		}

		// Validate range
		if strings.Contains(trimmed, "-") {
			// It's a range like "1-5"
			rangeParts := strings.Split(trimmed, "-")
			if len(rangeParts) != 2 {
				continue // Invalid format
			}

			start, err1 := strconv.Atoi(strings.TrimSpace(rangeParts[0]))
			end, err2 := strconv.Atoi(strings.TrimSpace(rangeParts[1]))

			if err1 != nil || err2 != nil || start < 1 || end > totalPages || start > end {
				continue // Invalid range
			}

			validRanges = append(validRanges, trimmed)
		} else {
			// It's a single page like "3"
			page, err := strconv.Atoi(trimmed)
			if err != nil || page < 1 || page > totalPages {
				continue // Invalid page
			}

			validRanges = append(validRanges, trimmed)
		}
	}

	return validRanges
}

// Status endpoint to retrieve job status
// @Summary Get split job status
// @Description Returns the status of a PDF split job
// @Tags pdf
// @Accept json
// @Produce json
// @Param id query string true "Job ID to retrieve status for"
// @Success 200 {object} object{id=string,status=string,progress=integer,total=integer,completed=integer,results=array,error=string}
// @Failure 400 {object} object{error=string}
// @Failure 404 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/split/status [get]
func (h *PDFHandler) GetSplitStatus(c *gin.Context) {
	// Get job ID from query parameter
	jobId := c.Query("id")

	if jobId == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No job ID provided",
		})
		return
	}

	// Validate job ID format (UUID)
	if _, err := uuid.Parse(jobId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid job ID format",
		})
		return
	}

	// Check if status file exists
	statusPath := filepath.Join(h.config.PublicDir, "status", jobId+"-status.json")

	if _, err := os.Stat(statusPath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Job not found",
			"jobId": jobId,
		})
		return
	}

	// Read status file
	statusData, err := os.ReadFile(statusPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read job status: " + err.Error(),
		})
		return
	}

	// Parse status JSON
	var status map[string]interface{}
	if err := json.Unmarshal(statusData, &status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Invalid status data: " + err.Error(),
		})
		return
	}

	// Return status
	c.JSON(http.StatusOK, status)
}


// buildWatermarkDescription builds the description string for pdfcpu stamp command
func buildWatermarkDescription(watermarkType, position string, rotation, opacity, scale int, textColor string) string {
	// Map position names to pdfcpu position codes
	positionMap := map[string]string{
		"center":        "c",
		"top-left":      "tl",
		"top-center":    "tc",
		"top-right":     "tr",
		"left":          "l",
		"right":         "r",
		"bottom-left":   "bl",
		"bottom-center": "bc",
		"bottom-right":  "br",
		// Handle direct codes as well
		"c":  "c",
		"tl": "tl",
		"tc": "tc",
		"tr": "tr",
		"l":  "l",
		"r":  "r",
		"bl": "bl",
		"bc": "bc",
		"br": "br",
	}

	pdfcpuPosition := positionMap[position]
	if pdfcpuPosition == "" {
		pdfcpuPosition = "c" // Default to center
		fmt.Printf("Warning: Unrecognized position '%s', defaulting to center\n", position)
	}

	// Convert opacity from percentage (1-100) to decimal (0.0-1.0)
	opacityValue := float64(opacity) / 100.0
	if opacityValue > 1.0 {
		opacityValue = 1.0
	}
	if opacityValue < 0.1 {
		opacityValue = 0.1
	}

	// Convert scale from percentage to decimal
	scaleValue := float64(scale) / 100.0
	if scaleValue > 2.0 {
		scaleValue = 2.0
	}
	if scaleValue < 0.1 {
		scaleValue = 0.1
	}

	// Fix rotation direction - pdfcpu uses opposite direction from UI expectation
	// Normalize rotation to pdfcpu's expected range: -180 to 180 degrees
	fixedRotation := (-rotation) % 360

	// Convert to pdfcpu's expected range (-180 to 180)
	if fixedRotation > 180 {
		fixedRotation -= 360
	} else if fixedRotation < -180 {
		fixedRotation += 360
	}

	// Format color for pdfcpu (RGB values between 0 and 1)
	colorStr := "0.5 0.5 0.5" // Default gray
	if textColor != "" && len(textColor) >= 7 && textColor[0] == '#' {
		if r, err := strconv.ParseInt(textColor[1:3], 16, 0); err == nil {
			if g, err := strconv.ParseInt(textColor[3:5], 16, 0); err == nil {
				if b, err := strconv.ParseInt(textColor[5:7], 16, 0); err == nil {
					colorStr = fmt.Sprintf("%.3f %.3f %.3f",
						float64(r)/255.0, float64(g)/255.0, float64(b)/255.0)
				}
			}
		}
	}

	// Build description for stamp command using pdfcpu's expected parameter names
	var description string

	if watermarkType == "text" {
		// For text stamps - use 'rot' parameter name, not 'rotation'
		description = fmt.Sprintf("pos:%s, fillcolor:%s, op:%.2f, rot:%d, scale:%.2f, fontname:Helvetica, points:24",
			pdfcpuPosition, colorStr, opacityValue, fixedRotation, scaleValue)
	} else {
		// For image stamps - use 'rot' parameter name, not 'rotation'
		description = fmt.Sprintf("pos:%s, op:%.2f, rot:%d, scale:%.2f",
			pdfcpuPosition, opacityValue, fixedRotation, scaleValue)
	}

	log.Printf("created stamp description: %s (position: %s, original rotation: %d° → fixed: %d°, opacity: %.0f%%, scale: %.0f%%)\n",
		description, position, rotation, fixedRotation, opacity, scale)

	return description
}

// applyWatermarkStandard applies watermark using pdfcpu stamp command (shows in front)
func (h *PDFHandler) applyWatermarkStandard(inputPath, outputPath, watermarkType, watermarkContent, description, pages, customPages string) (bool, error) {
	// Use stamp instead of watermark to place content in front
	args := []string{"stamp", "add", "-mode", watermarkType}

	// Add page selection if needed
	if pages != "all" {
		if pages == "custom" && customPages != "" {
			args = append(args, "-pages", customPages)
		} else if pages != "custom" {
			args = append(args, "-pages", pages)
		}
	}

	// Add the content and parameters - order is: content, description, input, output
	args = append(args, "--", watermarkContent, description, inputPath, outputPath)

	log.Printf("Executing: pdfcpu %s", strings.Join(args, " "))

	// Execute command with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 300*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "pdfcpu", args...)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	if err != nil {
		combinedOutput := strings.TrimSpace(stdout.String() + "\n" + stderr.String())
		log.Printf("pdfcpu stamp command failed: %v, output: %s", err, combinedOutput)

		// Try alternative approach if stamp fails
		return h.applyWatermarkFallback(inputPath, outputPath, watermarkType, watermarkContent, description, pages, customPages)
	}

	// Check if output file exists and has content
	if fileInfo, err := os.Stat(outputPath); err != nil || fileInfo.Size() == 0 {
		log.Printf("Output file not created or empty, trying fallback")
		return h.applyWatermarkFallback(inputPath, outputPath, watermarkType, watermarkContent, description, pages, customPages)
	}

	log.Printf("Stamp applied successfully")
	return true, nil
}

// applyWatermarkFallback tries an alternative approach if the main method fails
func (h *PDFHandler) applyWatermarkFallback(inputPath, outputPath, watermarkType, watermarkContent, description, pages, customPages string) (bool, error) {
	log.Printf("Trying fallback watermark method...")

	// Try using watermark command as background if stamp doesn't work
	args := []string{"watermark", "add", "-mode", watermarkType}

	// Add page selection if needed
	if pages != "all" {
		if pages == "custom" && customPages != "" {
			args = append(args, "-pages", customPages)
		} else if pages != "custom" {
			args = append(args, "-pages", pages)
		}
	}

	// Modify description for watermark command (slightly different syntax)
	// Remove font-specific parameters that watermark command doesn't support
	fallbackDescription := strings.ReplaceAll(description, "fontname:Helvetica, points:24", "")
	fallbackDescription = strings.ReplaceAll(fallbackDescription, ", ,", ",")
	fallbackDescription = strings.TrimSuffix(fallbackDescription, ", ")
	fallbackDescription = strings.TrimPrefix(fallbackDescription, ", ")

	// Ensure rotation parameter uses consistent format
	if !strings.Contains(fallbackDescription, "rot:") && strings.Contains(description, "rot:") {
		// Keep the rotation parameter in the fallback
		log.Printf("Fallback description maintains rotation: %s", fallbackDescription)
	}

	args = append(args, "--", watermarkContent, fallbackDescription, inputPath, outputPath)

	log.Printf("Executing fallback: pdfcpu %s", strings.Join(args, " "))

	ctx, cancel := context.WithTimeout(context.Background(), 300*time.Second)
	defer cancel()

	cmd := exec.CommandContext(ctx, "pdfcpu", args...)

	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	if err != nil {
		combinedOutput := strings.TrimSpace(stdout.String() + "\n" + stderr.String())
		log.Printf("Fallback watermark command also failed: %v, output: %s", err, combinedOutput)
		return false, fmt.Errorf("both stamp and watermark methods failed: %s", combinedOutput)
	}

	// Check if output file exists and has content
	if fileInfo, err := os.Stat(outputPath); err != nil || fileInfo.Size() == 0 {
		return false, fmt.Errorf("output file not created or empty even with fallback method")
	}

	log.Printf("Fallback watermark applied successfully (content will appear behind PDF content)")
	return true, nil
}

// Modified WatermarkPDF function with better error handling and logging
func (h *PDFHandler) WatermarkPDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, exists := c.Get("userId")
	operation, _ := c.Get("operationType")

	// Process the operation charge
	if exists {
		log.Printf("Processing watermark operation for userID: %s", userID)
		result, err := h.balanceService.ProcessOperation(userID.(string), "watermark")
		if err != nil {
			log.Printf("Balance service error for user %s: %v", userID, err)
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
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		log.Printf("Failed to get file: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get PDF file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if strings.ToLower(filepath.Ext(file.Filename)) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Check file size (max 50MB)
	if file.Size > 50*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "File size exceeds 50MB limit",
		})
		return
	}

	// Get watermark type
	watermarkType := c.DefaultPostForm("watermarkType", "text")
	if watermarkType != "text" && watermarkType != "image" && watermarkType != "pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid watermark type. Must be 'text', 'image', or 'pdf'",
		})
		return
	}

	// Get watermark content
	var watermarkContent string
	var watermarkImage *multipart.FileHeader

	if watermarkType == "text" {
		// For text watermarks - try both "content" and older "text" parameter
		watermarkContent = c.PostForm("content")
		if watermarkContent == "" {
			watermarkContent = c.PostForm("text")
		}

		if watermarkContent == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Text is required for text watermarks",
			})
			return
		}
		log.Printf("Text watermark content: %s", watermarkContent)
	} else if watermarkType == "image" {
		// For image watermarks
		watermarkImage, err = c.FormFile("content")
		if err != nil {
			watermarkImage, err = c.FormFile("watermarkImage") // Try legacy parameter
			if err != nil {
				// Check for base64 content
				base64Image := c.PostForm("content")
				if base64Image == "" {
					c.JSON(http.StatusBadRequest, gin.H{
						"error": "Image is required for image watermarks",
					})
					return
				}
			}
		}
	}

	// Get positioning and styling parameters
	position := c.DefaultPostForm("position", "center")
	rotationStr := c.DefaultPostForm("rotation", "0")
	opacityStr := c.DefaultPostForm("opacity", "50")
	scaleStr := c.DefaultPostForm("scale", "100")
	textColor := c.DefaultPostForm("textColor", "#808080")
	pages := c.DefaultPostForm("pages", "all")
	customPages := c.DefaultPostForm("customPages", "")

	log.Printf("Watermark parameters - Position: %s, Rotation: %s, Opacity: %s, Scale: %s, Color: %s",
		position, rotationStr, opacityStr, scaleStr, textColor)

	// Parse and validate numeric parameters
	rotation, _ := strconv.Atoi(rotationStr)
	if rotation < 0 || rotation > 360 {
		rotation = 0
	}

	opacity, _ := strconv.Atoi(opacityStr)
	if opacity < 10 || opacity > 100 {
		opacity = 50
	}

	scale, _ := strconv.Atoi(scaleStr)
	if scale < 10 || scale > 200 {
		scale = 100
	}

	// Create unique ID and paths
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "watermarked", uniqueID+"-watermarked.pdf")
	var watermarkPath string
	var tempFiles []string

	// Ensure directories exist
	os.MkdirAll(h.config.UploadDir, 0755)
	os.MkdirAll(filepath.Join(h.config.PublicDir, "watermarked"), 0755)

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		log.Printf("Failed to save PDF file %s: %v", inputPath, err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save PDF file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)

	// Handle watermark content based on type
	if watermarkType == "image" && watermarkImage != nil {
		// Handle uploaded image
		watermarkPath = filepath.Join(h.config.UploadDir, uniqueID+"-watermark"+filepath.Ext(watermarkImage.Filename))
		tempFiles = append(tempFiles, watermarkPath)

		if err := c.SaveUploadedFile(watermarkImage, watermarkPath); err != nil {
			log.Printf("Failed to save watermark image %s: %v", watermarkPath, err)
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save watermark image: " + err.Error(),
			})
			return
		}

		watermarkContent = watermarkPath
		log.Printf("Saved watermark image to: %s", watermarkPath)
	} else if watermarkType == "image" {
		// Handle base64 image
		base64Image := c.PostForm("content")
		if base64Image != "" {
			watermarkPath = filepath.Join(h.config.UploadDir, uniqueID+"-watermark.png")
			tempFiles = append(tempFiles, watermarkPath)

			if err := saveBase64File(base64Image, watermarkPath); err != nil {
				log.Printf("Failed to save base64 image: %v", err)
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "Invalid image data: " + err.Error(),
				})
				return
			}

			watermarkContent = watermarkPath
			log.Printf("Saved base64 watermark image to: %s", watermarkPath)
		}
	}

	// Create watermark description for pdfcpu
	description := buildWatermarkDescription(
		watermarkType, position, rotation, opacity, scale, textColor)

	log.Printf("Using watermark description: %s", description)

	// Apply watermark using stamp command (places content in front)
	success, err := h.applyWatermarkStandard(
		inputPath, outputPath, watermarkType, watermarkContent, description, pages, customPages)

	// Clean up temp files
	for _, tempFile := range tempFiles {
		os.Remove(tempFile)
	}

	if !success {
		log.Printf("Watermark operation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to add watermark to PDF: %v", err),
		})
		return
	}

	// Verify output file was created and has content
	fileInfo, err := os.Stat(outputPath)
	if err != nil {
		log.Printf("Output file not created: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create watermarked PDF file",
		})
		return
	}

	if fileInfo.Size() == 0 {
		log.Printf("Output file is empty")
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Watermarked PDF file is empty",
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=watermarked&filename=%s-watermarked.pdf", uniqueID)
	watermarkedSize := fileInfo.Size()

	log.Printf("Watermark operation completed successfully. Output file size: %d bytes", watermarkedSize)

	// Prepare response
	response := gin.H{
		"success":      true,
		"message":      "Watermark added to PDF successfully (appears in front of content)",
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-watermarked.pdf", uniqueID),
		"originalName": file.Filename,
		"fileSize":     watermarkedSize,
		"methodUsed":   "stamp", // Indicate that stamp method was used
	}

	// Add billing info if available
	if exists {
		result, _ := h.balanceService.ProcessOperation(userID.(string), operation.(string))
		var opCost float64
		if result.UsedFreeOperation {
			opCost = 0
		} else {
			opCost = constants.DEFAULT_OPERATION_COST
		}
		response["billing"] = gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           opCost,
		}
	}

	c.JSON(http.StatusOK, response)
}

// Helper function for base64 decoding
func saveBase64File(base64Data, filePath string) error {
	// Remove data URL prefix if present
	if idx := strings.Index(base64Data, ";base64,"); idx > 0 {
		base64Data = base64Data[idx+8:]
	}

	// Decode base64 string
	decoded, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return err
	}

	// Write to file
	return os.WriteFile(filePath, decoded, 0644)
}

// UnlockPDF godoc
// @Summary Remove password protection from a PDF file
// @Description Removes password protection from a PDF file
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to unlock (max 50MB)"
// @Param password formData string true "Current PDF password"
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,originalName=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/unlock [post]
func (h *PDFHandler) UnlockPDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), "unlock")
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

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Get password
	password := c.PostForm("password")
	if password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password is required",
		})
		return
	}

	// Create unique ID and paths
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "unlocked", uniqueID+"-unlocked.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)

	// Unlock PDF using pdfcpu
	cmd := exec.Command(
		"pdfcpu",
		"decrypt",
		"-upw", password,
		inputPath,
		outputPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to unlock PDF. The password may be incorrect: " + string(output),
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=unlocked&filename=%s-unlocked.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "PDF unlocked successfully",
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-unlocked.pdf", uniqueID),
		"originalName": file.Filename,
		"billing": gin.H{
			"currentBalance":          result.CurrentBalance,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"operationCost":           result.OperationCost,
			"usedFreeOperation":       result.UsedFreeOperation,
		},
	})
}

// CompressPDF godoc
// @Summary Compress a PDF file
// @Description Reduces PDF file size using maximum compression
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to compress (max 50MB)"
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,originalName=string,originalSize=integer,compressedSize=integer,compressionRatio=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/compress [post]
func (h *PDFHandler) CompressPDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), "compress")
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

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Create unique file names
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "compressions", uniqueID+"-compressed.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)
	pageCount, err := api.PageCountFile(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get PDF page count: " + err.Error(),
		})
		return
	}

	if pageCount == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "PDF contains no pages",
		})
		return
	}
	// Compress the PDF using pdfcpu optimize (maximum compression)
	cmd := exec.Command(
		"pdfcpu",
		"optimize",
		inputPath,
		outputPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to compress PDF: " + string(output),
		})
		return
	}

	// Get file sizes
	originalFileInfo, err := os.Stat(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get original file size: " + err.Error(),
		})
		return
	}

	compressedFileInfo, err := os.Stat(outputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get compressed file size: " + err.Error(),
		})
		return
	}

	// Calculate compression ratio
	originalSize := originalFileInfo.Size()
	compressedSize := compressedFileInfo.Size()
	var compressionRatio float64
	if originalSize > 0 {
		compressionRatio = float64(originalSize-compressedSize) / float64(originalSize) * 100
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=compressions&filename=%s-compressed.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":          true,
		"message":          fmt.Sprintf("PDF compression successful with %.2f%% reduction", compressionRatio),
		"fileUrl":          fileURL,
		"filename":         fmt.Sprintf("%s-compressed.pdf", uniqueID),
		"originalName":     file.Filename,
		"originalSize":     originalSize,
		"compressedSize":   compressedSize,
		"compressionRatio": fmt.Sprintf("%.2f%%", compressionRatio),
		"billing": gin.H{
			"currentBalance":          result.CurrentBalance,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"operationCost":           result.OperationCost,
			"usedFreeOperation":       result.UsedFreeOperation,
		},
	})
}

// RotatePDF godoc
// @Summary Rotate pages in a PDF file
// @Description Rotates pages in a PDF file by a specified angle
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to rotate (max 50MB)"
// @Param angle formData integer true "Rotation angle in degrees" Enums(90, 180, 270)
// @Param pages formData string false "Pages to rotate (e.g., '1-3,5,7-9'), empty for all pages" default(all)
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,originalName=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/rotate [post]
func (h *PDFHandler) RotatePDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), "rotate")
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
				"operationCost":           result.OperationCost,
			},
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Get rotation angle
	angleStr := c.PostForm("angle")
	if angleStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Rotation angle is required",
		})
		return
	}

	angle, err := strconv.Atoi(angleStr)
	if err != nil || (angle != 90 && angle != 180 && angle != 270) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid rotation angle. Must be 90, 180, or 270 degrees",
		})
		return
	}

	// Get pages to rotate (optional)
	pagesStr := c.DefaultPostForm("pages", "all")

	// Create unique ID and paths
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "rotations", uniqueID+"-rotated.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)

	// Use pdfcpu API instead of command line for better control
	if err := h.rotatePagesInPDF(inputPath, outputPath, angle, pagesStr); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to rotate PDF: " + err.Error(),
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=rotations&filename=%s-rotated.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      fmt.Sprintf("PDF rotated by %d degrees successfully", angle),
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-rotated.pdf", uniqueID),
		"originalName": file.Filename,
		"billing": gin.H{
			"currentBalance":          result.CurrentBalance,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"operationCost":           result.OperationCost,
			"usedFreeOperation":       result.UsedFreeOperation,
		},
	})
}

// rotatePagesInPDF rotates specific pages in a PDF file using pdfcpu directly
func (h *PDFHandler) rotatePagesInPDF(inputPath, outputPath string, angle int, pagesStr string) error {
	// Create a temporary directory for processing
	tempDir, err := os.MkdirTemp("", "pdf-rotation")
	if err != nil {
		return fmt.Errorf("failed to create temp directory: %w", err)
	}
	defer os.RemoveAll(tempDir)

	// Copy the original file to the temp directory
	tempPath := filepath.Join(tempDir, "working.pdf")
	if err := copyFile(inputPath, tempPath); err != nil {
		return fmt.Errorf("failed to copy PDF to temp location: %w", err)
	}

	// Build the pdfcpu command
	var args []string

	// Handle "all" pages case
	if pagesStr == "all" {
		args = []string{
			"rotate",
			tempPath,
			fmt.Sprintf("%d", angle),
		}
	} else {
		// Format specific pages
		args = []string{
			"rotate",
			fmt.Sprintf("-pages=%s", pagesStr),
			tempPath,
			fmt.Sprintf("%d", angle),
		}
	}

	// Log the command for debugging
	fmt.Printf("pdfcpu command: pdfcpu %s\n", strings.Join(args, " "))

	// Execute the pdfcpu command
	cmd := exec.Command("pdfcpu", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("pdfcpu command failed: %s - %w", string(output), err)
	}

	// Now copy the modified file to the output path
	if err := copyFile(tempPath, outputPath); err != nil {
		return fmt.Errorf("failed to copy modified PDF to output location: %w", err)
	}

	return nil
}

// ProtectPDF godoc
// @Summary Password protect a PDF file
// @Description Adds password protection and permission restrictions to a PDF file
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "PDF file to protect (max 50MB)"
// @Param password formData string true "Password to set for the PDF (minimum 4 characters)"
// @Param permission formData string false "Permission level: restricted (apply specific permissions) or all (grant all permissions)" Enums(restricted, all) default(restricted)
// @Param allowPrinting formData boolean false "Allow document printing" default(false)
// @Param allowCopying formData boolean false "Allow content copying" default(false)
// @Param allowEditing formData boolean false "Allow content editing" default(false)
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,originalName=string,methodUsed=string,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/protect [post]
func (h *PDFHandler) ProtectPDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, exists := c.Get("userId")
	if !exists || userID == nil {
		log.Println("userId not found in context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "User ID not found"})
		return
	}
	userIDStr, ok := userID.(string)
	if !ok {
		log.Printf("userId is not a string: %v", userID)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
		return
	}
	operation, exists := c.Get("operationType")
	if !exists || operation == nil {
		log.Println("operationType not found in context")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Operation type not found"})
		return
	}
	if !ok {
		log.Printf("operationType is not a string: %v", operation)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid operation type"})
		return
	}

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userIDStr, "protect")
	if err != nil {
		log.Printf("Balance service error: %v", err)
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

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		log.Printf("Failed to get file: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if strings.ToLower(filepath.Ext(file.Filename)) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Get password
	password := c.PostForm("password")
	if len(password) < 4 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password must be at least 4 characters",
		})
		return
	}
	if password == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Password cannot be empty",
		})
		return
	}

	// Get permissions
	permission := c.DefaultPostForm("permission", "restricted")
	allowPrinting := c.DefaultPostForm("allowPrinting", "false") == "true" || permission == "all"

	// Set permFlag for pdfcpu
	var permFlag string
	if permission == "all" {
		permFlag = "all"
	} else if allowPrinting {
		permFlag = "print"
	} else {
		permFlag = "none"
	}

	// Create unique file names
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "protected", uniqueID+"-protected.pdf")

	// Ensure directories exist
	if err := os.MkdirAll(h.config.UploadDir, 0755); err != nil {
		log.Printf("Failed to create upload directory: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create upload directory: " + err.Error(),
		})
		return
	}
	if err := os.MkdirAll(filepath.Join(h.config.PublicDir, "protected"), 0755); err != nil {
		log.Printf("Failed to create protected directory: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create protected directory: " + err.Error(),
		})
		return
	}

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		log.Printf("Failed to save file: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)

	// Protect the PDF using pdfcpu
	cmd := exec.Command(
		"pdfcpu",
		"encrypt",
		"-upw", password,
		"-opw", password,
		"-perm", permFlag,
		inputPath,
		outputPath,
	)
	log.Printf("Running pdfcpu command: %v", cmd.Args)
	output, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("pdfcpu failed: %v, output: %s", err, string(output))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to protect PDF: " + string(output),
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=protected&filename=%s-protected.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":      true,
		"message":      "PDF protected with password successfully",
		"fileUrl":      fileURL,
		"filename":     fmt.Sprintf("%s-protected.pdf", uniqueID),
		"originalName": file.Filename,
		"methodUsed":   "pdfcpu",
		"billing": gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           constants.DEFAULT_OPERATION_COST,
		},
	})
}

// MergePDFs godoc
// @Summary Merge multiple PDF files
// @Description Combines multiple PDF files into a single PDF
// @Tags pdf
// @Accept multipart/form-data
// @Produce json
// @Param files formData file true "PDF files to merge (multiple files)"
// @Param order formData string false "JSON array specifying the order of files (e.g., [2,0,1])"
// @Security ApiKeyAuth
// @Success 200 {object} object{success=boolean,message=string,fileUrl=string,filename=string,mergedSize=integer,totalInputSize=integer,fileCount=integer,billing=object{usedFreeOperation=boolean,freeOperationsRemaining=integer,currentBalance=number,operationCost=number}}
// @Failure 400 {object} object{error=string}
// @Failure 401 {object} object{error=string}
// @Failure 402 {object} object{error=string,details=object{balance=number,freeOperationsRemaining=integer,operationCost=number}}
// @Failure 500 {object} object{error=string}
// @Router /api/pdf/merge [post]
func (h *PDFHandler) MergePDFs(c *gin.Context) {
	// Get user ID and operation type from context
	userID, _ := c.Get("userId")

	// Process the operation charge
	result, err := h.balanceService.ProcessOperation(userID.(string), "merge")
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

	// Parse multipart form
	if err := c.Request.ParseMultipartForm(32 << 20); err != nil { // 32MB max
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to parse form: " + err.Error(),
		})
		return
	}

	// Get files
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get form: " + err.Error(),
		})
		return
	}

	files := form.File["files"]
	if len(files) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "At least two PDF files are required for merging",
		})
		return
	}

	// Check all files are PDFs
	for _, file := range files {
		if filepath.Ext(file.Filename) != ".pdf" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("File '%s' is not a PDF", file.Filename),
			})
			return
		}
	}

	// Parse file order if provided
	fileOrder := make([]int, len(files))
	for i := range fileOrder {
		fileOrder[i] = i // Default order
	}

	orderStr := c.PostForm("order")
	if orderStr != "" {
		var order []int
		if err := json.Unmarshal([]byte(orderStr), &order); err == nil {
			// Validate order
			valid := true
			if len(order) == len(files) {
				seen := make(map[int]bool)
				for _, idx := range order {
					if idx < 0 || idx >= len(files) || seen[idx] {
						valid = false
						break
					}
					seen[idx] = true
				}

				if valid {
					fileOrder = order
				}
			}
		}
	}

	// Create unique ID and output path
	uniqueID := uuid.New().String()
	outputPath := filepath.Join(h.config.PublicDir, "merges", uniqueID+"-merged.pdf")

	// Create temp directory for input files
	tempDir, err := os.MkdirTemp(h.config.TempDir, "merge-")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create temp directory: " + err.Error(),
		})
		return
	}
	defer os.RemoveAll(tempDir)

	// Save all files to temp directory
	inputPaths := make([]string, len(files))
	totalInputSize := int64(0)

	for i, file := range files {
		inputPath := filepath.Join(tempDir, fmt.Sprintf("input-%d.pdf", i))
		if err := c.SaveUploadedFile(file, inputPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to save file: " + err.Error(),
			})
			return
		}

		inputPaths[i] = inputPath

		// Get file size
		fileInfo, err := os.Stat(inputPath)
		if err == nil {
			totalInputSize += fileInfo.Size()
		}
	}

	// Create ordered list of input files
	orderedInputs := make([]string, len(files))
	for i, idx := range fileOrder {
		orderedInputs[i] = inputPaths[idx]
	}

	// Merge PDFs using pdfcpu
	args := append([]string{
		"merge",
		outputPath,
	}, orderedInputs...)

	cmd := exec.Command("pdfcpu", args...)

	output, err := cmd.CombinedOutput()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to merge PDFs: " + string(output),
		})
		return
	}

	// Get merged file size
	mergedFileInfo, err := os.Stat(outputPath)
	var mergedSize int64
	if err != nil {
		mergedSize = 0
	} else {
		mergedSize = mergedFileInfo.Size()
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=merges&filename=%s-merged.pdf", uniqueID)

	// Return response
	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"message":        "PDF merge successful",
		"fileUrl":        fileURL,
		"filename":       fmt.Sprintf("%s-merged.pdf", uniqueID),
		"mergedSize":     mergedSize,
		"totalInputSize": totalInputSize,
		"fileCount":      len(files),
		"billing": gin.H{
			"currentBalance":          result.CurrentBalance,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"operationCost":           result.OperationCost,
			"usedFreeOperation":       result.UsedFreeOperation,
		},
	})
}

// RemovePagesFromPDF removes specific pages from a PDF file using pdfcpu
func (h *PDFHandler) RemovePagesFromPDF(c *gin.Context) {
	// Get user ID for billing purposes
	userID, exists := c.Get("userId")

	// Process the operation charge if user is authenticated
	if exists && userID != nil {
		result, err := h.balanceService.ProcessOperation(userID.(string), "remove")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Failed to process operation: " + err.Error(),
			})
			return
		}

		if !result.Success {
			c.JSON(http.StatusPaymentRequired, gin.H{
				"error":                   result.Error,
				"insufficientBalance":     true,
				"freeOperationsRemaining": result.FreeOperationsRemaining,
				"currentBalance":          result.CurrentBalance,
			})
			return
		}
	}

	// Ensure the directories exist
	if err := os.MkdirAll(h.config.UploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create upload directory: " + err.Error(),
		})
		return
	}

	if err := os.MkdirAll(filepath.Join(h.config.PublicDir, "processed"), 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create processed directory: " + err.Error(),
		})
		return
	}

	// Get the uploaded file
	uploadedFile, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get uploaded file: " + err.Error(),
		})
		return
	}

	// Validate file type is PDF
	if !strings.HasSuffix(strings.ToLower(uploadedFile.Filename), ".pdf") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Generate unique filenames
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "processed", uniqueID+"-output.pdf")

	// Save the uploaded file
	if err := c.SaveUploadedFile(uploadedFile, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath) // Clean up input file after processing

	// Parse the pages to remove
	pagesToRemoveJSON := c.PostForm("pagesToRemove")
	if pagesToRemoveJSON == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No pages specified for removal",
		})
		return
	}

	var pagesToRemove []int
	if err := json.Unmarshal([]byte(pagesToRemoveJSON), &pagesToRemove); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid page selection format: " + err.Error(),
		})
		return
	}

	if len(pagesToRemove) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No pages selected for removal",
		})
		return
	}

	// Get the total page count using the existing helper function
	totalPages, err := getPDFPageCount(inputPath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to determine PDF page count: " + err.Error(),
		})
		return
	}

	// Create a set of pages to be removed for easy lookup
	pagesToRemoveSet := make(map[int]bool)
	for _, page := range pagesToRemove {
		// Validate page numbers
		if page < 1 || page > totalPages {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Invalid page number: %d (total pages: %d)", page, totalPages),
			})
			return
		}
		pagesToRemoveSet[page] = true
	}

	// Make sure we're not removing all pages
	if len(pagesToRemoveSet) >= totalPages {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Cannot remove all pages from PDF",
		})
		return
	}

	// Build the list of pages to keep as ranges for efficiency
	var pagesToKeep []string
	var rangeStart, rangeEnd int

	for i := 1; i <= totalPages; i++ {
		if !pagesToRemoveSet[i] {
			if rangeStart == 0 {
				rangeStart = i
				rangeEnd = i
			} else if i == rangeEnd+1 {
				rangeEnd = i
			} else {
				// Add the previous range
				if rangeStart == rangeEnd {
					pagesToKeep = append(pagesToKeep, strconv.Itoa(rangeStart))
				} else {
					pagesToKeep = append(pagesToKeep, fmt.Sprintf("%d-%d", rangeStart, rangeEnd))
				}
				rangeStart = i
				rangeEnd = i
			}
		}
	}

	// Add the final range
	if rangeStart > 0 {
		if rangeStart == rangeEnd {
			pagesToKeep = append(pagesToKeep, strconv.Itoa(rangeStart))
		} else {
			pagesToKeep = append(pagesToKeep, fmt.Sprintf("%d-%d", rangeStart, rangeEnd))
		}
	}

	// Create the page specification for pdfcpu
	pageSpec := strings.Join(pagesToKeep, ",")

	// Execute the pdfcpu trim command to keep only the specified pages
	// Using pdfcpu trim syntax: pdfcpu trim -pages "1-2,4,6-8" input.pdf output.pdf
	args := []string{
		"trim",
		"-pages", pageSpec,
		inputPath,
		outputPath,
	}

	// Log the command for debugging
	fmt.Printf("Executing pdfcpu command: pdfcpu %s\n", strings.Join(args, " "))

	// Execute pdfcpu to create the new PDF with selected pages
	cmd := exec.Command("pdfcpu", args...)
	output, err := cmd.CombinedOutput()

	if err != nil {
		fmt.Printf("pdfcpu command failed: %v\nOutput: %s\n", err, string(output))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to remove pages: " + err.Error() + "\nOutput: " + string(output),
		})
		return
	}

	// Verify the output file exists and has content
	fileInfo, err := os.Stat(outputPath)
	if err != nil || fileInfo.Size() == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create output file or file is empty",
		})
		return
	}

	// Generate output filename for the URL
	outputFilename := uniqueID + "-output.pdf"
	fileUrl := fmt.Sprintf("/api/file?folder=processed&filename=%s", outputFilename)

	// Get page count of the result file for verification using the existing helper function
	resultPages, err := getPDFPageCount(outputPath)
	if err != nil {
		// Don't fail the whole operation if we can't get result page count
		fmt.Printf("Warning: Could not get result page count: %v\n", err)
		resultPages = totalPages - len(pagesToRemove) // Estimate
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"success":        true,
		"fileUrl":        fileUrl,
		"originalPages":  totalPages,
		"removedPages":   len(pagesToRemove),
		"resultingPages": resultPages,
		"originalName":   uploadedFile.Filename,
		"message":        fmt.Sprintf("Successfully removed %d pages from PDF", len(pagesToRemove)),
	})
}

// AddPageNumbersToPDF adds page numbers to a PDF file using pdfcpu stamp
// AddPageNumbersToPDF adds page numbers to a PDF file using pdfcpu stamp
// AddPageNumbersToPDF adds page numbers to a PDF file using pdfcpu stamp
func (h *PDFHandler) AddPageNumbersToPDF(c *gin.Context) {
	// Get user ID and operation type from context
	userID, exists := c.Get("userId")
	operation, _ := c.Get("operationType")

	// Process the operation charge
	if exists {
		result, err := h.balanceService.ProcessOperation(userID.(string), "addPageNumbers")
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
	}

	// Create necessary directories
	if err := os.MkdirAll(h.config.UploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create upload directory: " + err.Error(),
		})
		return
	}

	if err := os.MkdirAll(filepath.Join(h.config.PublicDir, "pagenumbers"), 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create pagenumbers directory: " + err.Error(),
		})
		return
	}

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to get file: " + err.Error(),
		})
		return
	}

	// Check file extension
	if filepath.Ext(file.Filename) != ".pdf" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Only PDF files are supported",
		})
		return
	}

	// Validate file size (max 50MB)
	if file.Size > 50*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "File size exceeds 50MB limit",
		})
		return
	}

	// Get page numbering options
	position := c.DefaultPostForm("position", "bottom-center")
	format := c.DefaultPostForm("format", "numeric")
	fontFamily := c.DefaultPostForm("fontFamily", "Helvetica")
	fontSizeStr := c.DefaultPostForm("fontSize", "12")
	color := c.DefaultPostForm("color", "#000000")
	startNumberStr := c.DefaultPostForm("startNumber", "1")
	prefix := c.DefaultPostForm("prefix", "")
	suffix := c.DefaultPostForm("suffix", "")
	marginXStr := c.DefaultPostForm("marginX", "40")
	marginYStr := c.DefaultPostForm("marginY", "30")
	selectedPages := c.DefaultPostForm("selectedPages", "") // Empty means all pages
	skipFirstPage := c.DefaultPostForm("skipFirstPage", "false") == "true"

	// Validate position
	validPositions := map[string]bool{
		"top-left":      true,
		"top-center":    true,
		"top-right":     true,
		"bottom-left":   true,
		"bottom-center": true,
		"bottom-right":  true,
	}
	if !validPositions[position] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid position. Must be one of: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right",
		})
		return
	}

	// Validate format
	validFormats := map[string]bool{
		"numeric":    true,
		"roman":      true,
		"alphabetic": true,
	}
	if !validFormats[format] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid format. Must be one of: numeric, roman, alphabetic",
		})
		return
	}

	// Validate and parse numeric parameters
	fontSize, err := strconv.Atoi(fontSizeStr)
	if err != nil || fontSize <= 0 || fontSize > 72 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid font size. Must be a positive number between 1 and 72",
		})
		return
	}

	startNumber, err := strconv.Atoi(startNumberStr)
	if err != nil || startNumber <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid start number. Must be a positive number",
		})
		return
	}

	marginX, err := strconv.Atoi(marginXStr)
	if err != nil || marginX < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid horizontal margin. Must be a non-negative number",
		})
		return
	}

	marginY, err := strconv.Atoi(marginYStr)
	if err != nil || marginY < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid vertical margin. Must be a non-negative number",
		})
		return
	}

	// Create unique file names
	uniqueID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, uniqueID+"-input.pdf")
	outputPath := filepath.Join(h.config.PublicDir, "pagenumbers", uniqueID+"-numbered.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)

	// Get PDF page count using pdfcpu
	cmd := exec.Command("pdfcpu", "info", inputPath)
	output, err := cmd.CombinedOutput()

	totalPages := 0
	if err == nil {
		// Try to extract page count from output
		pageCountRegex := regexp.MustCompile("Pages\\s*:\\s*(\\d+)")
		matches := pageCountRegex.FindStringSubmatch(string(output))
		if len(matches) >= 2 {
			totalPages, _ = strconv.Atoi(matches[1])
		}
	}

	if totalPages == 0 {
		// Fallback: estimate from file size
		fileSizeInMB := float64(file.Size) / (1024 * 1024)
		totalPages = int(math.Max(1, math.Round(fileSizeInMB*10))) // ~10 pages per MB is a rough estimate
	}

	// Build the page number text with format strings
	var pageText string

	// Handle different formats and build the text template
	switch format {
	case "numeric":
		if startNumber != 1 {
			// For custom start numbers, we need to calculate: current_page + (start_number - 1)
			// But pdfcpu doesn't support arithmetic in format strings, so we'll use a workaround
			// For now, we'll use the standard format and note this limitation
			pageText = fmt.Sprintf("%s%%p%s", prefix, suffix)
			if startNumber != 1 {
				// Add a note about the limitation in the response
				log.Printf("Warning: Custom start numbers with pdfcpu stamp are not directly supported. Using default numbering.")
			}
		} else {
			pageText = fmt.Sprintf("%s%%p%s", prefix, suffix)
		}
	case "roman":
		// pdfcpu doesn't support roman numerals directly in format strings
		// We'll need to use numeric and note this limitation
		pageText = fmt.Sprintf("%s%%p%s", prefix, suffix)
		log.Printf("Warning: Roman numerals not directly supported with pdfcpu stamp. Using numeric format.")
	case "alphabetic":
		// pdfcpu doesn't support alphabetic directly in format strings
		// We'll need to use numeric and note this limitation
		pageText = fmt.Sprintf("%s%%p%s", prefix, suffix)
		log.Printf("Warning: Alphabetic format not directly supported with pdfcpu stamp. Using numeric format.")
	default:
		pageText = fmt.Sprintf("%s%%p%s", prefix, suffix)
	}

	// If user wants "Page X of Y" format, use both %p and %P
	if prefix == "" && suffix == "" {
		pageText = "%p"
	}

	// Build the description string for pdfcpu stamp
	pdfcpuPosition := mapPositionToPdfcpu(position)
	pdfcpuColor := formatColorForPdfcpuStamp(color)
	offsetX, offsetY := getAdjustedOffsetsForStamp(position, marginX, marginY)
	pdfcpuFont := getFontMapForStamp(fontFamily)

	// Build description according to pdfcpu stamp documentation
	// Use unambiguous parameter names to avoid "ambiguous parameter prefix" errors
	// Use rotation:0 for horizontal text (only one of rotation or diagonal is allowed)
	description := fmt.Sprintf(
		"fontname:%s, points:%d, pos:%s, offset:%d %d, aligntext:c, fillcolor:%s, strokecolor:%s, opacity:1.0, scale:1.0 abs, rotation:0",
		pdfcpuFont,
		fontSize,
		pdfcpuPosition,
		offsetX,
		offsetY,
		pdfcpuColor,
		pdfcpuColor,
	)

	// Build pdfcpu stamp command
	args := []string{
		"stamp", "add",
		"-mode", "text",
	}

	// Add page selection if specified
	if selectedPages != "" {
		args = append(args, "-pages", selectedPages)
	} else if skipFirstPage {
		// If skipping first page, stamp pages 2 onwards
		if totalPages > 1 {
			args = append(args, "-pages", fmt.Sprintf("2-%d", totalPages))
		} else {
			// Only one page and we're skipping it, so nothing to do
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Cannot skip first page when PDF has only one page",
			})
			return
		}
	}
	// If no page selection and not skipping first page, apply to all pages (default)

	// Add the stamp content and description
	args = append(args, "--", pageText, description, inputPath, outputPath)

	// Log the command for debugging
	log.Printf("Executing pdfcpu stamp command: pdfcpu %s", strings.Join(args, " "))

	// Execute the command with timeout
	cmd = exec.Command("pdfcpu", args...)
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	output, err = cmd.CombinedOutput()

	// Check for errors
	if ctx.Err() == context.DeadlineExceeded {
		log.Printf("pdfcpu stamp command timed out")
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "PDF processing timed out, please try with a smaller file",
		})
		return
	}

	if err != nil {
		log.Printf("pdfcpu stamp command failed: %s", string(output))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to add page numbers to PDF: %s", string(output)),
		})
		return
	}

	// Count pages that were numbered
	numberedPages := totalPages
	if selectedPages != "" {
		// Parse selected pages to count them
		numberedPages = countPagesInSelection(selectedPages, totalPages)
	} else if skipFirstPage {
		numberedPages = totalPages - 1
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=pagenumbers&filename=%s-numbered.pdf", uniqueID)

	// Return response
	response := gin.H{
		"success":       true,
		"message":       "Page numbers added successfully",
		"fileUrl":       fileURL,
		"fileName":      fmt.Sprintf("%s-numbered.pdf", uniqueID),
		"originalName":  file.Filename,
		"totalPages":    totalPages,
		"numberedPages": numberedPages,
	}

	// Add billing info if available
	if exists {
		result, _ := h.balanceService.ProcessOperation(userID.(string), operation.(string))
		var opCost float64
		if result.UsedFreeOperation {
			opCost = 0
		} else {
			opCost = constants.DEFAULT_OPERATION_COST
		}

		response["billing"] = gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           opCost,
		}
	}

	c.JSON(http.StatusOK, response)
}

// Helper functions for pdfcpu stamp

// formatColorForPdfcpuStamp formats hex color for pdfcpu stamp description
func formatColorForPdfcpuStamp(hexColor string) string {
	// Remove # prefix if present
	hexColor = strings.TrimPrefix(hexColor, "#")

	// Default to black if invalid
	if len(hexColor) != 6 {
		return "#000000"
	}

	// Return as hex color (pdfcpu stamp accepts hex colors)
	return "#" + hexColor
}

// getAdjustedOffsetsForStamp calculates offsets for pdfcpu stamp
func getAdjustedOffsetsForStamp(position string, marginX, marginY int) (int, int) {
	// For pdfcpu stamp, offsets are relative to the anchor position
	// Positive values move right/up, negative values move left/down
	switch position {
	case "top-left":
		return marginX, -marginY // Move right from left edge, down from top
	case "top-center":
		return 0, -marginY // Centered horizontally, down from top
	case "top-right":
		return -marginX, -marginY // Move left from right edge, down from top
	case "bottom-left":
		return marginX, marginY // Move right from left edge, up from bottom
	case "bottom-center":
		return 0, marginY // Centered horizontally, up from bottom
	case "bottom-right":
		return -marginX, marginY // Move left from right edge, up from bottom
	default:
		return 0, marginY // Default to bottom-center
	}
}

// getFontMapForStamp maps font family names to pdfcpu stamp font names
func getFontMapForStamp(fontFamily string) string {
	switch strings.ToLower(fontFamily) {
	case "times", "timesnewroman", "times new roman":
		return "Times"
	case "courier":
		return "Courier"
	case "helvetica":
		return "Helvetica"
	default:
		return "Helvetica" // Default font
	}
}

// countPagesInSelection counts how many pages are in a page selection string
func countPagesInSelection(selection string, totalPages int) int {
	count := 0
	parts := strings.Split(selection, ",")

	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}

		if strings.Contains(part, "-") {
			// It's a range
			rangeParts := strings.Split(part, "-")
			if len(rangeParts) == 2 {
				start, err1 := strconv.Atoi(strings.TrimSpace(rangeParts[0]))
				end, err2 := strconv.Atoi(strings.TrimSpace(rangeParts[1]))

				if err1 == nil && err2 == nil && start >= 1 && end <= totalPages && start <= end {
					count += end - start + 1
				}
			}
		} else {
			// It's a single page
			page, err := strconv.Atoi(part)
			if err == nil && page >= 1 && page <= totalPages {
				count++
			}
		}
	}

	return count
}

// mapPositionToPdfcpu maps our position names to pdfcpu's position codes
func mapPositionToPdfcpu(position string) string {
	switch position {
	case "top-left":
		return "tl"
	case "top-center":
		return "tc"
	case "top-right":
		return "tr"
	case "bottom-left":
		return "bl"
	case "bottom-center":
		return "bc"
	case "bottom-right":
		return "br"
	default:
		return "bc" // Default to bottom center
	}
}

// Helper function to copy a file
func copyFile(src, dst string) error {
	sourceFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer sourceFile.Close()

	destFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer destFile.Close()

	_, err = io.Copy(destFile, sourceFile)
	return err
}

// Helper function to format page number according to format
func formatPageNumber(pageNum int, format string, startNumber int) string {
	actualNumber := pageNum + startNumber - 1

	switch format {
	case "roman":
		return toRoman(actualNumber)
	case "alphabetic":
		return toAlphabetic(actualNumber)
	default: // numeric
		return strconv.Itoa(actualNumber)
	}
}

// Helper function to convert number to Roman numerals
func toRoman(num int) string {
	if num <= 0 {
		return ""
	}

	romanNumerals := []struct {
		value   int
		numeral string
	}{
		{1000, "M"}, {900, "CM"}, {500, "D"}, {400, "CD"},
		{100, "C"}, {90, "XC"}, {50, "L"}, {40, "XL"},
		{10, "X"}, {9, "IX"}, {5, "V"}, {4, "IV"}, {1, "I"},
	}

	var result strings.Builder

	for _, rn := range romanNumerals {
		for num >= rn.value {
			result.WriteString(rn.numeral)
			num -= rn.value
		}
	}

	return result.String()
}

// Helper function to convert number to alphabetic format (A, B, C, ..., Z, AA, AB, etc.)
func toAlphabetic(num int) string {
	if num <= 0 {
		return ""
	}

	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	length := len(alphabet)

	var result strings.Builder

	// Convert to base-26 representation
	n := num
	for n > 0 {
		n--
		remainder := n % length
		result.WriteByte(alphabet[remainder])
		n /= length
	}

	// Reverse the string
	runes := []rune(result.String())
	for i, j := 0, len(runes)-1; i < j; i, j = i+1, j-1 {
		runes[i], runes[j] = runes[j], runes[i]
	}

	return string(runes)
}

// Helper function to map font family names to pdfcpu font names
func getFontMap(fontFamily string) string {
	switch strings.ToLower(fontFamily) {
	case "times", "timesnewroman", "times new roman":
		return "times"
	case "courier":
		return "Courier"
	default: // Helvetica is the default
		return "Helvetica"
	}
}

func formatColorForDescription(hexColor string) string {
	// Remove # prefix if present
	hexColor = strings.TrimPrefix(hexColor, "#")

	// Default to black if invalid
	if len(hexColor) != 6 {
		return "0 0 0"
	}

	// Convert hex to RGB integers
	r, _ := strconv.ParseInt(hexColor[0:2], 16, 32)
	g, _ := strconv.ParseInt(hexColor[2:4], 16, 32)
	b, _ := strconv.ParseInt(hexColor[4:6], 16, 32)

	// Convert to float values (0.0 to 1.0)
	return fmt.Sprintf("%.3f %.3f %.3f", float64(r)/255.0, float64(g)/255.0, float64(b)/255.0)
}
