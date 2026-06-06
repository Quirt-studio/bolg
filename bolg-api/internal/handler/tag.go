package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TagHandler struct {
	tagService *service.TagService
}

func NewTagHandler() *TagHandler {
	return &TagHandler{tagService: service.NewTagService()}
}

func (h *TagHandler) List(c *gin.Context) {
	lang := c.Query("lang")
	tags, err := h.tagService.List(lang)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(tags))
}

func (h *TagHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}
	tag, err := h.tagService.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "Tag not found"))
		return
	}
	c.JSON(http.StatusOK, dto.Success(tag))
}

func (h *TagHandler) Create(c *gin.Context) {
	var req struct {
		Slug         string                       `json:"slug" binding:"required"`
		Translations map[string]map[string]string `json:"translations"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	tag, err := h.tagService.Create(req.Slug, req.Translations)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusCreated, dto.Success(tag))
}

func (h *TagHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	var req struct {
		Translations map[string]map[string]string `json:"translations"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	tag, err := h.tagService.Update(uint(id), req.Translations)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(tag))
}

func (h *TagHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}
	if err := h.tagService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *TagHandler) BatchDelete(c *gin.Context) {
	var req dto.BatchIDsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}
	if err := h.tagService.BatchDelete(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(nil))
}
