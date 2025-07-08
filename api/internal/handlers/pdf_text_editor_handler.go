// internal/handlers/pdf_text_editor_handler.go
package handlers

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type PDFTextEditorHandler struct {
	balanceService *services.BalanceService
	config         *config.Config
}

type TextBlock struct {
	Text   string  `json:"text"`
	X0     float64 `json:"x0"`
	Y0     float64 `json:"y0"`
	X1     float64 `json:"x1"`
	Y1     float64 `json:"y1"`
	Font   string  `json:"font"`
	Size   float64 `json:"size"`
	Color  int     `json:"color"`
	Flags  int     `json:"flags,omitempty"`
	Width  float64 `json:"width,omitempty"`
	Height float64 `json:"height,omitempty"`
}

type ImageBlock struct {
	X0        float64 `json:"x0"`
	Y0        float64 `json:"y0"`
	X1        float64 `json:"x1"`
	Y1        float64 `json:"y1"`
	Width     float64 `json:"width"`
	Height    float64 `json:"height"`
	ImageData string  `json:"image_data"` // base64 encoded
	Format    string  `json:"format"`     // jpeg, png, etc.
	ImageID   string  `json:"image_id"`   // unique identifier
}

type PDFPage struct {
	PageNumber int          `json:"page_number"`
	Width      float64      `json:"width"`
	Height     float64      `json:"height"`
	Texts      []TextBlock  `json:"texts"`
	Images     []ImageBlock `json:"images"`
}

type PDFTextData struct {
	Pages    []PDFPage `json:"pages"`
	Metadata struct {
		TotalPages       int    `json:"total_pages"`
		TotalTextBlocks  int    `json:"total_text_blocks"`
		TotalImages      int    `json:"total_images"`
		ExtractionMethod string `json:"extraction_method"`
	} `json:"metadata"`
}

// TextLine represents a line of text with multiple blocks
type TextLine struct {
	Y          float64
	Blocks     []TextBlock
	MinX       float64
	MaxX       float64
	LineHeight float64
}

// SpacingAnalysis contains information about text spacing
type SpacingAnalysis struct {
	AverageWordSpacing float64
	AverageLineSpacing float64
	MinWordSpacing     float64
	MaxWordSpacing     float64
	SuspiciousSpaces   []SpaceIssue
}

type SpaceIssue struct {
	Type        string // "too_long", "missing", "overlapping"
	Block1Index int
	Block2Index int
	Distance    float64
	Suggested   float64
}

func NewPDFTextEditorHandler(balanceService *services.BalanceService, cfg *config.Config) *PDFTextEditorHandler {
	return &PDFTextEditorHandler{
		balanceService: balanceService,
		config:         cfg,
	}
}

// ExtractTextToPDF extracts text and images from PDF using improved Python script
func (h *PDFTextEditorHandler) ExtractTextToPDF(c *gin.Context) {
	// Get user ID and process billing
	userID, exists := c.Get("userId")
	if exists && userID != nil {
		result, err := h.balanceService.ProcessOperation(userID.(string), "extractText")
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

	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
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

	// Create unique session ID
	sessionID := uuid.New().String()
	inputPath := filepath.Join(h.config.UploadDir, sessionID+"-input.pdf")

	// Save uploaded file
	if err := c.SaveUploadedFile(file, inputPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save file: " + err.Error(),
		})
		return
	}
	defer os.Remove(inputPath)

	// Extract text and images using improved Python script
	extractedData, err := h.extractContentWithImprovedPython(inputPath, sessionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to extract content: " + err.Error(),
		})
		return
	}

	// Analyze and improve spacing for text blocks
	for i := range extractedData.Pages {
		h.analyzeAndImproveSpacing(&extractedData.Pages[i])
	}

	// Check if we actually extracted any content
	totalTextBlocks := 0
	totalImages := 0
	for _, page := range extractedData.Pages {
		totalTextBlocks += len(page.Texts)
		totalImages += len(page.Images)
	}

	if totalTextBlocks == 0 && totalImages == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "No content found in the PDF. The PDF may be empty or password protected.",
		})
		return
	}

	// Save extracted data to session
	sessionDir := filepath.Join(h.config.PublicDir, "editor-sessions")
	if err := os.MkdirAll(sessionDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create session directory: " + err.Error(),
		})
		return
	}

	sessionFile := filepath.Join(sessionDir, sessionID+".json")
	jsonData, err := json.Marshal(extractedData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to serialize extracted data: " + err.Error(),
		})
		return
	}

	if err := os.WriteFile(sessionFile, jsonData, 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to save session data: " + err.Error(),
		})
		return
	}

	// Update metadata
	extractedData.Metadata.TotalPages = len(extractedData.Pages)
	extractedData.Metadata.TotalTextBlocks = totalTextBlocks
	extractedData.Metadata.TotalImages = totalImages
	extractedData.Metadata.ExtractionMethod = "PyMuPDF Enhanced with Images"

	// Return response
	response := gin.H{
		"success":       true,
		"message":       fmt.Sprintf("Content extracted successfully from %d pages with %d text blocks and %d images", len(extractedData.Pages), totalTextBlocks, totalImages),
		"extractedData": extractedData,
		"sessionId":     sessionID,
		"originalName":  file.Filename,
	}

	// Add billing info if available
	if exists && userID != nil {
		result, _ := h.balanceService.ProcessOperation(userID.(string), "extractText")
		response["billing"] = gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           constants.DEFAULT_OPERATION_COST,
		}
	}

	c.JSON(http.StatusOK, response)
}

