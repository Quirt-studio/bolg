package service

import (
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"fmt"

	"gorm.io/gorm"
)

type RevisionService struct{}

func NewRevisionService() *RevisionService {
	return &RevisionService{}
}

// CreateRevision creates a snapshot of the current entity state
func (s *RevisionService) CreateRevision(tx *gorm.DB, entityType string, entityID uint, snapshot map[string]interface{}, summary string, userID uint) error {
	// Get next revision number
	var maxNum int
	tx.Model(&model.ContentRevision{}).
		Where("entity_type = ? AND entity_id = ?", entityType, entityID).
		Select("COALESCE(MAX(revision_number), 0)").Scan(&maxNum)

	revision := model.ContentRevision{
		EntityType:     entityType,
		EntityID:       entityID,
		RevisionNumber: maxNum + 1,
		Snapshot:       model.JSONContent(snapshot),
		ChangeSummary:  summary,
		CreatedBy:      &userID,
	}

	return tx.Create(&revision).Error
}

// ListRevisions returns revision history for an entity
func (s *RevisionService) ListRevisions(entityType string, entityID uint, page, perPage int) ([]model.ContentRevision, int64, error) {
	var revisions []model.ContentRevision
	var total int64

	query := database.DB.Model(&model.ContentRevision{}).
		Where("entity_type = ? AND entity_id = ?", entityType, entityID)

	query.Count(&total)

	offset := (page - 1) * perPage
	err := query.Order("revision_number DESC").
		Offset(offset).Limit(perPage).
		Find(&revisions).Error

	return revisions, total, err
}

// GetRevision returns a single revision by ID
func (s *RevisionService) GetRevision(id uint) (*model.ContentRevision, error) {
	var revision model.ContentRevision
	err := database.DB.First(&revision, id).Error
	if err != nil {
		return nil, err
	}
	return &revision, nil
}

// Rollback restores an entity to a previous revision's snapshot
func (s *RevisionService) Rollback(entityType string, revisionID uint, userID uint) error {
	var revision model.ContentRevision
	if err := database.DB.First(&revision, revisionID).Error; err != nil {
		return fmt.Errorf("revision not found: %w", err)
	}

	if revision.EntityType != entityType {
		return fmt.Errorf("revision type mismatch: expected %s, got %s", entityType, revision.EntityType)
	}

	// Create a new revision from the rollback (before applying)
	switch entityType {
	case "work":
		var work model.Work
		if err := database.DB.First(&work, revision.EntityID).Error; err != nil {
			return fmt.Errorf("entity not found: %w", err)
		}
		snapshot := buildWorkSnapshot(work)
		if err := s.CreateRevision(database.DB, entityType, revision.EntityID, snapshot, "Before rollback", userID); err != nil {
			return err
		}

		return database.DB.Transaction(func(tx *gorm.DB) error {
			return applyWorkSnapshot(tx, revision.EntityID, revision.Snapshot, userID)
		})

	case "post":
		var post model.Post
		if err := database.DB.First(&post, revision.EntityID).Error; err != nil {
			return fmt.Errorf("entity not found: %w", err)
		}
		snapshot := buildPostSnapshot(post)
		if err := s.CreateRevision(database.DB, entityType, revision.EntityID, snapshot, "Before rollback", userID); err != nil {
			return err
		}

		return database.DB.Transaction(func(tx *gorm.DB) error {
			return applyPostSnapshot(tx, revision.EntityID, revision.Snapshot, userID)
		})
	}

	return fmt.Errorf("unsupported entity type: %s", entityType)
}

func buildWorkSnapshot(work model.Work) map[string]interface{} {
	database.DB.Preload("Translations").Preload("Tags").Find(&work)

	translations := make(map[string]map[string]string)
	for _, t := range work.Translations {
		translations[t.Lang] = map[string]string{
			"title":   t.Title,
			"excerpt": t.Excerpt,
			"content": t.Content,
		}
	}

	tagIDs := make([]uint, len(work.Tags))
	for i, tag := range work.Tags {
		tagIDs[i] = tag.ID
	}

	return map[string]interface{}{
		"slug":            work.Slug,
		"category_id":     work.CategoryID,
		"cover_image_url": work.CoverImageURL,
		"gradient":        work.Gradient,
		"date":            work.Date.Format("2006-01-02"),
		"featured":        work.Featured,
		"sort_order":      work.SortOrder,
		"status":          work.Status,
		"seo_title":       work.SeoTitle,
		"seo_description": work.SeoDescription,
		"seo_keywords":    work.SeoKeywords,
		"og_image":        work.OgImage,
		"translations":    translations,
		"tag_ids":         tagIDs,
	}
}

func buildPostSnapshot(post model.Post) map[string]interface{} {
	database.DB.Preload("Translations").Preload("Tags").Find(&post)

	translations := make(map[string]map[string]string)
	for _, t := range post.Translations {
		translations[t.Lang] = map[string]string{
			"title":   t.Title,
			"excerpt": t.Excerpt,
			"content": t.Content,
		}
	}

	tagIDs := make([]uint, len(post.Tags))
	for i, tag := range post.Tags {
		tagIDs[i] = tag.ID
	}

	return map[string]interface{}{
		"slug":            post.Slug,
		"category_id":     post.CategoryID,
		"cover_image_url": post.CoverImageURL,
		"reading_time":    post.ReadingTime,
		"featured":        post.Featured,
		"sort_order":      post.SortOrder,
		"status":          post.Status,
		"seo_title":       post.SeoTitle,
		"seo_description": post.SeoDescription,
		"seo_keywords":    post.SeoKeywords,
		"og_image":        post.OgImage,
		"translations":    translations,
		"tag_ids":         tagIDs,
	}
}

