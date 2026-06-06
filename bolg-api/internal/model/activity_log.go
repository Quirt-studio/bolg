package model

import "time"

type ActivityLog struct {
	ID          uint        `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID      *uint       `gorm:"index" json:"user_id"`
	Action      string      `gorm:"type:varchar(50);index;not null" json:"action"`
	EntityType  string      `gorm:"type:varchar(50);index:idx_logs_entity" json:"entity_type"`
	EntityID    uint        `gorm:"index:idx_logs_entity" json:"entity_id"`
	EntityName  string      `gorm:"type:varchar(200)" json:"entity_name"`
	Description string      `gorm:"type:varchar(500)" json:"description"`
	OldValue    JSONContent `gorm:"type:json" json:"old_value"`
	NewValue    JSONContent `gorm:"type:json" json:"new_value"`
	IPAddress   string      `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent   string      `gorm:"type:varchar(500)" json:"user_agent"`
	CreatedAt   time.Time   `gorm:"index" json:"created_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}
