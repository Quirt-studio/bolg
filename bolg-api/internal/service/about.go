package service

import (
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"errors"

	"gorm.io/gorm"
)

type AboutService struct{}

func NewAboutService() *AboutService {
	return &AboutService{}
}

func (s *AboutService) GetSections() ([]model.AboutSection, error) {
	var sections []model.AboutSection
	err := database.DB.Preload("Translations").Order("sort_order ASC").Find(&sections).Error
	return sections, err
}

func (s *AboutService) GetSectionByID(id uint) (*model.AboutSection, error) {
	var section model.AboutSection
	err := database.DB.Preload("Translations").First(&section, id).Error
	return &section, err
}

func (s *AboutService) UpdateSection(id uint, translations map[string]model.JSONContent) (*model.AboutSection, error) {
	var section model.AboutSection
	if err := database.DB.First(&section, id).Error; err != nil {
		return nil, errors.New("section not found")
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		for lang, content := range translations {
			var trans model.AboutTranslation
			result := tx.Where("section_id = ? AND lang = ?", section.ID, lang).First(&trans)
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				tx.Create(&model.AboutTranslation{
					SectionID: section.ID, Lang: lang,
					Title: content["title"].(string), Content: content,
				})
			} else {
				tx.Model(&trans).Updates(map[string]interface{}{
					"title":   content["title"],
					"content": content,
				})
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return s.GetSectionByID(id)
}
