package model

import (
	"time"

	"gorm.io/gorm"
)

type Post struct {
	ID             uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Slug           string         `gorm:"type:varchar(200);uniqueIndex;not null" json:"slug"`
	CategoryID     *uint          `gorm:"index" json:"category_id"`
	CoverImageURL  string         `gorm:"type:varchar(500)" json:"cover_image_url"`
	ReadingTime    int            `gorm:"default:0" json:"reading_time"`
	ViewCount      int            `gorm:"default:0" json:"view_count"`
	Featured       bool           `gorm:"default:false;index" json:"featured"`
	SortOrder      int            `gorm:"default:0" json:"sort_order"`
	Status         string         `gorm:"type:enum('draft','published','archived');default:'draft';index" json:"status"`
	PublishedAt    *time.Time     `gorm:"index" json:"published_at"`
	SeoTitle       string         `gorm:"type:varchar(200)" json:"seo_title"`
	SeoDescription string         `gorm:"type:varchar(500)" json:"seo_description"`
	SeoKeywords    string         `gorm:"type:varchar(255)" json:"seo_keywords"`
	OgImage        string         `gorm:"type:varchar(500)" json:"og_image"`
	VideoURL       string         `gorm:"type:varchar(500)" json:"video_url"`
	CreatedBy      *uint          `gorm:"index" json:"created_by"`
	UpdatedBy      *uint          `gorm:"index" json:"updated_by"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	Category     *Category           `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Translations []PostTranslation   `gorm:"foreignKey:PostID" json:"translations,omitempty"`
	Tags         []Tag               `gorm:"many2many:post_tags;" json:"tags,omitempty"`
}

type PostTranslation struct {
	ID      uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	PostID  uint   `gorm:"uniqueIndex:idx_post_trans;not null" json:"post_id"`
	Lang    string `gorm:"type:enum('en','zh');uniqueIndex:idx_post_trans;not null" json:"lang"`
	Title   string `gorm:"type:varchar(200);not null" json:"title"`
	Excerpt string `gorm:"type:text" json:"excerpt"`
	Content string `gorm:"type:longtext" json:"content"`
}

type PostTag struct {
	PostID uint `gorm:"primaryKey" json:"post_id"`
	TagID  uint `gorm:"primaryKey;index" json:"tag_id"`
}
