package service

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"errors"
	"time"

	"gorm.io/gorm"
)

type WorkService struct{}

func NewWorkService() *WorkService {
	return &WorkService{}
}

func (s *WorkService) List(page, perPage int, status, lang string, categoryID *uint, featured *bool, search string) ([]dto.WorkResponse, int64, error) {
	var works []model.Work
	var total int64

	query := database.DB.Model(&model.Work{})

	// Status filter
	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	// Category filter
	if categoryID != nil {
		query = query.Where("category_id = ?", *categoryID)
	}

	// Featured filter
	if featured != nil {
		query = query.Where("featured = ?", *featured)
	}

	// Search filter
	if search != "" {
		query = query.Joins("JOIN work_translations wt ON wt.work_id = works.id").
			Where("wt.title LIKE ? OR wt.excerpt LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Count(&total)

	offset := (page - 1) * perPage
	err := query.Preload("Category.Translations").
		Preload("Translations").
		Preload("Tags.Translations").
		Order("sort_order ASC, date DESC").
		Offset(offset).Limit(perPage).
		Find(&works).Error
	if err != nil {
		return nil, 0, err
	}

	responses := make([]dto.WorkResponse, len(works))
	for i, w := range works {
		responses[i] = toWorkResponse(w, lang)
	}

	return responses, total, nil
}

func (s *WorkService) GetByID(id uint, lang string) (*dto.WorkResponse, error) {
	var work model.Work
	err := database.DB.Preload("Category.Translations").
		Preload("Translations").
		Preload("Tags.Translations").
		First(&work, id).Error
	if err != nil {
		return nil, err
	}

	resp := toWorkResponse(work, lang)
	return &resp, nil
}

func (s *WorkService) GetBySlug(slug, lang string) (*dto.WorkResponse, error) {
	var work model.Work
	err := database.DB.Preload("Category.Translations").
		Preload("Translations").
		Preload("Tags.Translations").
		Where("slug = ?", slug).First(&work).Error
	if err != nil {
		return nil, err
	}

	resp := toWorkResponse(work, lang)
	return &resp, nil
}

func (s *WorkService) Create(req dto.WorkCreateRequest, userID uint) (*dto.WorkResponse, error) {
	// Parse date
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		return nil, errors.New("invalid date format, use YYYY-MM-DD")
	}

	work := model.Work{
		Slug:           req.Slug,
		CategoryID:     req.CategoryID,
		CoverImageURL:  req.CoverImageURL,
		Gradient:       req.Gradient,
		Date:           date,
		Featured:       req.Featured,
		SortOrder:      req.SortOrder,
		Status:         req.Status,
		SeoTitle:       req.SeoTitle,
		SeoDescription: req.SeoDescription,
		SeoKeywords:    req.SeoKeywords,
		OgImage:        req.OgImage,
		VideoURL:       req.VideoURL,
		Link:           req.Link,
		CreatedBy:      &userID,
		UpdatedBy:      &userID,
	}

	if work.Status == "" {
		work.Status = "draft"
	}

	err = database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&work).Error; err != nil {
			return err
		}

		// Create translations
		for lang, t := range req.Translations {
			trans := model.WorkTranslation{
				WorkID:  work.ID,
				Lang:    lang,
				Title:   t.Title,
				Excerpt: t.Excerpt,
				Content: t.Content,
			}
			if err := tx.Create(&trans).Error; err != nil {
				return err
			}
		}

		// Associate tags
		if len(req.TagIDs) > 0 {
			for _, tagID := range req.TagIDs {
				tx.Create(&model.WorkTag{WorkID: work.ID, TagID: tagID})
			}
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return s.GetByID(work.ID, "")
}

func (s *WorkService) Update(id uint, req dto.WorkUpdateRequest, userID uint) (*dto.WorkResponse, error) {
	var work model.Work
	if err := database.DB.First(&work, id).Error; err != nil {
		return nil, errors.New("work not found")
	}

	// Build update map
	updates := map[string]interface{}{
		"updated_by": userID,
	}

	if req.CategoryID != nil {
		updates["category_id"] = req.CategoryID
	}
	if req.CoverImageURL != nil {
		updates["cover_image_url"] = *req.CoverImageURL
	}
	if req.Gradient != "" {
		updates["gradient"] = req.Gradient
	}
	if req.Date != "" {
		date, err := time.Parse("2006-01-02", req.Date)
		if err == nil {
			updates["date"] = date
		}
	}
	if req.Featured != nil {
		updates["featured"] = *req.Featured
	}
	if req.SortOrder != nil {
		updates["sort_order"] = *req.SortOrder
	}
	if req.Status != "" {
		updates["status"] = req.Status
		if req.Status == "published" && work.PublishedAt == nil {
			now := time.Now()
			updates["published_at"] = now
		}
	}
	if req.SeoTitle != "" {
		updates["seo_title"] = req.SeoTitle
	}
	if req.SeoDescription != "" {
		updates["seo_description"] = req.SeoDescription
	}
	if req.SeoKeywords != "" {
		updates["seo_keywords"] = req.SeoKeywords
	}
	if req.OgImage != "" {
		updates["og_image"] = req.OgImage
	}
	if req.VideoURL != "" {
		updates["video_url"] = req.VideoURL
	}
	if req.Link != "" {
		updates["link"] = req.Link
	}

	// Snapshot before update for revision
	revisionSvc := NewRevisionService()
	preSnapshot := buildWorkSnapshot(work)

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&work).Updates(updates).Error; err != nil {
			return err
		}

		// Create revision
		_ = revisionSvc.CreateRevision(tx, "work", work.ID, preSnapshot, "Updated", userID)

		// Update translations
		for lang, t := range req.Translations {
			var trans model.WorkTranslation
			result := tx.Where("work_id = ? AND lang = ?", work.ID, lang).First(&trans)
			if result.Error == gorm.ErrRecordNotFound {
				tx.Create(&model.WorkTranslation{
					WorkID:  work.ID,
					Lang:    lang,
					Title:   t.Title,
					Excerpt: t.Excerpt,
					Content: t.Content,
				})
			} else {
				tx.Model(&trans).Updates(map[string]interface{}{
					"title":   t.Title,
					"excerpt": t.Excerpt,
					"content": t.Content,
				})
			}
		}

		// Update tags
		if req.TagIDs != nil {
			tx.Where("work_id = ?", work.ID).Delete(&model.WorkTag{})
			for _, tagID := range req.TagIDs {
				tx.Create(&model.WorkTag{WorkID: work.ID, TagID: tagID})
			}
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return s.GetByID(work.ID, "")
}

func (s *WorkService) Delete(id uint) error {
	return database.DB.Delete(&model.Work{}, id).Error
}

func (s *WorkService) Publish(id uint) error {
	now := time.Now()
	return database.DB.Model(&model.Work{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":       "published",
		"published_at": now,
	}).Error
}

func (s *WorkService) Unpublish(id uint) error {
	return database.DB.Model(&model.Work{}).Where("id = ?", id).Update("status", "draft").Error
}

func (s *WorkService) BatchDelete(ids []uint) error {
	return database.DB.Where("id IN ?", ids).Delete(&model.Work{}).Error
}

func (s *WorkService) BatchPublish(ids []uint) error {
	now := time.Now()
	return database.DB.Model(&model.Work{}).Where("id IN ?", ids).Updates(map[string]interface{}{
		"status":       "published",
		"published_at": now,
	}).Error
}

func (s *WorkService) BatchUnpublish(ids []uint) error {
	return database.DB.Model(&model.Work{}).Where("id IN ?", ids).Update("status", "draft").Error
}

func (s *WorkService) SchedulePublish(id uint, publishAt time.Time) error {
	return database.DB.Model(&model.Work{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":       "scheduled",
		"published_at": publishAt,
	}).Error
}

// CheckAndPublishScheduled publishes all scheduled works whose publish time has passed
func (s *WorkService) CheckAndPublishScheduled() error {
	now := time.Now()
	return database.DB.Model(&model.Work{}).
		Where("status = 'scheduled' AND published_at IS NOT NULL AND published_at <= ?", now).
		Update("status", "published").Error
}

func toWorkResponse(w model.Work, lang string) dto.WorkResponse {
	resp := dto.WorkResponse{
		ID:            w.ID,
		Slug:          w.Slug,
		CoverImageURL: w.CoverImageURL,
		Gradient:      w.Gradient,
		Date:          w.Date,
		Featured:      w.Featured,
		SortOrder:     w.SortOrder,
		Status:        w.Status,
		PublishedAt:   w.PublishedAt,
		Translations:  make(map[string]dto.TranslationData),
		VideoURL:      w.VideoURL,
		Link:          w.Link,
		CreatedAt:     w.CreatedAt,
		UpdatedAt:     w.UpdatedAt,
	}

	// Category
	if w.Category != nil && w.Category.ID > 0 {
		name := ""
		if len(w.Category.Translations) > 0 {
			for _, t := range w.Category.Translations {
				if t.Lang == "en" {
					name = t.Name
				}
			}
			if name == "" {
				name = w.Category.Translations[0].Name
			}
		}
		resp.Category = &dto.CategoryBrief{
			ID:   w.Category.ID,
			Slug: w.Category.Slug,
			Name: name,
		}
	}

	// Translations
	for _, t := range w.Translations {
		resp.Translations[t.Lang] = dto.TranslationData{
			Title:   t.Title,
			Excerpt: t.Excerpt,
			Content: t.Content,
		}
	}

	// Tags
	resp.Tags = make([]dto.TagBrief, 0, len(w.Tags))
	for _, tag := range w.Tags {
		name := tag.Slug
		for _, t := range tag.Translations {
			if t.Lang == "en" {
				name = t.Name
				break
			}
		}
		resp.Tags = append(resp.Tags, dto.TagBrief{
			ID:   tag.ID,
			Slug: tag.Slug,
			Name: name,
		})
	}

	// SEO
	resp.Seo = dto.SeoData{
		Title:       w.SeoTitle,
		Description: w.SeoDescription,
		Keywords:    w.SeoKeywords,
		OgImage:     w.OgImage,
	}

	return resp
}
