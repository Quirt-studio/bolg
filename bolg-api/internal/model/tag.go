package model

import "time"

type Tag struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Slug      string    `gorm:"type:varchar(100);uniqueIndex;not null" json:"slug"`
	CreatedAt time.Time `json:"created_at"`

	Translations []TagTranslation `gorm:"foreignKey:TagID" json:"translations,omitempty"`
}

type TagTranslation struct {
	ID   uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	TagID uint   `gorm:"uniqueIndex:idx_tag_trans;not null" json:"tag_id"`
	Lang  string `gorm:"type:enum('en','zh');uniqueIndex:idx_tag_trans;not null" json:"lang"`
	Name  string `gorm:"type:varchar(100);not null" json:"name"`
}
