// internal/services/balance_service.go
package services

import (
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/MegaPDF/megapdf-official/api/internal/constants"
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"github.com/MegaPDF/megapdf-official/api/internal/repository"
	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type BalanceService struct {
	db *gorm.DB
}

type OperationResult struct {
	Success                 bool
	UsedFreeOperation       bool
	FreeOperationsRemaining int
	CurrentBalance          float64
	OperationCost           float64
	Error                   string
}

func NewBalanceService(db *gorm.DB) *BalanceService {
	return &BalanceService{db: db}
}

// ProcessOperation charges a user for an operation
func (s *BalanceService) ProcessOperation(userID string, operation string) (*OperationResult, error) {
	// Create variable for result
	var result OperationResult
	if userID == "website-user" {
		// Return success without any database queries
		return &OperationResult{
			Success:                 true,
			UsedFreeOperation:       true,
			FreeOperationsRemaining: 999,
			CurrentBalance:          9999.0,
			OperationCost:           0,
			Error:                   "",
		}, nil
	}
	// Get the operation cost BEFORE entering transaction
	operationCost := s.getOperationCost(operation)
	fmt.Printf("PRICING: Operation '%s' cost set to %.6f\n", operation, operationCost)

	// Check for double charging by looking for recent transactions
	var recentTx string
	s.db.Raw("SELECT id FROM transactions WHERE user_id = ? AND created_at > ? AND description LIKE ?",
		userID, time.Now().Add(-5*time.Second), "Operation: "+operation+"%").Scan(&recentTx)
	if recentTx != "" {
		fmt.Printf("WARNING: Possible duplicate operation detected for user %s (operation %s)\n",
			userID, operation)
	}

	// Get original balance for verification
	var originalBalance float64
	if err := s.db.Raw("SELECT balance FROM users WHERE id = ?", userID).Scan(&originalBalance).Error; err != nil {
		return nil, fmt.Errorf("failed to get initial balance: %w", err)
	}
	fmt.Printf("BALANCE: Starting balance for user %s: %.6f\n", userID, originalBalance)

	// Start transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, fmt.Errorf("failed to start transaction: %w", tx.Error)
	}

	// Get user with FOR UPDATE lock to prevent race conditions
	var user models.User
	if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("id = ?", userID).First(&user).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("user not found: %w", err)
	}

	// Check for free operations reset
	now := time.Now()
	freeOpsReset := user.FreeOperationsReset
	freeOpsUsed := user.FreeOperationsUsed
	freeOperationsLimit := constants.DEFAULT_FREE_OPERATIONS_MONTHLY

	// Try to get from pricing settings
	pricingRepo := repository.NewPricingRepository()
	if pricing, err := pricingRepo.GetPricingSettings(); err == nil {
		freeOperationsLimit = pricing.FreeOperationsMonthly
	}

	// Check if reset date has passed
	if freeOpsReset.Before(now) {
		// Calculate new reset date
		nextMonth := now.AddDate(0, 1, 0)
		resetDate := time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.UTC)

		fmt.Printf("FREOPS: Resetting free operations for user %s (old: %d)\n", userID, freeOpsUsed)

		// Update the reset date and used count via SQL to prevent model issues
		if err := tx.Exec("UPDATE users SET free_operations_used = 0, free_operations_reset = ? WHERE id = ?",
			resetDate, userID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to reset free operations: %w", err)
		}

		// Update local variables
		freeOpsUsed = 0
	}

	// Check if we should use free operation
	if freeOpsUsed < freeOperationsLimit {
		// Use free operation
		fmt.Printf("FREOPS: Using free operation for user %s (%d -> %d)\n", userID, freeOpsUsed, freeOpsUsed+1)

		// Update free operations directly with SQL
		if err := tx.Exec("UPDATE users SET free_operations_used = free_operations_used + 1 WHERE id = ?",
			userID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to update free operations: %w", err)
		}

		// Verify update
		var freeOpsVerify int
		if err := tx.Raw("SELECT free_operations_used FROM users WHERE id = ?", userID).Scan(&freeOpsVerify).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to verify free ops update: %w", err)
		}
		fmt.Printf("FREOPS: Verified free operations update: %d\n", freeOpsVerify)

		// Track operation
		if err := s.trackOperationUsage(tx, userID, operation); err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to track usage: %w", err)
		}

		// Create transaction record for the free operation
		freeTransaction := models.Transaction{
			ID:           uuid.New().String(),
			UserID:       userID,
			Amount:       0,               // No cost for free operation
			BalanceAfter: originalBalance, // Balance remains unchanged
			Description:  fmt.Sprintf("Operation: %s (Free)", operation),
			Status:       "completed",
			CreatedAt:    time.Now(),
		}

		if err := tx.Create(&freeTransaction).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create transaction record: %w", err)
		}

		// Commit transaction
		if err := tx.Commit().Error; err != nil {
			return nil, fmt.Errorf("failed to commit transaction: %w", err)
		}

		// Success with free operation
		result = OperationResult{
			Success:                 true,
			UsedFreeOperation:       true,
			FreeOperationsRemaining: freeOperationsLimit - (freeOpsUsed + 1),
			CurrentBalance:          originalBalance, // Unchanged
			OperationCost:           operationCost,
		}
	} else {
		// Use balance
		fmt.Printf("BALANCE: Using balance for user %s (%.6f - %.6f)\n", userID, originalBalance, operationCost)

		// Check if balance is sufficient
		if originalBalance < operationCost {
			tx.Rollback()
			return &OperationResult{
				Success:                 false,
				UsedFreeOperation:       false,
				FreeOperationsRemaining: 0,
				CurrentBalance:          originalBalance,
				OperationCost:           operationCost,
				Error:                   "Insufficient balance",
			}, nil
		}

		// Calculate new balance - use exact arithmetic to avoid floating point issues
		newBalanceExact := decimal.NewFromFloat(originalBalance).Sub(decimal.NewFromFloat(operationCost))
		newBalance, _ := newBalanceExact.Round(3).Float64()

		// Update balance using DIRECT SQL - IMPORTANT: This is the ONLY place we update balance
		if err := tx.Exec("UPDATE users SET balance = ? WHERE id = ?", newBalance, userID).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to update balance: %w", err)
		}

		// Verify the update immediately
		var verifiedBalance float64
		if err := tx.Raw("SELECT balance FROM users WHERE id = ?", userID).Scan(&verifiedBalance).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to verify balance update: %w", err)
		}

		// Check if balance was updated correctly
		if math.Abs(verifiedBalance-newBalance) > 0.0001 {
			tx.Rollback()
			return nil, fmt.Errorf("balance not updated correctly: expected %.6f, got %.6f",
				newBalance, verifiedBalance)
		}

		fmt.Printf("BALANCE: Verified balance update: %.6f -> %.6f\n", originalBalance, verifiedBalance)

		// Track operation
		if err := s.trackOperationUsage(tx, userID, operation); err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to track usage: %w", err)
		}

		// Create transaction record
		balanceTransaction := models.Transaction{
			ID:           uuid.New().String(),
			UserID:       userID,
			Amount:       -operationCost,
			BalanceAfter: newBalance,
			Description:  "Operation: " + operation,
			Status:       "completed",
			CreatedAt:    time.Now(),
		}

		if err := tx.Create(&balanceTransaction).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create transaction record: %w", err)
		}

		// Commit transaction
		if err := tx.Commit().Error; err != nil {
			return nil, fmt.Errorf("failed to commit transaction: %w", err)
		}

		// Success with balance
		result = OperationResult{
			Success:                 true,
			UsedFreeOperation:       false,
			FreeOperationsRemaining: 0,
			CurrentBalance:          newBalance,
			OperationCost:           operationCost,
		}
	}

	// Final verification after commit
	var finalBalance float64
	if err := s.db.Raw("SELECT balance FROM users WHERE id = ?", userID).Scan(&finalBalance).Error; err == nil {
		fmt.Printf("FINAL: Balance after commit: %.6f\n", finalBalance)

		// Check for expected balance
		expectedBalance := originalBalance
		if !result.UsedFreeOperation {
			expectedBalance = decimal.NewFromFloat(originalBalance).Sub(decimal.NewFromFloat(operationCost)).Round(6).InexactFloat64()
		}

		if math.Abs(finalBalance-expectedBalance) > 0.0001 {
			fmt.Printf("CRITICAL ERROR: Balance not updated correctly: expected %.6f, got %.6f\n",
				expectedBalance, finalBalance)
		} else {
			fmt.Printf("SUCCESS: Balance correctly updated to %.6f\n", finalBalance)
		}
	}

	return &result, nil
}

