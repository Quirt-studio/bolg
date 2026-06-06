package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	jwtpkg "bolg-api/internal/pkg/jwt"
	"bolg-api/config"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type PreviewHandler struct{}

func NewPreviewHandler() *PreviewHandler {
	return &PreviewHandler{}
}

// GenerateToken creates a signed preview URL token
// POST /api/v1/preview/token  { entity_type, entity_id }
func (h *PreviewHandler) GenerateToken(c *gin.Context) {
	var req struct {
		EntityType string `json:"entity_type" binding:"required"`
		EntityID   uint   `json:"entity_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeValidation, "entity_type and entity_id required"))
		return
	}

	if req.EntityType != "work" && req.EntityType != "post" {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeValidation, "entity_type must be work or post"))
		return
	}

	cfg := config.Get()
	token, err := jwtpkg.GeneratePreviewToken(req.EntityType, req.EntityID, cfg.JWT.AccessSecret, 86400) // 24h
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, "failed to generate token"))
		return
	}

	c.JSON(http.StatusOK, dto.Success(gin.H{
		"token": token,
		"url":   "/preview?type=" + req.EntityType + "&id=" + strconv.Itoa(int(req.EntityID)) + "&token=" + token,
	}))
}

// checkPreviewAuth returns true if the request has valid auth (Bearer token OR preview token)
func checkPreviewAuth(c *gin.Context, entityType string, entityID uint) bool {
	// Already authenticated via middleware
	if _, exists := c.Get("user_id"); exists {
		return true
	}

	// Check preview token
	tokenStr := c.Query("token")
	if tokenStr == "" {
		return false
	}

	cfg := config.Get()
	claims, err := jwtpkg.ParsePreviewToken(tokenStr, cfg.JWT.AccessSecret)
	if err != nil {
		return false
	}

	return claims.EntityType == entityType && claims.EntityID == entityID
}

// WorkPreview returns a work by ID regardless of status
// GET /api/v1/preview/work/:id  (auth OR ?token=xxx)
func (h *PreviewHandler) WorkPreview(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeValidation, "invalid id"))
		return
	}

	// Allow unauthenticated access with valid preview token
	if _, exists := c.Get("user_id"); !exists {
		tokenStr := c.Query("token")
		if tokenStr == "" {
			c.JSON(http.StatusUnauthorized, dto.Error(dto.ErrCodeUnauthorized, "auth or preview token required"))
			return
		}
		cfg := config.Get()
		claims, parseErr := jwtpkg.ParsePreviewToken(tokenStr, cfg.JWT.AccessSecret)
		if parseErr != nil || claims.EntityType != "work" || claims.EntityID != uint(id) {
			c.JSON(http.StatusUnauthorized, dto.Error(dto.ErrCodeUnauthorized, "invalid preview token"))
			return
		}
	}

	var work model.Work
	err = database.DB.Preload("Translations").
		Preload("Category.Translations").
		Preload("Tags.Translations").
		First(&work, id).Error
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "work not found"))
		return
	}

	lang := c.DefaultQuery("lang", "en")
	title := ""
	excerpt := ""
	content := ""
	for _, t := range work.Translations {
		if t.Lang == lang {
			title = t.Title
			excerpt = t.Excerpt
			content = t.Content
			break
		}
	}
	if title == "" && len(work.Translations) > 0 {
		title = work.Translations[0].Title
		excerpt = work.Translations[0].Excerpt
		content = work.Translations[0].Content
	}

	tags := make([]gin.H, 0, len(work.Tags))
	for _, tag := range work.Tags {
		tagName := tag.Slug
		for _, t := range tag.Translations {
			if t.Lang == lang {
				tagName = t.Name
				break
			}
		}
		tags = append(tags, gin.H{"id": tag.ID, "slug": tag.Slug, "name": tagName})
	}

	result := gin.H{
		"id":              work.ID,
		"slug":            work.Slug,
		"cover_image_url": work.CoverImageURL,
		"gradient":        work.Gradient,
		"date":            work.Date.Format("2006-01-02"),
		"featured":        work.Featured,
		"status":          work.Status,
		"title":           title,
		"excerpt":         excerpt,
		"content":         content,
		"tags":            tags,
		"seo_title":       work.SeoTitle,
		"seo_description": work.SeoDescription,
	}
	if work.Category != nil {
		catName := ""
		for _, t := range work.Category.Translations {
			if t.Lang == lang {
				catName = t.Name
				break
			}
		}
		if catName == "" && len(work.Category.Translations) > 0 {
			catName = work.Category.Translations[0].Name
		}
		result["category"] = gin.H{"id": work.Category.ID, "slug": work.Category.Slug, "name": catName}
	}

	c.JSON(http.StatusOK, dto.Success(result))
}

// PostPreview returns a post by ID regardless of status
// GET /api/v1/preview/post/:id  (auth OR ?token=xxx)
func (h *PreviewHandler) PostPreview(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeValidation, "invalid id"))
		return
	}

	if _, exists := c.Get("user_id"); !exists {
		tokenStr := c.Query("token")
		if tokenStr == "" {
			c.JSON(http.StatusUnauthorized, dto.Error(dto.ErrCodeUnauthorized, "auth or preview token required"))
			return
		}
		cfg := config.Get()
		claims, parseErr := jwtpkg.ParsePreviewToken(tokenStr, cfg.JWT.AccessSecret)
		if parseErr != nil || claims.EntityType != "post" || claims.EntityID != uint(id) {
			c.JSON(http.StatusUnauthorized, dto.Error(dto.ErrCodeUnauthorized, "invalid preview token"))
			return
		}
	}

	var post model.Post
	err = database.DB.Preload("Translations").
		Preload("Category.Translations").
		Preload("Tags.Translations").
		First(&post, id).Error
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "post not found"))
		return
	}

	lang := c.DefaultQuery("lang", "en")
	title := ""
	excerpt := ""
	content := ""
	for _, t := range post.Translations {
		if t.Lang == lang {
			title = t.Title
			excerpt = t.Excerpt
			content = t.Content
			break
		}
	}
	if title == "" && len(post.Translations) > 0 {
		title = post.Translations[0].Title
		excerpt = post.Translations[0].Excerpt
		content = post.Translations[0].Content
	}

	tags := make([]gin.H, 0, len(post.Tags))
	for _, tag := range post.Tags {
		tagName := tag.Slug
		for _, t := range tag.Translations {
			if t.Lang == lang {
				tagName = t.Name
				break
			}
		}
		tags = append(tags, gin.H{"id": tag.ID, "slug": tag.Slug, "name": tagName})
	}

	result := gin.H{
		"id":              post.ID,
		"slug":            post.Slug,
		"cover_image_url": post.CoverImageURL,
		"reading_time":    post.ReadingTime,
		"featured":        post.Featured,
		"status":          post.Status,
		"title":           title,
		"excerpt":         excerpt,
		"content":         content,
		"tags":            tags,
		"seo_title":       post.SeoTitle,
		"seo_description": post.SeoDescription,
	}
	if post.Category != nil {
		catName := ""
		for _, t := range post.Category.Translations {
			if t.Lang == lang {
				catName = t.Name
				break
			}
		}
		if catName == "" && len(post.Category.Translations) > 0 {
			catName = post.Category.Translations[0].Name
		}
		result["category"] = gin.H{"id": post.Category.ID, "slug": post.Category.Slug, "name": catName}
	}

	c.JSON(http.StatusOK, dto.Success(result))
}
