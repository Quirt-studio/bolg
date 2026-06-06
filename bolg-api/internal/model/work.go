package model

import (
	"time"

	"gorm.io/gorm"
)

type Work struct {
	ID             uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Slug           string         `gorm:"type:varchar(200);uniqueIndex;not null" json:"slug"`
	CategoryID     *uint          `gorm:"index" json:"category_id"`
	CoverImageURL  string         `gorm:"type:varchar(500)" json:"cover_image_url"`
	Gradient       string         `gorm:"type:varchar(255)" json:"gradient"`
	Date           time.Time      `gorm:"type:date;index" json:"date"`
	Featured       bool           `gorm:"default:false;index" json:"featured"`
	SortOrder      int            `gorm:"default:0;index" json:"sort_order"`
	Status         string         `gorm:"type:enum('draft','published','archived','scheduled');default:'draft';index" json:"status"`
	PublishedAt    *time.Time     `gorm:"index" json:"published_at"`
	SeoTitle       string         `gorm:"type:varchar(200)" json:"seo_title"`
	SeoDescription string         `gorm:"type:varchar(500)" json:"seo_description"`
	SeoKeywords    string         `gorm:"type:varchar(255)" json:"seo_keywords"`
	OgImage        string         `gorm:"type:varchar(500)" json:"og_image"`
	VideoURL       string         `gorm:"type:varchar(500)" json:"video_url"`
	Link           string         `gorm:"type:varchar(500)" json:"link"`
	CreatedBy      *uint          `gorm:"index" json:"created_by"`
	UpdatedBy      *uint          `gorm:"index" json:"updated_by"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	Category     *Category           `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Translations []WorkTranslation   `gorm:"foreignKey:WorkID" json:"translations,omitempty"`
	Tags         []Tag               `gorm:"many2many:work_tags;" json:"tags,omitempty"`
}

type WorkTranslation struct {
	ID      uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkID  uint   `gorm:"uniqueIndex:idx_work_trans;not null" json:"work_id"`
	Lang    string `gorm:"type:enum('en','zh');uniqueIndex:idx_work_trans;not null" json:"lang"`
	Title   string `gorm:"type:varchar(200);not null" json:"title"`
	Excerpt string `gorm:"type:text" json:"excerpt"`
	Content string `gorm:"type:longtext" json:"content"`
}

type WorkTag struct {
	WorkID uint `gorm:"primaryKey" json:"work_id"`
	TagID  uint `gorm:"primaryKey;index" json:"tag_id"`
}
