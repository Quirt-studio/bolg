package dto

import "time"

// LocalizedField represents a multilingual text field
type LocalizedField struct {
	En string `json:"en"`
	Zh string `json:"zh"`
}

// WorkTranslationInput is a single language translation input
type WorkTranslationInput struct {
	Title   string `json:"title"`
	Excerpt string `json:"excerpt"`
	Content string `json:"content"`
}

// WorkCreateRequest is the request to create a work
type WorkCreateRequest struct {
	Slug           string                          `json:"slug" binding:"required"`
	CategoryID     *uint                           `json:"category_id"`
	CoverImageURL  string                          `json:"cover_image_url"`
	Gradient       string                          `json:"gradient"`
	Date           string                          `json:"date" binding:"required"`
	Featured       bool                            `json:"featured"`
	SortOrder      int                             `json:"sort_order"`
	Status         string                          `json:"status"`
	TagIDs         []uint                          `json:"tag_ids"`
	Translations   map[string]WorkTranslationInput `json:"translations"`
	SeoTitle       string                          `json:"seo_title"`
	SeoDescription string                          `json:"seo_description"`
	SeoKeywords    string                          `json:"seo_keywords"`
	OgImage        string                          `json:"og_image"`
	VideoURL       string                          `json:"video_url"`
	Link           string                          `json:"link"`
}

// WorkUpdateRequest is the request to update a work
type WorkUpdateRequest struct {
	CategoryID     *uint                           `json:"category_id"`
	CoverImageURL  *string                         `json:"cover_image_url"`
	Gradient       string                          `json:"gradient"`
	Date           string                          `json:"date"`
	Featured       *bool                           `json:"featured"`
	SortOrder      *int                            `json:"sort_order"`
	Status         string                          `json:"status"`
	TagIDs         []uint                          `json:"tag_ids"`
	Translations   map[string]WorkTranslationInput `json:"translations"`
	SeoTitle       string                          `json:"seo_title"`
	SeoDescription string                          `json:"seo_description"`
	SeoKeywords    string                          `json:"seo_keywords"`
	OgImage        string                          `json:"og_image"`
	VideoURL       string                          `json:"video_url"`
	Link           string                          `json:"link"`
}

// WorkResponse is the API response for a work
type WorkResponse struct {
	ID             uint                        `json:"id"`
	Slug           string                      `json:"slug"`
	Category       *CategoryBrief              `json:"category"`
	CoverImageURL  string                      `json:"cover_image_url"`
	Gradient       string                      `json:"gradient"`
	Date           time.Time                   `json:"date"`
	Featured       bool                        `json:"featured"`
	SortOrder      int                         `json:"sort_order"`
	Status         string                      `json:"status"`
	PublishedAt    *time.Time                  `json:"published_at"`
	Tags           []TagBrief                  `json:"tags"`
	Translations   map[string]TranslationData  `json:"translations"`
	VideoURL       string                      `json:"video_url"`
	Link           string                      `json:"link"`
	Seo            SeoData                     `json:"seo"`
	CreatedAt      time.Time                   `json:"created_at"`
	UpdatedAt      time.Time                   `json:"updated_at"`
}

// CategoryBrief is a brief category for nested display
type CategoryBrief struct {
	ID   uint   `json:"id"`
	Slug string `json:"slug"`
	Name string `json:"name"`
}

// TagBrief is a brief tag for nested display
type TagBrief struct {
	ID   uint   `json:"id"`
	Slug string `json:"slug"`
	Name string `json:"name"`
}

// TranslationData is the translation content
type TranslationData struct {
	Title   string `json:"title"`
	Excerpt string `json:"excerpt"`
	Content string `json:"content,omitempty"`
}

// SeoData is the SEO metadata
type SeoData struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Keywords    string `json:"keywords"`
	OgImage     string `json:"og_image"`
}

// BatchIDsRequest is a batch operation request with multiple IDs
type BatchIDsRequest struct {
	IDs []uint `json:"ids" binding:"required,min=1"`
}
