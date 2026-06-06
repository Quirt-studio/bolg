package model

import "time"

type MediaAsset struct {
	ID           uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Filename     string    `gorm:"type:varchar(255);not null" json:"filename"`
	OriginalName string    `gorm:"type:varchar(255);not null" json:"original_name"`
	MimeType     string    `gorm:"type:varchar(100);index;not null" json:"mime_type"`
	FileSize     int64     `gorm:"not null" json:"file_size"`
	Width        int       `gorm:"default:0" json:"width"`
	Height       int       `gorm:"default:0" json:"height"`
	URL          string    `gorm:"type:varchar(500);not null" json:"url"`
	ThumbnailURL string    `gorm:"type:varchar(500)" json:"thumbnail_url"`
	AltText      string    `gorm:"type:varchar(255)" json:"alt_text"`
	Folder       string    `gorm:"type:varchar(100);index" json:"folder"`
	UploadedBy   *uint     `gorm:"index" json:"uploaded_by"`
	CreatedAt    time.Time `json:"created_at"`
}