// SaveEditedPDF creates a new PDF from edited text data and preserved images with improved spacing
func (h *PDFTextEditorHandler) SaveEditedPDF(c *gin.Context) {
	// Get user ID and process billing
	userID, exists := c.Get("userId")
	if exists && userID != nil {
		result, err := h.balanceService.ProcessOperation(userID.(string), "saveEditedText")
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

	// Get parameters
	sessionID := c.PostForm("sessionId")
	editedDataStr := c.PostForm("editedData")

	if sessionID == "" || editedDataStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing sessionId or editedData",
		})
		return
	}

	// Parse edited data
	var editedData PDFTextData
	if err := json.Unmarshal([]byte(editedDataStr), &editedData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid edited data format: " + err.Error(),
		})
		return
	}

	// Analyze and fix spacing issues before creating PDF
	for i := range editedData.Pages {
		h.analyzeAndImproveSpacing(&editedData.Pages[i])
		h.fixOverlappingText(&editedData.Pages[i])
	}

	// Generate output PDF
	outputPath := filepath.Join(h.config.PublicDir, "edited", sessionID+"-edited.pdf")
	if err := os.MkdirAll(filepath.Dir(outputPath), 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create output directory: " + err.Error(),
		})
		return
	}

	// Create PDF from edited data using improved Python script with image support
	if err := h.createImprovedPDFWithImages(editedData, outputPath, sessionID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create PDF: " + err.Error(),
		})
		return
	}

	// Generate file URL
	fileURL := fmt.Sprintf("/api/file?folder=edited&filename=%s-edited.pdf", sessionID)

	// Return response
	response := gin.H{
		"success":  true,
		"message":  "PDF saved successfully with improved spacing and preserved images",
		"fileUrl":  fileURL,
		"filename": fmt.Sprintf("%s-edited.pdf", sessionID),
	}

	// Add billing info if available
	if exists && userID != nil {
		result, _ := h.balanceService.ProcessOperation(userID.(string), "saveEditedText")
		response["billing"] = gin.H{
			"usedFreeOperation":       result.UsedFreeOperation,
			"freeOperationsRemaining": result.FreeOperationsRemaining,
			"currentBalance":          result.CurrentBalance,
			"operationCost":           constants.DEFAULT_OPERATION_COST,
		}
	}

	c.JSON(http.StatusOK, response)
}

// GetEditSession retrieves session data
func (h *PDFTextEditorHandler) GetEditSession(c *gin.Context) {
	sessionID := c.Query("sessionId")
	if sessionID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Missing sessionId parameter",
		})
		return
	}

	sessionFile := filepath.Join(h.config.PublicDir, "editor-sessions", sessionID+".json")
	if _, err := os.Stat(sessionFile); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Session not found",
		})
		return
	}

	data, err := os.ReadFile(sessionFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to read session data: " + err.Error(),
		})
		return
	}

	var extractedData PDFTextData
	if err := json.Unmarshal(data, &extractedData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to parse session data: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":       true,
		"extractedData": extractedData,
		"sessionId":     sessionID,
	})
}

// analyzeAndImproveSpacing analyzes text blocks and improves spacing
func (h *PDFTextEditorHandler) analyzeAndImproveSpacing(page *PDFPage) {
	if len(page.Texts) < 2 {
		return
	}

	// Group text blocks into lines
	lines := h.groupTextIntoLines(page.Texts)

	// Analyze spacing within each line
	for _, line := range lines {
		h.improveLineSpacing(&line)

		// Update the original text blocks
		for i, block := range line.Blocks {
			for j := range page.Texts {
				if h.isSameBlock(page.Texts[j], block) {
					page.Texts[j] = line.Blocks[i]
					break
				}
			}
		}
	}
}

