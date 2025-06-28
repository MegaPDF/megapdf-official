// 1. Fixed Settings Model for SQLite
// api/internal/models/app_setting.go
package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AppSetting represents a configurable application setting
type AppSetting struct {
	ID           string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Category     string    `json:"category" gorm:"type:varchar(100);not null;index"`
	Key          string    `json:"key" gorm:"type:varchar(255);not null;uniqueIndex"`
	Value        string    `json:"value" gorm:"type:text"`
	DefaultValue string    `json:"default_value" gorm:"type:text"`
	Type         string    `json:"type" gorm:"type:varchar(50);not null"` // string, int, bool, float, json, array
	Description  string    `json:"description" gorm:"type:text"`
	IsRequired   bool      `json:"is_required" gorm:"default:false"`
	IsSecret     bool      `json:"is_secret" gorm:"default:false"`
	IsReadOnly   bool      `json:"is_readonly" gorm:"default:false"`
	Validation   string    `json:"validation" gorm:"type:text"` // JSON validation rules as string
	Options      string    `json:"options" gorm:"type:text"`    // JSON array for select options as string
	Group        string    `json:"group" gorm:"type:varchar(100)"`
	Order        int       `json:"order" gorm:"default:0"`
	Metadata     string    `json:"metadata" gorm:"type:text"` // JSON metadata as string
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	CreatedBy    string    `json:"created_by" gorm:"type:varchar(36)"`
	UpdatedBy    string    `json:"updated_by" gorm:"type:varchar(36)"`
}

func (s *AppSetting) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = uuid.New().String()
	}
	s.CreatedAt = time.Now()
	s.UpdatedAt = time.Now()
	return nil
}

func (s *AppSetting) BeforeUpdate(tx *gorm.DB) error {
	s.UpdatedAt = time.Now()
	return nil
}

// GetTypedValue returns the value converted to the appropriate type
func (s *AppSetting) GetTypedValue() interface{} {
	value := s.Value
	if value == "" {
		value = s.DefaultValue
	}

	switch s.Type {
	case "bool":
		return value == "true"
	case "int":
		var result int
		json.Unmarshal([]byte(value), &result)
		return result
	case "float":
		var result float64
		json.Unmarshal([]byte(value), &result)
		return result
	case "json", "array":
		var result interface{}
		json.Unmarshal([]byte(value), &result)
		return result
	default:
		return value
	}
}

// SetValue sets the value with type conversion and validation
func (s *AppSetting) SetValue(value interface{}) error {
	switch s.Type {
	case "bool":
		if boolVal, ok := value.(bool); ok {
			if boolVal {
				s.Value = "true"
			} else {
				s.Value = "false"
			}
		} else {
			s.Value = value.(string)
		}
	case "json", "array":
		bytes, err := json.Marshal(value)
		if err != nil {
			return err
		}
		s.Value = string(bytes)
	default:
		bytes, err := json.Marshal(value)
		if err != nil {
			return err
		}
		// Remove quotes for simple types except strings
		if s.Type == "string" {
			s.Value = value.(string)
		} else {
			s.Value = string(bytes)
		}
	}
	return nil
}

// GetOptions returns parsed options for select fields
func (s *AppSetting) GetOptions() []map[string]interface{} {
	if s.Options == "" {
		return nil
	}
	
	var options []map[string]interface{}
	json.Unmarshal([]byte(s.Options), &options)
	return options
}

// GetValidationRules returns parsed validation rules
func (s *AppSetting) GetValidationRules() map[string]interface{} {
	if s.Validation == "" {
		return nil
	}
	
	var rules map[string]interface{}
	json.Unmarshal([]byte(s.Validation), &rules)
	return rules
}

// GetMetadata returns parsed metadata
func (s *AppSetting) GetMetadata() map[string]interface{} {
	if s.Metadata == "" {
		return make(map[string]interface{})
	}
	
	var metadata map[string]interface{}
	json.Unmarshal([]byte(s.Metadata), &metadata)
	return metadata
}

// SetMetadata sets metadata as JSON string
func (s *AppSetting) SetMetadata(metadata map[string]interface{}) error {
	bytes, err := json.Marshal(metadata)
	if err != nil {
		return err
	}
	s.Metadata = string(bytes)
	return nil
}

// SettingHistory tracks changes to settings
type SettingHistory struct {
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	SettingID string    `json:"setting_id" gorm:"type:varchar(36);index;not null"`
	OldValue  string    `json:"old_value" gorm:"type:text"`
	NewValue  string    `json:"new_value" gorm:"type:text"`
	ChangedBy string    `json:"changed_by" gorm:"type:varchar(36)"`
	Reason    string    `json:"reason" gorm:"type:text"`
	CreatedAt time.Time `json:"created_at"`
}

func (sh *SettingHistory) BeforeCreate(tx *gorm.DB) error {
	if sh.ID == "" {
		sh.ID = uuid.New().String()
	}
	sh.CreatedAt = time.Now()
	return nil
}
