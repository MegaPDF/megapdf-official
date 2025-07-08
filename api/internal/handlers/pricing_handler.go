package handlers

import (
	"fmt"
	"net/http"

	"github.com/MegaPDF/megapdf-official/api/internal/config"
	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/services"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Add this to internal/handlers/handlers.go (or create a separate pricing handler file)

// Add this import

// Add this field to your Handler struct:
type PricingHandler struct {
	pricingService *services.PricingService
}

// Update NewHandler constructor:
func NewPricingHandler(db *gorm.DB, config *config.Config) *PricingHandler {
	return &PricingHandler{
		pricingService: services.NewPricingService(),
	}
}

// @Summary Get current pricing information
// @Description Get current operation costs and pricing configuration (public endpoint)
// @Tags pricing
// @Produce json
// @Success 200 {object} object{operationCost=number,freeOperationsMonthly=number,customPrices=object,lastUpdated=string,source=string}
// @Failure 500 {object} object{error=string}
// @Router /api/pricing [get]
func (h *PricingHandler) GetPublicPricing(c *gin.Context) {
	pricingInfo := h.pricingService.GetPricingInfo()
	c.JSON(http.StatusOK, pricingInfo)
}

// @Summary Get operation cost for specific operation
// @Description Get the cost for a specific PDF operation (public endpoint)
// @Tags pricing
// @Produce json
// @Param operation path string true "Operation name" Enums(convert,compress,merge,split,protect,unlock,watermark,sign,rotate,ocr,repair,edit,annotate,extract,redact,organize,chat,remove)
// @Success 200 {object} object{operation=string,cost=number,currency=string}
// @Failure 400 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/pricing/operation/{operation} [get]
func (h *PricingHandler) GetOperationPricing(c *gin.Context) {
	operation := c.Param("operation")

	if operation == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Operation parameter is required"})
		return
	}

	// Validate operation is supported
	validOperation := false
	for _, validOp := range constants.APIOperations {
		if validOp == operation {
			validOperation = true
			break
		}
	}

	if !validOperation {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":           "Invalid operation",
			"validOperations": constants.APIOperations,
		})
		return
	}

	cost := h.pricingService.GetOperationCost(operation)

	c.JSON(http.StatusOK, gin.H{
		"operation": operation,
		"cost":      cost,
		"currency":  "USD",
	})
}

// @Summary Get pricing calculator
// @Description Calculate cost for multiple operations (public endpoint)
// @Tags pricing
// @Accept json
// @Produce json
// @Param request body object{operations=[]object{operation=string,count=number}} true "Operations to calculate"
// @Success 200 {object} object{totalCost=number,breakdown=[]object,currency=string}
// @Failure 400 {object} object{error=string}
// @Failure 500 {object} object{error=string}
// @Router /api/pricing/calculate [post]
func (h *PricingHandler) CalculatePricing(c *gin.Context) {
	var request struct {
		Operations []struct {
			Operation string `json:"operation" binding:"required"`
			Count     int    `json:"count" binding:"required,min=1"`
		} `json:"operations" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	totalCost := 0.0
	breakdown := make([]map[string]interface{}, 0)

	for _, op := range request.Operations {
		// Validate operation
		validOperation := false
		for _, validOp := range constants.APIOperations {
			if validOp == op.Operation {
				validOperation = true
				break
			}
		}

		if !validOperation {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":           fmt.Sprintf("Invalid operation: %s", op.Operation),
				"validOperations": constants.APIOperations,
			})
			return
		}

		cost := h.pricingService.GetOperationCost(op.Operation)
		operationTotal := cost * float64(op.Count)
		totalCost += operationTotal

		breakdown = append(breakdown, map[string]interface{}{
			"operation": op.Operation,
			"count":     op.Count,
			"unitCost":  cost,
			"totalCost": operationTotal,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"totalCost": totalCost,
		"breakdown": breakdown,
		"currency":  "USD",
	})
}