// groupTextIntoLines groups text blocks that appear to be on the same line
func (h *PDFTextEditorHandler) groupTextIntoLines(texts []TextBlock) []TextLine {
	if len(texts) == 0 {
		return nil
	}

	// Sort by Y position first
	sortedTexts := make([]TextBlock, len(texts))
	copy(sortedTexts, texts)
	sort.Slice(sortedTexts, func(i, j int) bool {
		return sortedTexts[i].Y0 < sortedTexts[j].Y0
	})

	var lines []TextLine
	tolerance := 5.0 // pixels tolerance for considering blocks on same line

	for _, text := range sortedTexts {
		placed := false

		// Try to add to existing line
		for i := range lines {
			if math.Abs(lines[i].Y-text.Y0) <= tolerance {
				lines[i].Blocks = append(lines[i].Blocks, text)
				lines[i].MinX = math.Min(lines[i].MinX, text.X0)
				lines[i].MaxX = math.Max(lines[i].MaxX, text.X1)
				lines[i].LineHeight = math.Max(lines[i].LineHeight, text.Y1-text.Y0)
				placed = true
				break
			}
		}

		// Create new line if not placed
		if !placed {
			lines = append(lines, TextLine{
				Y:          text.Y0,
				Blocks:     []TextBlock{text},
				MinX:       text.X0,
				MaxX:       text.X1,
				LineHeight: text.Y1 - text.Y0,
			})
		}
	}

	// Sort blocks within each line by X position
	for i := range lines {
		sort.Slice(lines[i].Blocks, func(j, k int) bool {
			return lines[i].Blocks[j].X0 < lines[i].Blocks[k].X0
		})
	}

	return lines
}

// improveLineSpacing improves spacing between blocks in a line
func (h *PDFTextEditorHandler) improveLineSpacing(line *TextLine) {
	if len(line.Blocks) < 2 {
		return
	}

	// Calculate average character width for the line
	var totalCharWidth float64
	var charCount int

	for _, block := range line.Blocks {
		if len(block.Text) > 0 {
			charWidth := (block.X1 - block.X0) / float64(len(block.Text))
			totalCharWidth += charWidth
			charCount++
		}
	}

	var avgCharWidth float64
	if charCount > 0 {
		avgCharWidth = totalCharWidth / float64(charCount)
	} else {
		avgCharWidth = 6.0 // default fallback
	}

	// Standard space width (typically 0.25-0.5 of character width)
	standardSpaceWidth := avgCharWidth * 0.35

	// Adjust spacing between consecutive blocks
	for i := 0; i < len(line.Blocks)-1; i++ {
		currentBlock := &line.Blocks[i]
		nextBlock := &line.Blocks[i+1]

		gap := nextBlock.X0 - currentBlock.X1

		// Check if gap is too large (more than 3 character widths)
		if gap > avgCharWidth*3 {
			// Reduce gap to standard space width
			adjustment := gap - standardSpaceWidth
			nextBlock.X0 -= adjustment
			nextBlock.X1 -= adjustment

			// Adjust all subsequent blocks
			for j := i + 2; j < len(line.Blocks); j++ {
				line.Blocks[j].X0 -= adjustment
				line.Blocks[j].X1 -= adjustment
			}
		} else if gap < standardSpaceWidth*0.5 && gap > 0 {
			// Gap is too small, increase it
			adjustment := standardSpaceWidth - gap
			nextBlock.X0 += adjustment
			nextBlock.X1 += adjustment

			// Adjust all subsequent blocks
			for j := i + 2; j < len(line.Blocks); j++ {
				line.Blocks[j].X0 += adjustment
				line.Blocks[j].X1 += adjustment
			}
		} else if gap <= 0 {
			// Overlapping text, fix it
			adjustment := standardSpaceWidth - gap
			nextBlock.X0 += adjustment
			nextBlock.X1 += adjustment

			// Adjust all subsequent blocks
			for j := i + 2; j < len(line.Blocks); j++ {
				line.Blocks[j].X0 += adjustment
				line.Blocks[j].X1 += adjustment
			}
		}
	}
}

