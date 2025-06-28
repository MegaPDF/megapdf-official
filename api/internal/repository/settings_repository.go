package repository

import (
	"github.com/MegaPDF/megapdf-official/api/internal/models"
	"gorm.io/gorm"
)

type SettingsRepository struct {
	db *gorm.DB
}

func NewSettingsRepository(db *gorm.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

func (r *SettingsRepository) GetByKey(key string) (*models.AppSetting, error) {
	var setting models.AppSetting
	err := r.db.Where("key = ?", key).First(&setting).Error
	return &setting, err
}

func (r *SettingsRepository) GetByCategory(category string) ([]models.AppSetting, error) {
	var settings []models.AppSetting
	err := r.db.Where("category = ?", category).Order("key").Find(&settings).Error
	return settings, err
}

func (r *SettingsRepository) GetAll() ([]models.AppSetting, error) {
	var settings []models.AppSetting
	err := r.db.Order("category, key").Find(&settings).Error
	return settings, err
}

func (r *SettingsRepository) CreateOrUpdate(setting *models.AppSetting) error {
	var existing models.AppSetting
	err := r.db.Where("key = ?", setting.Key).First(&existing).Error

	if err == gorm.ErrRecordNotFound {
		return r.db.Create(setting).Error
	} else if err != nil {
		return err
	}

	// Update existing
	existing.Value = setting.Value
	existing.UpdatedAt = setting.UpdatedAt
	return r.db.Save(&existing).Error
}

func (r *SettingsRepository) BulkUpdate(settings []models.AppSetting) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		for _, setting := range settings {
			if err := r.CreateOrUpdate(&setting); err != nil {
				return err
			}
		}
		return nil
	})
}
