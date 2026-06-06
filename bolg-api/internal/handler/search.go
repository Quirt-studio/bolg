package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type SearchHandler struct{}

func NewSearchHandler() *SearchHandler {
	return &SearchHandler{}
}

type SearchResult struct {
	Type        string `json:"type"`
	ID          uint   `json:"id"`
	Slug        string `json:"slug"`
	Title       string `json:"title"`
	Excerpt     string `json:"excerpt"`
	Status      string `json:"status"`
	CoverImage  string `json:"cover_image_url"`
	PublishedAt string `json:"published_at,omitempty"`
}

func (h *SearchHandler) Search(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Query parameter 'q' is required"))
		return
	}

	searchType := c.DefaultQuery("type", "all")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	lang := c.DefaultQuery("lang", "en")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	var results []SearchResult
	var total int64
	likeQ := "%" + q + "%"

	// Search works
	if searchType == "all" || searchType == "works" {
		var works []model.Work
		query := database.DB.Model(&model.Work{}).
			Joins("JOIN work_translations wt ON wt.work_id = works.id").
			Where("wt.title LIKE ? OR wt.excerpt LIKE ?", likeQ, likeQ).
			Preload("Translations")

		var worksTotal int64
		query.Count(&worksTotal)
		total += worksTotal

		query.Order("created_at DESC").Find(&works)

		for _, w := range works {
			title := ""
			excerpt := ""
			for _, tr := range w.Translations {
				if tr.Lang == lang {
					title = tr.Title
					excerpt = tr.Excerpt
					break
				}
			}
			if title == "" && len(w.Translations) > 0 {
				title = w.Translations[0].Title
				excerpt = w.Translations[0].Excerpt
			}
			pubAt := ""
			if w.PublishedAt != nil {
				pubAt = w.PublishedAt.Format("2006-01-02T15:04:05Z")
			}
			results = append(results, SearchResult{
				Type:        "work",
				ID:          w.ID,
				Slug:        w.Slug,
				Title:       title,
				Excerpt:     excerpt,
				Status:      w.Status,
				CoverImage:  w.CoverImageURL,
				PublishedAt: pubAt,
			})
		}
	}

	// Search posts
	if searchType == "all" || searchType == "posts" {
		var posts []model.Post
		query := database.DB.Model(&model.Post{}).
			Joins("JOIN post_translations pt ON pt.post_id = posts.id").
			Where("pt.title LIKE ? OR pt.excerpt LIKE ?", likeQ, likeQ).
			Preload("Translations")

		var postsTotal int64
		query.Count(&postsTotal)
		total += postsTotal

		query.Order("created_at DESC").Find(&posts)

		for _, p := range posts {
			title := ""
			excerpt := ""
			for _, tr := range p.Translations {
				if tr.Lang == lang {
					title = tr.Title
					excerpt = tr.Excerpt
					break
				}
			}
			if title == "" && len(p.Translations) > 0 {
				title = p.Translations[0].Title
				excerpt = p.Translations[0].Excerpt
			}
			pubAt := ""
			if p.PublishedAt != nil {
				pubAt = p.PublishedAt.Format("2006-01-02T15:04:05Z")
			}
			results = append(results, SearchResult{
				Type:        "post",
				ID:          p.ID,
				Slug:        p.Slug,
				Title:       title,
				Excerpt:     excerpt,
				Status:      p.Status,
				CoverImage:  p.CoverImageURL,
				PublishedAt: pubAt,
			})
		}
	}

	// Paginate the combined results
	start := (page - 1) * perPage
	end := start + perPage
	if start > len(results) {
		start = len(results)
	}
	if end > len(results) {
		end = len(results)
	}
	paged := results[start:end]
	if paged == nil {
		paged = []SearchResult{}
	}

	totalPages := len(results) / perPage
	if len(results)%perPage > 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, dto.APIResponse{
		Code:    0,
		Message: "success",
		Data: map[string]interface{}{
			"items": paged,
			"meta": map[string]interface{}{
				"current_page": page,
				"per_page":     perPage,
				"total_items":  len(results),
				"total_pages":  totalPages,
			},
		},
	})
}
