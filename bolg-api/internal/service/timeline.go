package service

import (
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"errors"
	"time"

	"gorm.io/gorm"
)

type TimelineService struct{}

func NewTimelineService() *TimelineService {
	return &TimelineService{}
}

func (s *TimelineService) List(status string) ([]model.TimelineMilestone, error) {
	var milestones []model.TimelineMilestone
	query := database.DB.Preload("Translations")
	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}
	err := query.Order("`date` DESC, sort_order ASC").Find(&milestones).Error
	return milestones, err
}

func (s *TimelineService) GetByID(id uint) (*model.TimelineMilestone, error) {
	var m model.TimelineMilestone
	err := database.DB.Preload("Translations").First(&m, id).Error
	return &m, err
}

func (s *TimelineService) Create(dateStr, iconName string, sortOrder int, status string, translations map[string]map[string]string) (*model.TimelineMilestone, error) {
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return nil, errors.New("invalid date format")
	}

	milestone := model.TimelineMilestone{
		Date:      date,
		IconName:  iconName,
		SortOrder: sortOrder,
		Status:    status,
	}
	if milestone.Status == "" {
		milestone.Status = "published"
	}

	err = database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&milestone).Error; err != nil {
			return err
		}
		for lang, data := range translations {
			if err := tx.Create(&model.TimelineTranslation{
				MilestoneID: milestone.ID,
				Lang:        lang,
				Title:       data["title"],
				Description: data["description"],
			}).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return s.GetByID(milestone.ID)
}

func (s *TimelineService) Update(id uint, updates map[string]interface{}, translations map[string]map[string]string) (*model.TimelineMilestone, error) {
	var milestone model.TimelineMilestone
	if err := database.DB.First(&milestone, id).Error; err != nil {
		return nil, errors.New("milestone not found")
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if len(updates) > 0 {
			if err := tx.Model(&milestone).Updates(updates).Error; err != nil {
				return err
			}
		}
		for lang, data := range translations {
			var trans model.TimelineTranslation
			result := tx.Where("milestone_id = ? AND lang = ?", milestone.ID, lang).First(&trans)
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				tx.Create(&model.TimelineTranslation{
					MilestoneID: milestone.ID, Lang: lang,
					Title: data["title"], Description: data["description"],
				})
			} else {
				tx.Model(&trans).Updates(map[string]interface{}{
					"title": data["title"], "description": data["description"],
				})
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return s.GetByID(id)
}

func (s *TimelineService) Delete(id uint) error {
	return database.DB.Delete(&model.TimelineMilestone{}, id).Error
}