// trackOperationUsage records the operation in usage stats
func (s *BalanceService) trackOperationUsage(tx *gorm.DB, userID string, operation string) error {
	// Get today's date without time
	today := time.Now()
	today = time.Date(today.Year(), today.Month(), today.Day(), 0, 0, 0, 0, time.UTC)

	// Find existing record
	var usageStat models.UsageStats
	result := tx.Where("user_id = ? AND operation = ? AND date = ?", userID, operation, today).First(&usageStat)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Create new record if not found
		fmt.Printf("USAGE: Creating new usage stat for %s operation on %s\n", operation, today.Format("2006-01-02"))

		usageStat = models.UsageStats{
			ID:        uuid.New().String(),
			UserID:    userID,
			Operation: operation,
			Count:     1,
			Date:      today,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}

		return tx.Create(&usageStat).Error
	} else if result.Error != nil {
		return result.Error
	}

	// Update existing record using direct SQL to avoid model issues
	fmt.Printf("USAGE: Updating existing usage stat for %s operation on %s (count: %d -> %d)\n",
		operation, today.Format("2006-01-02"), usageStat.Count, usageStat.Count+1)

	return tx.Model(&usageStat).Updates(map[string]interface{}{
		"count":      usageStat.Count + 1,
		"updated_at": time.Now(),
	}).Error
}

