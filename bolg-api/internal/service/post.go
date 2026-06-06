package service

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"errors"
	"time"

	"gorm.io/gorm"
)

type PostService struct{}

func NewPostService() *PostService {
	return &PostService{}
}

func (s *PostService) List(page, perPage int, status, lang string, categoryID *uint, featured *bool, search string) ([]dto.PostResponse, int64, error) {
	var posts []model.Post
	var total int64

	query := database.DB.Model(&model.Post{})

	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}
	if categoryID != nil {
		query = query.Where("category_id = ?", *categoryID)
	}
	if featured != nil {
		query = query.Where("featured = ?", *featured)
	}
	if search != "" {
		query = query.Joins("JOIN post_translations pt ON pt.post_id = posts.id").
			Where("pt.title LIKE ? OR pt.excerpt LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	query.Count(&total)

	offset := (page - 1) * perPage
	err := query.Preload("Category.Translations").
		Preload("Translations").
		Preload("Tags.Translations").
		Order("sort_order ASC, created_at DESC").
		Offset(offset).Limit(perPage).
		Find(&posts).Error
	if err != nil {
		return nil, 0, err
	}

	responses := make([]dto.PostResponse, len(posts))
	for i, p := range posts {
		responses[i] = s.ToPostResponse(p, lang)
	}

	return responses, total, nil
}

func (s *PostService) GetByID(id uint, lang string) (*dto.PostResponse, error) {
	var post model.Post
	err := database.DB.Preload("Category.Translations").
		Preload("Translations").
		Preload("Tags.Translations").
		First(&post, id).Error
	if err != nil {
		return nil, err
	}

	resp := s.ToPostResponse(post, lang)
	return &resp, nil
}

func (s *PostService) GetBySlug(slug, lang string) (*dto.PostResponse, error) {
	var post model.Post
	err := database.DB.Preload("Category.Translations").
		Preload("Translations").
		Preload("Tags.Translations").
		Where("slug = ?", slug).First(&post).Error
	if err != nil {
		return nil, err
	}

	resp := s.ToPostResponse(post, lang)
	return &resp, nil
}

func (s *PostService) Create(req dto.PostCreateRequest, userID uint) (*dto.PostResponse, error) {
	post := model.Post{
		Slug:           req.Slug,
		CategoryID:     req.CategoryID,
		CoverImageURL:  req.CoverImageURL,
		ReadingTime:    req.ReadingTime,
		Featured:       req.Featured,
		SortOrder:      req.SortOrder,
		Status:         req.Status,
		SeoTitle:       req.SeoTitle,
		SeoDescription: req.SeoDescription,
		SeoKeywords:    req.SeoKeywords,
		OgImage:        req.OgImage,
		VideoURL:       req.VideoURL,
		CreatedBy:      &userID,
		UpdatedBy:      &userID,
	}

	if post.Status == "" {
		post.Status = "draft"
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&post).Error; err != nil {
			return err
		}

		for lang, t := range req.Translations {
			trans := model.PostTranslation{
				PostID:  post.ID,
				Lang:    lang,
				Title:   t.Title,
				Excerpt: t.Excerpt,
				Content: t.Content,
			}
			if err := tx.Create(&trans).Error; err != nil {
				return err
			}
		}

		if len(req.TagIDs) > 0 {
			for _, tagID := range req.TagIDs {
				tx.Create(&model.PostTag{PostID: post.ID, TagID: tagID})
			}
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return s.GetByID(post.ID, "")
}

func (s *PostService) Update(id uint, req dto.PostUpdateRequest, userID uint) (*dto.PostResponse, error) {
	var post model.Post
	if err := database.DB.First(&post, id).Error; err != nil {
		return nil, errors.New("post not found")
	}

	updates := map[string]interface{}{
		"updated_by": userID,
	}

	if req.CategoryID != nil {
		updates["category_id"] = req.CategoryID
	}
	if req.CoverImageURL != "" {
		updates["cover_image_url"] = req.CoverImageURL
	}
	if req.ReadingTime != nil {
		updates["reading_time"] = *req.ReadingTime
	}
	if req.Featured != nil {
		updates["featured"] = *req.Featured
	}
	if req.SortOrder != nil {
		updates["sort_order"] = *req.SortOrder
	}
	if req.Status != "" {
		updates["status"] = req.Status
		if req.Status == "published" && post.PublishedAt == nil {
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

	// Snapshot before update for revision
	revisionSvc := NewRevisionService()
	preSnapshot := buildPostSnapshot(post)

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&post).Updates(updates).Error; err != nil {
			return err
		}

		// Create revision
		_ = revisionSvc.CreateRevision(tx, "post", post.ID, preSnapshot, "Updated", userID)

		for lang, t := range req.Translations {
			var trans model.PostTranslation
			result := tx.Where("post_id = ? AND lang = ?", post.ID, lang).First(&trans)
			if result.Error == gorm.ErrRecordNotFound {
				tx.Create(&model.PostTranslation{
					PostID:  post.ID,
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

		if req.TagIDs != nil {
			tx.Where("post_id = ?", post.ID).Delete(&model.PostTag{})
			for _, tagID := range req.TagIDs {
				tx.Create(&model.PostTag{PostID: post.ID, TagID: tagID})
			}
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return s.GetByID(post.ID, "")
}

func (s *PostService) Delete(id uint) error {
	return database.DB.Delete(&model.Post{}, id).Error
}

func (s *PostService) Publish(id uint) error {
	now := time.Now()
	return database.DB.Model(&model.Post{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":       "published",
		"published_at": now,
	}).Error
}

func (s *PostService) Unpublish(id uint) error {
	return database.DB.Model(&model.Post{}).Where("id = ?", id).Update("status", "draft").Error
}

func (s *PostService) BatchDelete(ids []uint) error {
	return database.DB.Where("id IN ?", ids).Delete(&model.Post{}).Error
}

func (s *PostService) BatchPublish(ids []uint) error {
	now := time.Now()
	return database.DB.Model(&model.Post{}).Where("id IN ?", ids).Updates(map[string]interface{}{
		"status":       "published",
		"published_at": now,
	}).Error
}

func (s *PostService) BatchUnpublish(ids []uint) error {
	return database.DB.Model(&model.Post{}).Where("id IN ?", ids).Update("status", "draft").Error
}

func (s *PostService) SchedulePublish(id uint, publishAt time.Time) error {
	return database.DB.Model(&model.Post{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":       "scheduled",
		"published_at": publishAt,
	}).Error
}

func (s *PostService) ToPostResponse(p model.Post, lang string) dto.PostResponse {
	resp := dto.PostResponse{
		ID:            p.ID,
		Slug:          p.Slug,
		CoverImageURL: p.CoverImageURL,
		ReadingTime:   p.ReadingTime,
		ViewCount:     p.ViewCount,
		Date:          p.CreatedAt,
		Featured:      p.Featured,
		SortOrder:     p.SortOrder,
		Status:        p.Status,
		PublishedAt:   p.PublishedAt,
		Translations:  make(map[string]dto.TranslationData),
		VideoURL:      p.VideoURL,
		CreatedAt:     p.CreatedAt,
		UpdatedAt:     p.UpdatedAt,
	}

	if p.Category != nil && p.Category.ID > 0 {
		name := ""
		if len(p.Category.Translations) > 0 {
			for _, t := range p.Category.Translations {
				if t.Lang == "en" {
					name = t.Name
				}
			}
			if name == "" {
				name = p.Category.Translations[0].Name
			}
		}
		resp.Category = &dto.CategoryBrief{
			ID:   p.Category.ID,
			Slug: p.Category.Slug,
			Name: name,
		}
	}

	for _, t := range p.Translations {
		resp.Translations[t.Lang] = dto.TranslationData{
			Title:   t.Title,
			Excerpt: t.Excerpt,
			Content: t.Content,
		}
	}

	resp.Tags = make([]dto.TagBrief, 0, len(p.Tags))
	for _, tag := range p.Tags {
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

	resp.Seo = dto.SeoData{
		Title:       p.SeoTitle,
		Description: p.SeoDescription,
		Keywords:    p.SeoKeywords,
		OgImage:     p.OgImage,
	}

	return resp
}
