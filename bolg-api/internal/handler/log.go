package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type LogHandler struct{}

func NewLogHandler() *LogHandler {
	return &LogHandler{}
}

// List returns activity logs with optional filters
// GET /api/v1/logs?action=login&page=1&per_page=20
func (h *LogHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	action := c.Query("action")
	entityType := c.Query("entity_type")
	userIDStr := c.Query("user_id")

	if page < 1 { page = 1 }
	if perPage < 1 || perPage > 100 { perPage = 20 }

	query := database.DB.Model(&model.ActivityLog{}).Preload("User")

	if action != "" {
		query = query.Where("action = ?", action)
	}
	if entityType != "" {
		query = query.Where("entity_type = ?", entityType)
	}
	if userIDStr != "" {
		query = query.Where("user_id = ?", userIDStr)
	}

	var total int64
	query.Count(&total)

	var logs []model.ActivityLog
	query.Order("created_at DESC").
		Offset((page - 1) * perPage).Limit(perPage).
		Find(&logs)

	if logs == nil {
		logs = []model.ActivityLog{}
	}

	c.JSON(http.StatusOK, dto.Paginated(logs, total, page, perPage))
}