// GetBalance returns a user's balance information
func (s *BalanceService) GetBalance(userID string) (map[string]interface{}, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	// Get recent transactions
	var transactions []models.Transaction
	if err := s.db.Where("user_id = ?", userID).Order("created_at desc").Limit(10).Find(&transactions).Error; err != nil {
		return nil, err
	}

	// Check if free operations reset date has passed
	now := time.Now()
	freeOpsUsed := user.FreeOperationsUsed
	resetDate := user.FreeOperationsReset

	// Get free operations limit from pricing settings
	freeOperationsLimit := constants.DEFAULT_FREE_OPERATIONS_MONTHLY
	pricingRepo := repository.NewPricingRepository()
	if pricing, err := pricingRepo.GetPricingSettings(); err == nil {
		freeOperationsLimit = pricing.FreeOperationsMonthly
	}

	if resetDate.Before(now) {
		// Reset would happen on next operation, but for display we show as reset
		freeOpsUsed = 0
		nextMonth := now.AddDate(0, 1, 0)
		resetDate = time.Date(nextMonth.Year(), nextMonth.Month(), 1, 0, 0, 0, 0, time.Local)
	}

	// Get usage statistics for current month
	firstDayOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.Local)
	var usageStats []models.UsageStats
	if err := s.db.Where("user_id = ? AND date >= ?", userID, firstDayOfMonth).Find(&usageStats).Error; err != nil {
		return nil, err
	}

	// Calculate total operations and operation counts
	totalOperations := 0
	operationCounts := make(map[string]int)
	for _, stat := range usageStats {
		totalOperations += stat.Count
		operationCounts[stat.Operation] += stat.Count
	}

	// Format transactions for response
	formattedTransactions := make([]map[string]interface{}, len(transactions))
	for i, tx := range transactions {
		// Format the amount properly for display
		var formattedAmount string
		if tx.Amount == 0 {
			formattedAmount = "Free" // Or "+0.000 (Free)"
		} else if tx.Amount > 0 {
			formattedAmount = fmt.Sprintf("+%.3f", tx.Amount)
		} else {
			formattedAmount = fmt.Sprintf("%.3f", tx.Amount)
		}

		// Create transaction record for response
		formattedTransactions[i] = map[string]interface{}{
			"id":            tx.ID,
			"amount":        tx.Amount,       // Raw amount
			"displayAmount": formattedAmount, // Formatted for display
			"balanceAfter":  tx.BalanceAfter,
			"description":   tx.Description,
			"status":        tx.Status,
			"createdAt":     tx.CreatedAt,
			"isFree":        tx.Amount == 0, // Add flag to indicate free operations
		}
	}

	return map[string]interface{}{
		"success":                 true,
		"balance":                 user.Balance,
		"freeOperationsUsed":      freeOpsUsed,
		"freeOperationsRemaining": freeOperationsLimit - freeOpsUsed,
		"freeOperationsTotal":     freeOperationsLimit,
		"nextResetDate":           resetDate,
		"transactions":            formattedTransactions,
		"totalOperations":         totalOperations,
		"operationCounts":         operationCounts,
	}, nil
}

