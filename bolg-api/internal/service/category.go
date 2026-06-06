package service

import (
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"errors"

	"gorm.io/gorm"
)

type CategoryService struct{}

func NewCategoryService() *CategoryService {
	return &CategoryService{}
}

func (s *CategoryService) List(lang string, status string) ([]model.Category, error) {
	var categories []model.Category
	query := database.DB.Preload("Translations")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	err := query.Order("sort_order ASC").Find(&categories).Error
	return categories, err
}

func (s *CategoryService) GetByID(id uint) (*model.Category, error) {
	var category model.Category
	err := database.DB.Preload("Translations").First(&category, id).Error
	return &category, err
}

func (s *CategoryService) Create(slug, iconName, color, coverImageURL string, parentID *uint, sortOrder int, translations map[string]map[string]string) (*model.Category, error) {
	category := model.Category{
		Slug:          slug,
		IconName:      iconName,
		Color:         color,
		CoverImageURL: coverImageURL,
		ParentID:      parentID,
		SortOrder:     sortOrder,
		Status:        "active",
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&category).Error; err != nil {
			return err
		}

		for lang, data := range translations {
			trans := model.CategoryTranslation{
				CategoryID:  category.ID,
				Lang:        lang,
				Name:        data["name"],
				Description: data["description"],
			}
			if err := tx.Create(&trans).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return s.GetByID(category.ID)
}

func (s *CategoryService) Update(id uint, updates map[string]interface{}, translations map[string]map[string]string) (*model.Category, error) {
	var category model.Category
	if err := database.DB.First(&category, id).Error; err != nil {
		return nil, errors.New("category not found")
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if len(updates) > 0 {
			if err := tx.Model(&category).Updates(updates).Error; err != nil {
				return err
			}
		}

		for lang, data := range translations {
			var trans model.CategoryTranslation
			result := tx.Where("category_id = ? AND lang = ?", category.ID, lang).First(&trans)
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				if err := tx.Create(&model.CategoryTranslation{
					CategoryID:  category.ID,
					Lang:        lang,
					Name:        data["name"],
					Description: data["description"],
				}).Error; err != nil {
					return err
				}
			} else {
				if err := tx.Model(&trans).Updates(map[string]interface{}{
					"name":        data["name"],
					"description": data["description"],
				}).Error; err != nil {
					return err
				}
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return s.GetByID(id)
}

func (s *CategoryService) Delete(id uint) error {
	return database.DB.Delete(&model.Category{}, id).Error
}

func (s *CategoryService) BatchDelete(ids []uint) error {
	return database.DB.Where("id IN ?", ids).Delete(&model.Category{}).Error
}