// fixOverlappingText fixes overlapping text blocks
func (h *PDFTextEditorHandler) fixOverlappingText(page *PDFPage) {
	for i := 0; i < len(page.Texts); i++ {
		for j := i + 1; j < len(page.Texts); j++ {
			block1 := &page.Texts[i]
			block2 := &page.Texts[j]

			// Check for overlap
			if h.blocksOverlap(*block1, *block2) {
				// Move the second block to avoid overlap
				if math.Abs(block1.Y0-block2.Y0) < 5.0 { // Same line
					// Move horizontally
					if block1.X0 < block2.X0 {
						block2.X0 = block1.X1 + (block1.Size * 0.35) // Add space
						block2.X1 = block2.X0 + (block2.X1 - block2.X0)
					} else {
						block1.X0 = block2.X1 + (block2.Size * 0.35) // Add space
						block1.X1 = block1.X0 + (block1.X1 - block1.X0)
					}
				} else {
					// Move vertically
					if block1.Y0 < block2.Y0 {
						block2.Y0 = block1.Y1 + 2
						block2.Y1 = block2.Y0 + (block2.Y1 - block2.Y0)
					} else {
						block1.Y0 = block2.Y1 + 2
						block1.Y1 = block1.Y0 + (block1.Y1 - block1.Y0)
					}
				}
			}
		}
	}
}

// blocksOverlap checks if two text blocks overlap
func (h *PDFTextEditorHandler) blocksOverlap(block1, block2 TextBlock) bool {
	return !(block1.X1 <= block2.X0 || block2.X1 <= block1.X0 ||
		block1.Y1 <= block2.Y0 || block2.Y1 <= block1.Y0)
}

// isSameBlock checks if two blocks are the same
func (h *PDFTextEditorHandler) isSameBlock(block1, block2 TextBlock) bool {
	return math.Abs(block1.X0-block2.X0) < 0.1 &&
		math.Abs(block1.Y0-block2.Y0) < 0.1 &&
		block1.Text == block2.Text
}

