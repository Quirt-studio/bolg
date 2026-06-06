package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

type AboutSection struct {
	ID         uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	SectionKey string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"section_key"`
	SortOrder  int       `gorm:"default:0" json:"sort_order"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	Translations []AboutTranslation `gorm:"foreignKey:SectionID" json:"translations,omitempty"`
}

type JSONContent map[string]interface{}

func (j JSONContent) Value() (driver.Value, error) {
	return json.Marshal(j)
}

func (j *JSONContent) Scan(value interface{}) error {
	if value == nil {
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}
	return json.Unmarshal(bytes, j)
}

type AboutTranslation struct {
	ID        uint        `gorm:"primaryKey;autoIncrement" json:"id"`
	SectionID uint        `gorm:"uniqueIndex:idx_about_trans;not null" json:"section_id"`
	Lang      string      `gorm:"type:enum('en','zh');uniqueIndex:idx_about_trans;not null" json:"lang"`
	Title     string      `gorm:"type:varchar(200)" json:"title"`
	Content   JSONContent `gorm:"type:json;not null" json:"content"`
}