// CreateDeposit creates a pending deposit for a user
func (s *BalanceService) CreateDeposit(userID string, amount float64, paymentID string) (*models.Transaction, error) {
	// Get user's current balance
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, err
	}

	// Create transaction record
	transaction := models.Transaction{
		ID:           uuid.New().String(),
		UserID:       userID,
		Amount:       amount,
		BalanceAfter: user.Balance + amount, // This will be updated when completed
		Description:  "Deposit - pending",
		PaymentID:    paymentID,
		Status:       "pending",
		CreatedAt:    time.Now(),
	}

	if err := s.db.Create(&transaction).Error; err != nil {
		return nil, err
	}

	return &transaction, nil
}

// In the CompleteDeposit method of BalanceService
func (s *BalanceService) CompleteDeposit(paymentID string) error {
	return s.db.Transaction(func(tx *gorm.DB) error {
		// Find the pending transaction
		var transaction models.Transaction
		if err := tx.Where("payment_id = ? AND status = ?", paymentID, "pending").First(&transaction).Error; err != nil {
			return err
		}

		// Log for debugging
		fmt.Printf("Found pending transaction - ID: %s, Amount: %f\n", transaction.ID, transaction.Amount)

		// Get current user balance
		var user models.User
		if err := tx.First(&user, "id = ?", transaction.UserID).Error; err != nil {
			return err
		}

		// Log for debugging
		fmt.Printf("User current balance: %f\n", user.Balance)

		// Calculate new balance
		newBalance := user.Balance + transaction.Amount

		// Log for debugging
		fmt.Printf("New calculated balance: %f\n", newBalance)

		// Update user balance
		if err := tx.Model(&user).Update("balance", newBalance).Error; err != nil {
			return err
		}

		// Update transaction
		return tx.Model(&transaction).Updates(map[string]interface{}{
			"status":        "completed",
			"description":   "Deposit - completed",
			"balance_after": newBalance,
		}).Error
	})
}

// getOperationCost returns the cost for an operation
func (s *BalanceService) getOperationCost(operation string) float64 {
	fmt.Printf("PRICING: Getting operation cost for '%s'\n", operation)

	// Get pricing info
	pricingRepo := repository.NewPricingRepository()
	pricing, err := pricingRepo.GetPricingSettings()
	if err != nil {
		fmt.Printf("PRICING ERROR: Failed to get pricing settings: %v, using default 0.005\n", err)
		return 0.005 // Safe default
	}

	// Debug all pricing settings
	fmt.Printf("PRICING: Global price: %.6f, Custom prices: %+v\n", pricing.OperationCost, pricing.CustomPrices)

	// Check for custom price
	if customPrice, ok := pricing.CustomPrices[operation]; ok {
		fmt.Printf("PRICING: Found custom price for '%s': %.6f\n", operation, customPrice)

		// Safety check - prevent unreasonable custom prices
		if customPrice > 100.0 || customPrice < 0.0001 {
			fmt.Printf("PRICING WARNING: Custom price for '%s' is extremely unreasonable (%.6f), using global price\n",
				operation, customPrice)
			return pricing.OperationCost
		}

		return customPrice
	}

	// Use global price
	fmt.Printf("PRICING: Using global price for '%s': %.6f\n", operation, pricing.OperationCost)

	// Safety check for global price
	if pricing.OperationCost != 0.005 {
		fmt.Printf("PRICING NOTE: Global price is not 0.005, it's %.6f\n", pricing.OperationCost)
	}

	return pricing.OperationCost
}