// extractContentWithImprovedPython extracts text and images using enhanced PyMuPDF
func (h *PDFTextEditorHandler) extractContentWithImprovedPython(pdfPath, sessionID string) (*PDFTextData, error) {
	pythonScript := `#!/usr/bin/env python3
import sys
import json
import re
import base64
import os

try:
    import fitz  # PyMuPDF
except ImportError:
    print(json.dumps({"error": "PyMuPDF not installed"}))
    sys.exit(1)

def extract_content_with_improved_positions(pdf_path, session_id):
    try:
        doc = fitz.open(pdf_path)
        data = {"pages": []}

        # Create session directory for images
        session_dir = os.path.join(os.path.dirname(pdf_path), f"session_{session_id}")
        os.makedirs(session_dir, exist_ok=True)

        for page_num in range(len(doc)):
            page = doc[page_num]
            page_rect = page.rect
            page_data = {
                "page_number": page_num + 1,
                "width": float(page_rect.width),
                "height": float(page_rect.height),
                "texts": [],
                "images": []
            }

            try:
                # Extract text blocks
                blocks = page.get_text("dict")
                for block in blocks.get("blocks", []):
                    if block.get("type") == 0:  # Text block
                        for line in block.get("lines", []):
                            for span in line.get("spans", []):
                                try:
                                    text_content = span.get("text", "").strip()
                                    if not text_content:
                                        continue
                                        
                                    bbox = list(span.get("bbox", [0, 0, 0, 0]))  # Convert to list
                                    font_info = span.get("font", "Helvetica")
                                    font_size = max(span.get("size", 12), 1)  # Ensure minimum size
                                    color = span.get("color", 0)
                                    flags = span.get("flags", 0)
                                    
                                    # Ensure bbox has 4 elements
                                    if len(bbox) < 4:
                                        bbox = [0, 0, 100, 20]  # Default bbox
                                    
                                    # Calculate better width based on text length and font size
                                    estimated_char_width = font_size * 0.6
                                    estimated_width = len(text_content) * estimated_char_width
                                    actual_width = max(bbox[2] - bbox[0], 0)
                                    
                                    # Use actual width if reasonable, otherwise use estimated
                                    if actual_width > 0 and actual_width < estimated_width * 2:
                                        final_width = actual_width
                                    else:
                                        final_width = estimated_width
                                        # Adjust bbox accordingly
                                        bbox[2] = bbox[0] + final_width
                                    
                                    text_info = {
                                        "text": text_content,
                                        "x0": float(bbox[0]),
                                        "y0": float(bbox[1]),
                                        "x1": float(bbox[2]),
                                        "y1": float(bbox[3]),
                                        "font": str(font_info),
                                        "size": float(font_size),
                                        "color": int(color),
                                        "flags": int(flags),
                                        "width": float(final_width),
                                        "height": float(max(bbox[3] - bbox[1], font_size))
                                    }
                                    
                                    page_data["texts"].append(text_info)
                                    
                                except Exception as span_error:
                                    print(f"Error processing span: {span_error}", file=sys.stderr)
                                    continue

                    elif block.get("type") == 1:  # Image block
                        try:
                            bbox = block.get("bbox", [0, 0, 0, 0])
                            # Get image data
                            image_list = page.get_images()
                            for img_index, img in enumerate(image_list):
                                try:
                                    # Check if this image is within the block bounds
                                    xref = img[0]
                                    base_image = doc.extract_image(xref)
                                    image_bytes = base_image["image"]
                                    image_ext = base_image["ext"]
                                    
                                    # Convert to base64
                                    image_b64 = base64.b64encode(image_bytes).decode()
                                    
                                    image_info = {
                                        "x0": float(bbox[0]),
                                        "y0": float(bbox[1]),
                                        "x1": float(bbox[2]),
                                        "y1": float(bbox[3]),
                                        "width": float(bbox[2] - bbox[0]),
                                        "height": float(bbox[3] - bbox[1]),
                                        "image_data": image_b64,
                                        "format": image_ext,
                                        "image_id": f"{session_id}_page{page_num}_img{img_index}"
                                    }
                                    
                                    page_data["images"].append(image_info)
                                except Exception as img_error:
                                    print(f"Error extracting image {img_index}: {img_error}", file=sys.stderr)
                                    # Create a placeholder for failed image extraction
                                    image_info = {
                                        "x0": float(bbox[0]),
                                        "y0": float(bbox[1]),
                                        "x1": float(bbox[2]),
                                        "y1": float(bbox[3]),
                                        "width": float(bbox[2] - bbox[0]),
                                        "height": float(bbox[3] - bbox[1]),
                                        "image_data": "",
                                        "format": "placeholder",
                                        "image_id": f"{session_id}_page{page_num}_placeholder{img_index}"
                                    }
                                    page_data["images"].append(image_info)
                                    continue
                        except Exception as block_error:
                            print(f"Error processing image block: {block_error}", file=sys.stderr)
                            continue
                                    
            except Exception as page_error:
                print(f"Error processing page {page_num + 1}: {page_error}", file=sys.stderr)
                # Continue with empty page
            
            # Post-process to improve spacing analysis
            try:
                page_data["texts"] = improve_text_spacing(page_data["texts"])
            except Exception as spacing_error:
                print(f"Error improving spacing on page {page_num + 1}: {spacing_error}", file=sys.stderr)
                # Continue without spacing improvements
            
            # Sort text blocks by position (top to bottom, left to right)
            page_data["texts"].sort(key=lambda x: (x["y0"], x["x0"]))
            # Sort images by position
            page_data["images"].sort(key=lambda x: (x["y0"], x["x0"]))
            
            data["pages"].append(page_data)

        doc.close()
        return data
        
    except Exception as e:
        return {"error": f"Failed to extract content: {str(e)}"}

def improve_text_spacing(texts):
    """Improve text spacing by analyzing and adjusting text block positions"""
    if len(texts) < 2:
        return texts
    
    try:
        # Group texts by lines (similar Y coordinates)
        lines = []
        line_tolerance = 5.0
        
        for text in texts:
            if not isinstance(text, dict):
                continue
                
            placed = False
            for line in lines:
                if abs(line["y"] - text.get("y0", 0)) <= line_tolerance:
                    line["texts"].append(text)
                    placed = True
                    break
            
            if not placed:
                lines.append({
                    "y": text.get("y0", 0),
                    "texts": [text]
                })
        
        # Sort texts within each line by X position
        for line in lines:
            line["texts"].sort(key=lambda x: x.get("x0", 0))
            
            # Analyze spacing within the line
            if len(line["texts"]) > 1:
                try:
                    # Calculate average character width
                    total_char_width = 0
                    char_count = 0
                    
                    for text in line["texts"]:
                        text_len = len(text.get("text", ""))
                        x0 = text.get("x0", 0)
                        x1 = text.get("x1", 0)
                        
                        if text_len > 0 and x1 > x0:
                            char_width = (x1 - x0) / text_len
                            total_char_width += char_width
                            char_count += 1
                    
                    if char_count > 0:
                        avg_char_width = total_char_width / char_count
                        standard_space = avg_char_width * 0.35
                        
                        # Check spacing between consecutive texts
                        for i in range(len(line["texts"]) - 1):
                            current = line["texts"][i]
                            next_text = line["texts"][i + 1]
                            
                            current_x1 = current.get("x1", 0)
                            next_x0 = next_text.get("x0", 0)
                            gap = next_x0 - current_x1
                            
                            # If gap is suspiciously large (> 3 char widths), it might need adjustment
                            if gap > avg_char_width * 3:
                                # Mark for potential adjustment
                                current["_large_gap_after"] = True
                                current["_suggested_gap"] = standard_space
                            elif gap < 0:
                                # Overlapping text
                                current["_overlapping"] = True
                                next_text["_overlapping"] = True
                                
                except Exception as line_error:
                    print(f"Error analyzing line spacing: {line_error}", file=sys.stderr)
                    continue
        
        # Flatten back to single list
        result = []
        for line in lines:
            result.extend(line["texts"])
        
        return result
        
    except Exception as e:
        print(f"Error in improve_text_spacing: {e}", file=sys.stderr)
        return texts  # Return original texts if spacing improvement fails

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"error": "Usage: script.py <pdf_path> <session_id>"}))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    session_id = sys.argv[2]
    result = extract_content_with_improved_positions(pdf_path, session_id)
    print(json.dumps(result))
`

	tempDir := h.config.TempDir
	scriptPath := filepath.Join(tempDir, "extract_content_improved_"+uuid.New().String()+".py")
	if err := os.WriteFile(scriptPath, []byte(pythonScript), 0755); err != nil {
		return nil, fmt.Errorf("failed to create Python script: %w", err)
	}
	defer os.Remove(scriptPath)

	cmd := exec.Command("python3", scriptPath, pdfPath, sessionID)
	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("failed to execute Python script: %w", err)
	}

	var result map[string]interface{}
	if err := json.Unmarshal(output, &result); err != nil {
		return nil, fmt.Errorf("failed to parse Python output: %w", err)
	}

	if errMsg, exists := result["error"]; exists {
		return nil, fmt.Errorf("python script error: %v", errMsg)
	}

	var data PDFTextData
	if err := json.Unmarshal(output, &data); err != nil {
		return nil, fmt.Errorf("failed to convert Python output: %w", err)
	}

	return &data, nil
}

