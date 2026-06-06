package middleware

import (
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

func AuditLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Skip GET and OPTIONS requests
		if c.Request.Method == http.MethodGet || c.Request.Method == http.MethodOptions {
			c.Next()
			return
		}

		// Record start time
		start := time.Now()
		c.Next()

		// Extract entity type from path
		entityType := extractEntityType(c.Request.URL.Path)
		entityID := extractEntityID(c.Request.URL.Path)
		action := mapMethodToAction(c.Request.Method)

		// Get user ID if available
		var userID *uint
		if uid, exists := c.Get("user_id"); exists {
			id := uid.(uint)
			userID = &id
		}

		// Get entity name from context (set by handler)
		entityName, _ := c.Get("entity_name")

		log := model.ActivityLog{
			UserID:      userID,
			Action:      action,
			EntityType:  entityType,
			EntityID:    entityID,
			EntityName:  toString(entityName),
			IPAddress:   c.ClientIP(),
			UserAgent:   c.Request.UserAgent(),
			CreatedAt:   start,
		}

		// Async write log
		go func() {
			database.DB.Create(&log)
		}()
	}
}

func extractEntityType(path string) string {
	parts := strings.Split(strings.TrimPrefix(path, "/api/v1/"), "/")
	if len(parts) > 0 {
		return parts[0]
	}
	return ""
}

func extractEntityID(path string) uint {
	parts := strings.Split(strings.TrimPrefix(path, "/api/v1/"), "/")
	for i, p := range parts {
		if i > 0 && isNumeric(p) {
			val := 0
			for _, ch := range p {
				val = val*10 + int(ch-'0')
			}
			return uint(val)
		}
	}
	return 0
}

func mapMethodToAction(method string) string {
	switch method {
	case http.MethodPost:
		return "create"
	case http.MethodPut, http.MethodPatch:
		return "update"
	case http.MethodDelete:
		return "delete"
	default:
		return method
	}
}

func isNumeric(s string) bool {
	if len(s) == 0 {
		return false
	}
	for _, ch := range s {
		if ch < '0' || ch > '9' {
			return false
		}
	}
	return true
}

func toString(v interface{}) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return ""
}