func applyWorkSnapshot(tx *gorm.DB, entityID uint, data map[string]interface{}, userID uint) error {
	updates := map[string]interface{}{"updated_by": userID}

	if v, ok := data["slug"]; ok {
		updates["slug"] = v
	}
	if v, ok := data["category_id"]; ok && v != nil {
		updates["category_id"] = v
	}
	if v, ok := data["cover_image_url"]; ok {
		updates["cover_image_url"] = v
	}
	if v, ok := data["gradient"]; ok {
		updates["gradient"] = v
	}
	if v, ok := data["date"]; ok {
		updates["date"] = v
	}
	if v, ok := data["featured"]; ok {
		updates["featured"] = v
	}
	if v, ok := data["sort_order"]; ok {
		updates["sort_order"] = v
	}
	if v, ok := data["status"]; ok {
		updates["status"] = v
	}
	if v, ok := data["seo_title"]; ok {
		updates["seo_title"] = v
	}
	if v, ok := data["seo_description"]; ok {
		updates["seo_description"] = v
	}
	if v, ok := data["seo_keywords"]; ok {
		updates["seo_keywords"] = v
	}

	if err := tx.Model(&model.Work{}).Where("id = ?", entityID).Updates(updates).Error; err != nil {
		return err
	}

	// Restore translations
	if translations, ok := data["translations"].(map[string]interface{}); ok {
		for lang, v := range translations {
			if fields, ok := v.(map[string]interface{}); ok {
				title, _ := fields["title"].(string)
				excerpt, _ := fields["excerpt"].(string)
				content, _ := fields["content"].(string)

				var trans model.WorkTranslation
				result := tx.Where("work_id = ? AND lang = ?", entityID, lang).First(&trans)
				if result.Error == gorm.ErrRecordNotFound {
					tx.Create(&model.WorkTranslation{
						WorkID:  entityID,
						Lang:    lang,
						Title:   title,
						Excerpt: excerpt,
						Content: content,
					})
				} else {
					tx.Model(&trans).Updates(map[string]interface{}{
						"title": title, "excerpt": excerpt, "content": content,
					})
				}
			}
		}
	}

	// Restore tags
	if tagIDs, ok := data["tag_ids"].([]interface{}); ok {
		tx.Where("work_id = ?", entityID).Delete(&model.WorkTag{})
		for _, v := range tagIDs {
			if id, ok := v.(float64); ok {
				tx.Create(&model.WorkTag{WorkID: entityID, TagID: uint(id)})
			}
		}
	}

	return nil
}

func applyPostSnapshot(tx *gorm.DB, entityID uint, data map[string]interface{}, userID uint) error {
	updates := map[string]interface{}{"updated_by": userID}

	if v, ok := data["slug"]; ok {
		updates["slug"] = v
	}
	if v, ok := data["category_id"]; ok && v != nil {
		updates["category_id"] = v
	}
	if v, ok := data["cover_image_url"]; ok {
		updates["cover_image_url"] = v
	}
	if v, ok := data["reading_time"]; ok {
		updates["reading_time"] = v
	}
	if v, ok := data["featured"]; ok {
		updates["featured"] = v
	}
	if v, ok := data["sort_order"]; ok {
		updates["sort_order"] = v
	}
	if v, ok := data["status"]; ok {
		updates["status"] = v
	}
	if v, ok := data["seo_title"]; ok {
		updates["seo_title"] = v
	}
	if v, ok := data["seo_description"]; ok {
		updates["seo_description"] = v
	}
	if v, ok := data["seo_keywords"]; ok {
		updates["seo_keywords"] = v
	}

	if err := tx.Model(&model.Post{}).Where("id = ?", entityID).Updates(updates).Error; err != nil {
		return err
	}

	if translations, ok := data["translations"].(map[string]interface{}); ok {
		for lang, v := range translations {
			if fields, ok := v.(map[string]interface{}); ok {
				title, _ := fields["title"].(string)
				excerpt, _ := fields["excerpt"].(string)
				content, _ := fields["content"].(string)

				var trans model.PostTranslation
				result := tx.Where("post_id = ? AND lang = ?", entityID, lang).First(&trans)
				if result.Error == gorm.ErrRecordNotFound {
					tx.Create(&model.PostTranslation{
						PostID:  entityID,
						Lang:    lang,
						Title:   title,
						Excerpt: excerpt,
						Content: content,
					})
				} else {
					tx.Model(&trans).Updates(map[string]interface{}{
						"title": title, "excerpt": excerpt, "content": content,
					})
				}
			}
		}
	}

	if tagIDs, ok := data["tag_ids"].([]interface{}); ok {
		tx.Where("post_id = ?", entityID).Delete(&model.PostTag{})
		for _, v := range tagIDs {
			if id, ok := v.(float64); ok {
				tx.Create(&model.PostTag{PostID: entityID, TagID: uint(id)})
			}
		}
	}

	return nil
}
