package model

// AllModels returns all GORM models for auto-migration
func AllModels() []interface{} {
	return []interface{}{
		&Role{},
		&Permission{},
		&User{},
		&Category{},
		&CategoryTranslation{},
		&Tag{},
		&TagTranslation{},
		&Work{},
		&WorkTranslation{},
		&WorkTag{},
		&Post{},
		&PostTranslation{},
		&PostTag{},
		&TimelineMilestone{},
		&TimelineTranslation{},
		&AboutSection{},
		&AboutTranslation{},
		&SiteSetting{},
		&MediaAsset{},
		&ContentRevision{},
		&ActivityLog{},
	}
}
