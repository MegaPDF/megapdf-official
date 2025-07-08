package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// PricingSetting model for database
type PricingSetting struct {
	ID          string `gorm:"primaryKey;type:varchar(100)"`
	Key         string `gorm:"uniqueIndex;type:varchar(255)"`
	Value       string `gorm:"type:json"` // Using JSON type for SQLite
	Description string `gorm:"type:text"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// CustomPricing stores operation-specific pricing
type CustomPricing struct {
	OperationCost         float64            `json:"operationCost"`
	FreeOperationsMonthly int                `json:"freeOperationsMonthly"`
	CustomPrices          map[string]float64 `json:"customPrices"`
}

// Implement the driver.Valuer interface
func (cp CustomPricing) Value() (driver.Value, error) {
	return json.Marshal(cp)
}

// Implement the sql.Scanner interface
func (cp *CustomPricing) Scan(value interface{}) error {
	var bytes []byte

	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("type assertion to []byte or string failed")
	}

	return json.Unmarshal(bytes, &cp)
}
