package dto

import "time"

// PostTranslationInput is a single language translation input
type PostTranslationInput struct {
	Title   string `json:"title"`
	Excerpt string `json:"excerpt"`
	Content string `json:"content"`
}

// PostCreateRequest is the request to create a post
type PostCreateRequest struct {
	Slug           string                           `json:"slug" binding:"required"`
	CategoryID     *uint                            `json:"category_id"`
	CoverImageURL  string                           `json:"cover_image_url"`
	ReadingTime    int                              `json:"reading_time"`
	Featured       bool                             `json:"featured"`
	SortOrder      int                              `json:"sort_order"`
	Status         string                           `json:"status"`
	TagIDs         []uint                           `json:"tag_ids"`
	Translations   map[string]PostTranslationInput  `json:"translations"`
	SeoTitle       string                           `json:"seo_title"`
	SeoDescription string                           `json:"seo_description"`
	SeoKeywords    string                           `json:"seo_keywords"`
	OgImage        string                           `json:"og_image"`
	VideoURL       string                           `json:"video_url"`
}

// PostUpdateRequest is the request to update a post
type PostUpdateRequest struct {
	CategoryID     *uint                            `json:"category_id"`
	CoverImageURL  string                           `json:"cover_image_url"`
	ReadingTime    *int                             `json:"reading_time"`
	Featured       *bool                            `json:"featured"`
	SortOrder      *int                             `json:"sort_order"`
	Status         string                           `json:"status"`
	TagIDs         []uint                           `json:"tag_ids"`
	Translations   map[string]PostTranslationInput  `json:"translations"`
	SeoTitle       string                           `json:"seo_title"`
	SeoDescription string                           `json:"seo_description"`
	SeoKeywords    string                           `json:"seo_keywords"`
	OgImage        string                           `json:"og_image"`
	VideoURL       string                           `json:"video_url"`
}

// PostResponse is the API response for a post
type PostResponse struct {
	ID             uint                        `json:"id"`
	Slug           string                      `json:"slug"`
	Category       *CategoryBrief              `json:"category"`
	CoverImageURL  string                      `json:"cover_image_url"`
	ReadingTime    int                         `json:"reading_time"`
	ViewCount      int                         `json:"view_count"`
	Date           time.Time                   `json:"date"`
	Featured       bool                        `json:"featured"`
	SortOrder      int                         `json:"sort_order"`
	Status         string                      `json:"status"`
	PublishedAt    *time.Time                  `json:"published_at"`
	Tags           []TagBrief                  `json:"tags"`
	Translations   map[string]TranslationData  `json:"translations"`
	VideoURL       string                      `json:"video_url"`
	Seo            SeoData                     `json:"seo"`
	CreatedAt      time.Time                   `json:"created_at"`
	UpdatedAt      time.Time                   `json:"updated_at"`
}
