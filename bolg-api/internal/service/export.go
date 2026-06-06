package service

import (
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"encoding/json"
	"fmt"
	"time"

	"gorm.io/gorm"
)

type ExportService struct{}

func NewExportService() *ExportService {
	return &ExportService{}
}

// ExportData is the full content export structure
type ExportData struct {
	Version   string              `json:"version"`
	ExportAt  string              `json:"export_at"`
	Works     []exportWork        `json:"works"`
	Posts     []exportPost        `json:"posts"`
	Categories []exportCategory   `json:"categories"`
	Tags      []exportTag         `json:"tags"`
}

type exportWork struct {
	Slug           string                          `json:"slug"`
	CategorySlug   string                          `json:"category_slug"`
	CoverImageURL  string                          `json:"cover_image_url"`
	Gradient       string                          `json:"gradient"`
	Date           string                          `json:"date"`
	Featured       bool                            `json:"featured"`
	SortOrder      int                             `json:"sort_order"`
	Status         string                          `json:"status"`
	SeoTitle       string                          `json:"seo_title"`
	SeoDescription string                          `json:"seo_description"`
	SeoKeywords    string                          `json:"seo_keywords"`
	Translations   map[string]exportTranslation    `json:"translations"`
	TagSlugs       []string                        `json:"tag_slugs"`
}

type exportPost struct {
	Slug           string                          `json:"slug"`
	CategorySlug   string                          `json:"category_slug"`
	CoverImageURL  string                          `json:"cover_image_url"`
	ReadingTime    int                             `json:"reading_time"`
	Featured       bool                            `json:"featured"`
	SortOrder      int                             `json:"sort_order"`
	Status         string                          `json:"status"`
	SeoTitle       string                          `json:"seo_title"`
	SeoDescription string                          `json:"seo_description"`
	SeoKeywords    string                          `json:"seo_keywords"`
	Translations   map[string]exportTranslation    `json:"translations"`
	TagSlugs       []string                        `json:"tag_slugs"`
}

type exportTranslation struct {
	Title   string `json:"title"`
	Excerpt string `json:"excerpt"`
	Content string `json:"content"`
}

type exportCategory struct {
	Slug         string                       `json:"slug"`
	IconName     string                       `json:"icon_name"`
	Color        string                       `json:"color"`
	SortOrder    int                          `json:"sort_order"`
	Status       string                       `json:"status"`
	Translations map[string]exportCatTranslation `json:"translations"`
}

type exportCatTranslation struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type exportTag struct {
	Slug         string                       `json:"slug"`
	Translations map[string]exportTagTranslation `json:"translations"`
}

type exportTagTranslation struct {
	Name string `json:"name"`
}

// ExportAll exports all content as JSON
func (s *ExportService) ExportAll() (*ExportData, error) {
	data := &ExportData{
		Version:  "1.0",
		ExportAt: time.Now().Format(time.RFC3339),
	}

	// Export categories
	var categories []model.Category
	database.DB.Preload("Translations").Find(&categories)
	for _, cat := range categories {
		ec := exportCategory{
			Slug:         cat.Slug,
			IconName:     cat.IconName,
			Color:        cat.Color,
			SortOrder:    cat.SortOrder,
			Status:       cat.Status,
			Translations: make(map[string]exportCatTranslation),
		}
		for _, t := range cat.Translations {
			ec.Translations[t.Lang] = exportCatTranslation{
				Name:        t.Name,
				Description: t.Description,
			}
		}
		data.Categories = append(data.Categories, ec)
	}

	// Export tags
	var tags []model.Tag
	database.DB.Preload("Translations").Find(&tags)
	for _, tag := range tags {
		et := exportTag{
			Slug:         tag.Slug,
			Translations: make(map[string]exportTagTranslation),
		}
		for _, t := range tag.Translations {
			et.Translations[t.Lang] = exportTagTranslation{Name: t.Name}
		}
		data.Tags = append(data.Tags, et)
	}

	// Export works
	var works []model.Work
	database.DB.Preload("Translations").Preload("Category").Preload("Tags").Find(&works)
	for _, w := range works {
		catSlug := ""
		if w.Category != nil {
			catSlug = w.Category.Slug
		}
		ew := exportWork{
			Slug:           w.Slug,
			CategorySlug:   catSlug,
			CoverImageURL:  w.CoverImageURL,
			Gradient:       w.Gradient,
			Date:           w.Date.Format("2006-01-02"),
			Featured:       w.Featured,
			SortOrder:      w.SortOrder,
			Status:         w.Status,
			SeoTitle:       w.SeoTitle,
			SeoDescription: w.SeoDescription,
			SeoKeywords:    w.SeoKeywords,
			Translations:   make(map[string]exportTranslation),
		}
		for _, t := range w.Translations {
			ew.Translations[t.Lang] = exportTranslation{
				Title:   t.Title,
				Excerpt: t.Excerpt,
				Content: t.Content,
			}
		}
		for _, tag := range w.Tags {
			ew.TagSlugs = append(ew.TagSlugs, tag.Slug)
		}
		data.Works = append(data.Works, ew)
	}

	// Export posts
	var posts []model.Post
	database.DB.Preload("Translations").Preload("Category").Preload("Tags").Find(&posts)
	for _, p := range posts {
		catSlug := ""
		if p.Category != nil {
			catSlug = p.Category.Slug
		}
		ep := exportPost{
			Slug:           p.Slug,
			CategorySlug:   catSlug,
			CoverImageURL:  p.CoverImageURL,
			ReadingTime:    p.ReadingTime,
			Featured:       p.Featured,
			SortOrder:      p.SortOrder,
			Status:         p.Status,
			SeoTitle:       p.SeoTitle,
			SeoDescription: p.SeoDescription,
			SeoKeywords:    p.SeoKeywords,
			Translations:   make(map[string]exportTranslation),
		}
		for _, t := range p.Translations {
			ep.Translations[t.Lang] = exportTranslation{
				Title:   t.Title,
				Excerpt: t.Excerpt,
				Content: t.Content,
			}
		}
		for _, tag := range p.Tags {
			ep.TagSlugs = append(ep.TagSlugs, tag.Slug)
		}
		data.Posts = append(data.Posts, ep)
	}

	return data, nil
}

