package model

import (
	"time"

	"gorm.io/gorm"
)

type TimelineMilestone struct {
	ID        uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Date      time.Time      `gorm:"type:date;index" json:"date"`
	IconName  string         `gorm:"type:varchar(50)" json:"icon_name"`
	SortOrder int            `gorm:"default:0;index" json:"sort_order"`
	Status    string         `gorm:"type:enum('draft','published');default:'published';index" json:"status"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	Translations []TimelineTranslation `gorm:"foreignKey:MilestoneID" json:"translations,omitempty"`
}

type TimelineTranslation struct {
	ID          uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	MilestoneID uint   `gorm:"uniqueIndex:idx_timeline_trans;not null" json:"milestone_id"`
	Lang        string `gorm:"type:enum('en','zh');uniqueIndex:idx_timeline_trans;not null" json:"lang"`
	Title       string `gorm:"type:varchar(200);not null" json:"title"`
	Description string `gorm:"type:text" json:"description"`
}
