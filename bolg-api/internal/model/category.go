package model

import (
	"time"

	"gorm.io/gorm"
)

type Category struct {
	ID            uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Slug          string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"slug"`
	IconName      string         `gorm:"type:varchar(50)" json:"icon_name"`
	Color         string         `gorm:"type:varchar(20)" json:"color"`
	CoverImageURL string         `gorm:"type:varchar(500)" json:"cover_image_url"`
	ParentID  *uint          `gorm:"index" json:"parent_id"`
	SortOrder int            `gorm:"default:0;index" json:"sort_order"`
	Status    string         `gorm:"type:enum('active','inactive');default:'active';index" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Translations []CategoryTranslation `gorm:"foreignKey:CategoryID" json:"translations,omitempty"`
	Parent       *Category             `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
}

type CategoryTranslation struct {
	ID          uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	CategoryID  uint   `gorm:"uniqueIndex:idx_cat_trans;not null" json:"category_id"`
	Lang        string `gorm:"type:enum('en','zh');uniqueIndex:idx_cat_trans;not null" json:"lang"`
	Name        string `gorm:"type:varchar(100);not null" json:"name"`
	Description string `gorm:"type:text" json:"description"`
}
