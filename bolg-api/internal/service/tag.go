package service

import (
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"errors"

	"gorm.io/gorm"
)

type TagService struct{}

func NewTagService() *TagService {
	return &TagService{}
}

func (s *TagService) List(lang string) ([]model.Tag, error) {
	var tags []model.Tag
	err := database.DB.Preload("Translations").Find(&tags).Error
	return tags, err
}

func (s *TagService) GetByID(id uint) (*model.Tag, error) {
	var tag model.Tag
	err := database.DB.Preload("Translations").First(&tag, id).Error
	return &tag, err
}

func (s *TagService) Create(slug string, translations map[string]map[string]string) (*model.Tag, error) {
	tag := model.Tag{Slug: slug}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&tag).Error; err != nil {
			return err
		}

		for lang, data := range translations {
			trans := model.TagTranslation{
				TagID: tag.ID,
				Lang:  lang,
				Name:  data["name"],
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

	return s.GetByID(tag.ID)
}

func (s *TagService) Update(id uint, translations map[string]map[string]string) (*model.Tag, error) {
	var tag model.Tag
	if err := database.DB.First(&tag, id).Error; err != nil {
		return nil, errors.New("tag not found")
	}

	for lang, data := range translations {
		var trans model.TagTranslation
		result := database.DB.Where("tag_id = ? AND lang = ?", tag.ID, lang).First(&trans)
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			database.DB.Create(&model.TagTranslation{
				TagID: tag.ID,
				Lang:  lang,
				Name:  data["name"],
			})
		} else {
			database.DB.Model(&trans).Update("name", data["name"])
		}
	}

	return s.GetByID(id)
}

func (s *TagService) Delete(id uint) error {
	return database.DB.Delete(&model.Tag{}, id).Error
}

func (s *TagService) BatchDelete(ids []uint) error {
	return database.DB.Where("id IN ?", ids).Delete(&model.Tag{}).Error
}
