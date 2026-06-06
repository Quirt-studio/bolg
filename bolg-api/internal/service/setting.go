package service

import (
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"errors"

	"gorm.io/gorm"
)

type SettingService struct{}

func NewSettingService() *SettingService {
	return &SettingService{}
}

func (s *SettingService) GetAll() (map[string]model.JSONContent, error) {
	var settings []model.SiteSetting
	if err := database.DB.Find(&settings).Error; err != nil {
		return nil, err
	}

	result := make(map[string]model.JSONContent)
	for _, setting := range settings {
		result[setting.SettingKey] = setting.SettingValue
	}
	return result, nil
}

func (s *SettingService) GetByKey(key string) (*model.SiteSetting, error) {
	var setting model.SiteSetting
	err := database.DB.Where("setting_key = ?", key).First(&setting).Error
	return &setting, err
}

func (s *SettingService) Update(key string, value model.JSONContent, userID uint) (*model.SiteSetting, error) {
	var setting model.SiteSetting
	result := database.DB.Where("setting_key = ?", key).First(&setting)

	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		// Create new
		setting = model.SiteSetting{
			SettingKey:   key,
			SettingValue: value,
			UpdatedBy:    &userID,
		}
		if err := database.DB.Create(&setting).Error; err != nil {
			return nil, err
		}
	} else {
		// Update existing
		if err := database.DB.Model(&setting).Updates(map[string]interface{}{
			"setting_value": value,
			"updated_by":    userID,
		}).Error; err != nil {
			return nil, err
		}
	}

	return s.GetByKey(key)
}
