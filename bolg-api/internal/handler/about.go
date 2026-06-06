package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/model"
	"bolg-api/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AboutHandler struct {
	aboutService *service.AboutService
}

func NewAboutHandler() *AboutHandler {
	return &AboutHandler{aboutService: service.NewAboutService()}
}

func (h *AboutHandler) GetSections(c *gin.Context) {
	sections, err := h.aboutService.GetSections()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(gin.H{"sections": sections}))
}

func (h *AboutHandler) UpdateSection(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	var req struct {
		Translations map[string]model.JSONContent `json:"translations"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	section, err := h.aboutService.UpdateSection(uint(id), req.Translations)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(section))
}