// ImportAll imports content from JSON, upserting by slug
func (s *ExportService) ImportAll(jsonData []byte, userID uint) (map[string]int, error) {
	var data ExportData
	if err := json.Unmarshal(jsonData, &data); err != nil {
		return nil, fmt.Errorf("invalid JSON: %w", err)
	}

	counts := map[string]int{"categories": 0, "tags": 0, "works": 0, "posts": 0}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		// Import categories
		for _, ec := range data.Categories {
			var cat model.Category
			result := tx.Where("slug = ?", ec.Slug).First(&cat)
			if result.Error == gorm.ErrRecordNotFound {
				cat = model.Category{
					Slug:      ec.Slug,
					IconName:  ec.IconName,
					Color:     ec.Color,
					SortOrder: ec.SortOrder,
					Status:    ec.Status,
				}
				if cat.Status == "" {
					cat.Status = "active"
				}
				if err := tx.Create(&cat).Error; err != nil {
					return fmt.Errorf("create category %s: %w", ec.Slug, err)
				}
			} else {
				tx.Model(&cat).Updates(map[string]interface{}{
					"icon_name":  ec.IconName,
					"color":      ec.Color,
					"sort_order": ec.SortOrder,
					"status":     ec.Status,
				})
			}

			// Upsert translations
			for lang, t := range ec.Translations {
				var trans model.CategoryTranslation
				r := tx.Where("category_id = ? AND lang = ?", cat.ID, lang).First(&trans)
				if r.Error == gorm.ErrRecordNotFound {
					tx.Create(&model.CategoryTranslation{
						CategoryID: cat.ID, Lang: lang,
						Name: t.Name, Description: t.Description,
					})
				} else {
					tx.Model(&trans).Updates(map[string]interface{}{
						"name": t.Name, "description": t.Description,
					})
				}
			}
			counts["categories"]++
		}

		// Import tags
		for _, et := range data.Tags {
			var tag model.Tag
			result := tx.Where("slug = ?", et.Slug).First(&tag)
			if result.Error == gorm.ErrRecordNotFound {
				tag = model.Tag{Slug: et.Slug}
				if err := tx.Create(&tag).Error; err != nil {
					return fmt.Errorf("create tag %s: %w", et.Slug, err)
				}
			}

			for lang, t := range et.Translations {
				var trans model.TagTranslation
				r := tx.Where("tag_id = ? AND lang = ?", tag.ID, lang).First(&trans)
				if r.Error == gorm.ErrRecordNotFound {
					tx.Create(&model.TagTranslation{
						TagID: tag.ID, Lang: lang, Name: t.Name,
					})
				} else {
					tx.Model(&trans).Update("name", t.Name)
				}
			}
			counts["tags"]++
		}

		// Import works
		for _, ew := range data.Works {
			var catID *uint
			if ew.CategorySlug != "" {
				var cat model.Category
				if tx.Where("slug = ?", ew.CategorySlug).First(&cat).Error == nil {
					catID = &cat.ID
				}
			}

			date, _ := time.Parse("2006-01-02", ew.Date)

			var work model.Work
			result := tx.Where("slug = ?", ew.Slug).First(&work)
			if result.Error == gorm.ErrRecordNotFound {
				work = model.Work{
					Slug:           ew.Slug,
					CategoryID:     catID,
					CoverImageURL:  ew.CoverImageURL,
					Gradient:       ew.Gradient,
					Date:           date,
					Featured:       ew.Featured,
					SortOrder:      ew.SortOrder,
					Status:         ew.Status,
					SeoTitle:       ew.SeoTitle,
					SeoDescription: ew.SeoDescription,
					SeoKeywords:    ew.SeoKeywords,
					CreatedBy:      &userID,
					UpdatedBy:      &userID,
				}
				if work.Status == "" {
					work.Status = "draft"
				}
				if err := tx.Create(&work).Error; err != nil {
					return fmt.Errorf("create work %s: %w", ew.Slug, err)
				}
			} else {
				tx.Model(&work).Updates(map[string]interface{}{
					"category_id":     catID,
					"cover_image_url": ew.CoverImageURL,
					"gradient":        ew.Gradient,
					"date":            date,
					"featured":        ew.Featured,
					"sort_order":      ew.SortOrder,
					"status":          ew.Status,
					"seo_title":       ew.SeoTitle,
					"seo_description": ew.SeoDescription,
					"seo_keywords":    ew.SeoKeywords,
					"updated_by":      userID,
				})
			}

			for lang, t := range ew.Translations {
				var trans model.WorkTranslation
				r := tx.Where("work_id = ? AND lang = ?", work.ID, lang).First(&trans)
				if r.Error == gorm.ErrRecordNotFound {
					tx.Create(&model.WorkTranslation{
						WorkID: work.ID, Lang: lang,
						Title: t.Title, Excerpt: t.Excerpt, Content: t.Content,
					})
				} else {
					tx.Model(&trans).Updates(map[string]interface{}{
						"title": t.Title, "excerpt": t.Excerpt, "content": t.Content,
					})
				}
			}

			// Sync tags
			tx.Where("work_id = ?", work.ID).Delete(&model.WorkTag{})
			for _, slug := range ew.TagSlugs {
				var tag model.Tag
				if tx.Where("slug = ?", slug).First(&tag).Error == nil {
					tx.Create(&model.WorkTag{WorkID: work.ID, TagID: tag.ID})
				}
			}
			counts["works"]++
		}

		// Import posts
		for _, ep := range data.Posts {
			var catID *uint
			if ep.CategorySlug != "" {
				var cat model.Category
				if tx.Where("slug = ?", ep.CategorySlug).First(&cat).Error == nil {
					catID = &cat.ID
				}
			}

			var post model.Post
			result := tx.Where("slug = ?", ep.Slug).First(&post)
			if result.Error == gorm.ErrRecordNotFound {
				post = model.Post{
					Slug:           ep.Slug,
					CategoryID:     catID,
					CoverImageURL:  ep.CoverImageURL,
					ReadingTime:    ep.ReadingTime,
					Featured:       ep.Featured,
					SortOrder:      ep.SortOrder,
					Status:         ep.Status,
					SeoTitle:       ep.SeoTitle,
					SeoDescription: ep.SeoDescription,
					SeoKeywords:    ep.SeoKeywords,
					CreatedBy:      &userID,
					UpdatedBy:      &userID,
				}
				if post.Status == "" {
					post.Status = "draft"
				}
				if err := tx.Create(&post).Error; err != nil {
					return fmt.Errorf("create post %s: %w", ep.Slug, err)
				}
			} else {
				tx.Model(&post).Updates(map[string]interface{}{
					"category_id":     catID,
					"cover_image_url": ep.CoverImageURL,
					"reading_time":    ep.ReadingTime,
					"featured":        ep.Featured,
					"sort_order":      ep.SortOrder,
					"status":          ep.Status,
					"seo_title":       ep.SeoTitle,
					"seo_description": ep.SeoDescription,
					"seo_keywords":    ep.SeoKeywords,
					"updated_by":      userID,
				})
			}

			for lang, t := range ep.Translations {
				var trans model.PostTranslation
				r := tx.Where("post_id = ? AND lang = ?", post.ID, lang).First(&trans)
				if r.Error == gorm.ErrRecordNotFound {
					tx.Create(&model.PostTranslation{
						PostID: post.ID, Lang: lang,
						Title: t.Title, Excerpt: t.Excerpt, Content: t.Content,
					})
				} else {
					tx.Model(&trans).Updates(map[string]interface{}{
						"title": t.Title, "excerpt": t.Excerpt, "content": t.Content,
					})
				}
			}

			tx.Where("post_id = ?", post.ID).Delete(&model.PostTag{})
			for _, slug := range ep.TagSlugs {
				var tag model.Tag
				if tx.Where("slug = ?", slug).First(&tag).Error == nil {
					tx.Create(&model.PostTag{PostID: post.ID, TagID: tag.ID})
				}
			}
			counts["posts"]++
		}

		return nil
	})

	return counts, err
}
