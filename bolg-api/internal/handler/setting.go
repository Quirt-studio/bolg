package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/model"
	"bolg-api/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type SettingHandler struct {
	settingService *service.SettingService
}

func NewSettingHandler() *SettingHandler {
	return &SettingHandler{settingService: service.NewSettingService()}
}

func (h *SettingHandler) GetAll(c *gin.Context) {
	settings, err := h.settingService.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(settings))
}

func (h *SettingHandler) GetByKey(c *gin.Context) {
	key := c.Param("key")
	setting, err := h.settingService.GetByKey(key)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "Setting not found"))
		return
	}
	c.JSON(http.StatusOK, dto.Success(setting))
}

func (h *SettingHandler) Update(c *gin.Context) {
	key := c.Param("key")
	var req struct {
		Value model.JSONContent `json:"value" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	userID := c.GetUint("user_id")
	setting, err := h.settingService.Update(key, req.Value, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(setting))
}