// createImprovedPDFWithImages creates a PDF with better spacing handling and image support
func (h *PDFTextEditorHandler) createImprovedPDFWithImages(data PDFTextData, outputPath, sessionID string) error {
	pythonScript := `#!/usr/bin/env python3
import sys
import json
import math
import base64
import io
import os

try:
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.colors import Color
    from reportlab.lib.units import inch
    from reportlab.lib.utils import ImageReader
    from PIL import Image
except ImportError:
    print("ReportLab and/or PIL not installed")
    sys.exit(1)

def create_improved_pdf_with_images(data, output_path, session_id):
    try:
        c = canvas.Canvas(output_path)
        
        if not isinstance(data, dict) or "pages" not in data:
            raise ValueError("Invalid data structure")
        
        pages = data.get("pages", [])
        if not pages:
            # Create a blank page if no pages
            c.setPageSize((612, 792))
            c.showPage()
        
        for page_idx, page in enumerate(pages):
            try:
                # Set page size
                page_width = page.get("width", 612)
                page_height = page.get("height", 792)
                c.setPageSize((page_width, page_height))
                
                # Draw images first (behind text)
                images = page.get("images", [])
                if images:
                    try:
                        for image_info in images:
                            draw_image(c, image_info, page_height, session_id)
                    except Exception as image_error:
                        print(f"Error drawing images on page {page_idx + 1}: {image_error}")
                        # Continue without images
                
                # Group texts into lines for better spacing
                texts = page.get("texts", [])
                if texts:
                    try:
                        lines = group_texts_into_lines(texts)
                        
                        for line in lines:
                            # Process each line with improved spacing
                            process_line_with_spacing(c, line, page_height)
                            
                    except Exception as line_error:
                        print(f"Error processing lines on page {page_idx + 1}: {line_error}")
                        # Fallback: draw texts without line processing
                        for text in texts:
                            if isinstance(text, dict):
                                try:
                                    c.setFont("Helvetica", max(text.get("size", 12), 1))
                                    c.setFillColorRGB(0, 0, 0)
                                    x = text.get("x0", 0)
                                    y = page_height - text.get("y0", 0)
                                    text_content = text.get("text", "")
                                    if text_content:
                                        c.drawString(x, y, text_content)
                                except Exception:
                                    continue
                
                c.showPage()
                
            except Exception as page_error:
                print(f"Error processing page {page_idx + 1}: {page_error}")
                # Create empty page and continue
                c.setPageSize((612, 792))
                c.showPage()
                continue
        
        c.save()
        print("Improved PDF with images created successfully")
        
    except Exception as e:
        print(f"Error creating PDF: {e}")
        sys.exit(1)

def draw_image(c, image_info, page_height, session_id):
    """Draw an image on the canvas"""
    try:
        image_data = image_info.get("image_data", "")
        if image_data and image_info.get("format") != "placeholder":
            # Decode base64 image
            image_bytes = base64.b64decode(image_data)
            image_stream = io.BytesIO(image_bytes)
            
            # Create PIL Image
            pil_image = Image.open(image_stream)
            
            # Convert to RGB if necessary
            if pil_image.mode not in ('RGB', 'L'):
                pil_image = pil_image.convert('RGB')
            
            # Create ImageReader
            img_stream = io.BytesIO()
            pil_image.save(img_stream, format='PNG')
            img_stream.seek(0)
            img_reader = ImageReader(img_stream)
            
            # Draw image
            x = image_info.get("x0", 0)
            y = page_height - image_info.get("y1", 0)  # Flip Y coordinate
            width = image_info.get("width", 100)
            height = image_info.get("height", 100)
            
            c.drawImage(img_reader, x, y, width, height)
        elif image_info.get("format") == "placeholder":
            # Draw placeholder rectangle
            x = image_info.get("x0", 0)
            y = page_height - image_info.get("y1", 0)
            width = image_info.get("width", 100)
            height = image_info.get("height", 100)
            
            c.setStrokeColorRGB(0.7, 0.7, 0.7)
            c.setFillColorRGB(0.9, 0.9, 0.9)
            c.rect(x, y, width, height, fill=1, stroke=1)
            
            # Add placeholder text
            c.setFillColorRGB(0.5, 0.5, 0.5)
            c.setFont("Helvetica", min(12, width/8))
            text_x = x + width/2
            text_y = y + height/2
            c.drawCentredText(text_x, text_y, "[Image]")
            
    except Exception as e:
        print(f"Error drawing image: {e}")

def group_texts_into_lines(texts):
    """Group text blocks that appear to be on the same line"""
    if not texts:
        return []
    
    try:
        lines = []
        line_tolerance = 5.0
        
        for text in texts:
            if not isinstance(text, dict):
                continue
                
            y_pos = text.get("y0", 0)
            placed = False
            
            for line in lines:
                if abs(line.get("y", 0) - y_pos) <= line_tolerance:
                    line["texts"].append(text)
                    placed = True
                    break
            
            if not placed:
                lines.append({
                    "y": y_pos,
                    "texts": [text]
                })
        
        # Sort texts within each line by X position
        for line in lines:
            try:
                line["texts"].sort(key=lambda x: x.get("x0", 0))
            except Exception as sort_error:
                print(f"Error sorting texts in line: {sort_error}")
                continue
        
        return lines
        
    except Exception as e:
        print(f"Error grouping texts into lines: {e}")
        # Return a fallback structure
        return [{"y": 0, "texts": texts}] if texts else []

def process_line_with_spacing(c, line, page_height):
    """Process a line of text with improved spacing"""
    texts = line.get("texts", [])
    if not texts:
        return
    
    try:
        # Calculate average character width for the line
        total_char_width = 0
        char_count = 0
        
        for text in texts:
            if not isinstance(text, dict):
                continue
                
            text_len = len(text.get("text", ""))
            x0 = text.get("x0", 0)
            x1 = text.get("x1", 0)
            
            if text_len > 0 and x1 > x0:
                char_width = (x1 - x0) / text_len
                total_char_width += char_width
                char_count += 1
        
        avg_char_width = total_char_width / char_count if char_count > 0 else 6.0
        standard_space = avg_char_width * 0.35
        
        # Adjust positions to fix spacing issues
        adjusted_texts = []
        current_x = None
        
        for i, text in enumerate(texts):
            if not isinstance(text, dict):
                continue
                
            adjusted_text = dict(text)  # Create a proper copy
            
            if current_x is not None and i > 0:
                # Calculate expected position based on previous text
                prev_text = texts[i-1] if i > 0 else None
                if prev_text and isinstance(prev_text, dict):
                    gap = text.get("x0", 0) - prev_text.get("x1", 0)
                    
                    # If gap is too large, reduce it
                    if gap > avg_char_width * 3:
                        adjusted_text["x0"] = current_x + standard_space
                        adjusted_text["x1"] = adjusted_text["x0"] + (text.get("x1", 0) - text.get("x0", 0))
                    # If gap is too small or overlapping, increase it  
                    elif gap < standard_space * 0.5:
                        adjusted_text["x0"] = current_x + standard_space
                        adjusted_text["x1"] = adjusted_text["x0"] + (text.get("x1", 0) - text.get("x0", 0))
                
                current_x = adjusted_text.get("x1", current_x)
            else:
                current_x = adjusted_text.get("x1", 0)
            
            adjusted_texts.append(adjusted_text)
        
        # Draw the adjusted texts
        for text in adjusted_texts:
            try:
                # Set font
                font_name = text.get("font", "Helvetica")
                font_size = max(text.get("size", 12), 1)  # Ensure minimum size
                
                # Map font names to ReportLab fonts
                if "Times" in font_name:
                    if "Bold" in font_name:
                        font_name = "Times-Bold"
                    elif "Italic" in font_name:
                        font_name = "Times-Italic"
                    else:
                        font_name = "Times-Roman"
                elif "Courier" in font_name:
                    if "Bold" in font_name:
                        font_name = "Courier-Bold"
                    elif "Oblique" in font_name:
                        font_name = "Courier-Oblique"
                    else:
                        font_name = "Courier"
                else:
                    if "Bold" in font_name:
                        font_name = "Helvetica-Bold"
                    elif "Oblique" in font_name or "Italic" in font_name:
                        font_name = "Helvetica-Oblique"
                    else:
                        font_name = "Helvetica"
                
                c.setFont(font_name, font_size)
                
                # Set color
                color_int = text.get("color", 0)
                if color_int == 0:
                    c.setFillColorRGB(0, 0, 0)  # Black
                else:
                    r = ((color_int >> 16) & 255) / 255.0
                    g = ((color_int >> 8) & 255) / 255.0
                    b = (color_int & 255) / 255.0
                    c.setFillColorRGB(r, g, b)
                
                # Draw text at adjusted position
                x = text.get("x0", 0)
                y = page_height - text.get("y0", 0)  # Flip Y coordinate
                text_content = text.get("text", "")
                
                if not text_content:
                    continue
                
                # Handle long text that might not fit
                text_width = text.get("x1", 0) - text.get("x0", 0)
                if text_width > 0:
                    try:
                        # Calculate if text fits in the allocated space
                        actual_text_width = c.stringWidth(text_content, font_name, font_size)
                        if actual_text_width > text_width * 1.2:  # Text is too wide
                            # Try to fit by reducing font size slightly
                            adjusted_font_size = font_size * (text_width / actual_text_width) * 0.9
                            if adjusted_font_size >= font_size * 0.7:  # Don't make it too small
                                c.setFont(font_name, adjusted_font_size)
                    except Exception as font_error:
                        print(f"Error adjusting font size: {font_error}")
                        # Continue with original font size
                
                c.drawString(x, y, text_content)
                
            except Exception as text_error:
                print(f"Error drawing text block: {text_error}")
                continue
                
    except Exception as line_error:
        print(f"Error processing line: {line_error}")
        # Fall back to drawing texts without spacing adjustments
        for text in texts:
            if not isinstance(text, dict):
                continue
            try:
                font_name = text.get("font", "Helvetica")
                font_size = max(text.get("size", 12), 1)
                c.setFont("Helvetica", font_size)
                c.setFillColorRGB(0, 0, 0)
                x = text.get("x0", 0)
                y = page_height - text.get("y0", 0)
                text_content = text.get("text", "")
                if text_content:
                    c.drawString(x, y, text_content)
            except Exception:
                continue

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: script.py <json_data> <output_path> <session_id>")
        sys.exit(1)
    
    json_data = sys.argv[1]
    output_path = sys.argv[2]
    session_id = sys.argv[3]
    
    try:
        data = json.loads(json_data)
        create_improved_pdf_with_images(data, output_path, session_id)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
`

	tempDir := h.config.TempDir
	scriptPath := filepath.Join(tempDir, "create_improved_pdf_with_images_"+uuid.New().String()+".py")
	if err := os.WriteFile(scriptPath, []byte(pythonScript), 0755); err != nil {
		return fmt.Errorf("failed to create Python script: %w", err)
	}
	defer os.Remove(scriptPath)

	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	cmd := exec.Command("python3", scriptPath, string(jsonData), outputPath, sessionID)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to execute PDF creation script: %w, output: %s", err, string(output))
	}

	return nil
}
