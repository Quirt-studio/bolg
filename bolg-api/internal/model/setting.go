package model

import "time"

type SiteSetting struct {
	ID           uint        `gorm:"primaryKey;autoIncrement" json:"id"`
	SettingKey   string      `gorm:"type:varchar(100);uniqueIndex;not null" json:"setting_key"`
	SettingValue JSONContent `gorm:"type:json;not null" json:"setting_value"`
	UpdatedBy    *uint       `gorm:"index" json:"updated_by"`
	CreatedAt    time.Time   `json:"created_at"`
	UpdatedAt    time.Time   `json:"updated_at"`
}
