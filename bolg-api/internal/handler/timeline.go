package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TimelineHandler struct {
	timelineService *service.TimelineService
}

func NewTimelineHandler() *TimelineHandler {
	return &TimelineHandler{timelineService: service.NewTimelineService()}
}

func (h *TimelineHandler) List(c *gin.Context) {
	status := c.DefaultQuery("status", "published")
	milestones, err := h.timelineService.List(status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(milestones))
}

func (h *TimelineHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}
	milestone, err := h.timelineService.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "Milestone not found"))
		return
	}
	c.JSON(http.StatusOK, dto.Success(milestone))
}

func (h *TimelineHandler) Create(c *gin.Context) {
	var req struct {
		Date         string                       `json:"date" binding:"required"`
		IconName     string                       `json:"icon_name"`
		SortOrder    int                          `json:"sort_order"`
		Status       string                       `json:"status"`
		Translations map[string]map[string]string `json:"translations"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}
	milestone, err := h.timelineService.Create(req.Date, req.IconName, req.SortOrder, req.Status, req.Translations)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.Success(milestone))
}

func (h *TimelineHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}
	var req struct {
		Date         *string                      `json:"date"`
		IconName     *string                      `json:"icon_name"`
		SortOrder    *int                         `json:"sort_order"`
		Status       *string                      `json:"status"`
		Translations map[string]map[string]string `json:"translations"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}
	updates := map[string]interface{}{}
	if req.Date != nil {
		updates["date"] = *req.Date
	}
	if req.IconName != nil {
		updates["icon_name"] = *req.IconName
	}
	if req.SortOrder != nil {
		updates["sort_order"] = *req.SortOrder
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}
	milestone, err := h.timelineService.Update(uint(id), updates, req.Translations)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(milestone))
}

func (h *TimelineHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}
	if err := h.timelineService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(nil))
}
