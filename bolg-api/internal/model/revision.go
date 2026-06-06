package model

import "time"

type ContentRevision struct {
	ID             uint        `gorm:"primaryKey;autoIncrement" json:"id"`
	EntityType     string      `gorm:"type:varchar(50);index:idx_revisions_entity;not null" json:"entity_type"`
	EntityID       uint        `gorm:"index:idx_revisions_entity;not null" json:"entity_id"`
	RevisionNumber int         `gorm:"not null" json:"revision_number"`
	Snapshot       JSONContent `gorm:"type:json;not null" json:"snapshot"`
	ChangeSummary  string      `gorm:"type:varchar(255)" json:"change_summary"`
	CreatedBy      *uint       `gorm:"index" json:"created_by"`
	CreatedAt      time.Time   `json:"created_at"`
}
