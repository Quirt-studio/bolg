package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type CategoryHandler struct {
	categoryService *service.CategoryService
}

func NewCategoryHandler() *CategoryHandler {
	return &CategoryHandler{categoryService: service.NewCategoryService()}
}

func (h *CategoryHandler) List(c *gin.Context) {
	status := c.Query("status")
	lang := c.Query("lang")

	categories, err := h.categoryService.List(lang, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(categories))
}

func (h *CategoryHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	category, err := h.categoryService.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "Category not found"))
		return
	}

	c.JSON(http.StatusOK, dto.Success(category))
}

func (h *CategoryHandler) Create(c *gin.Context) {
	var req struct {
		Slug           string                           `json:"slug" binding:"required"`
		IconName       string                           `json:"icon_name"`
		Color          string                           `json:"color"`
		CoverImageURL  string                           `json:"cover_image_url"`
		ParentID       *uint                            `json:"parent_id"`
		SortOrder      int                              `json:"sort_order"`
		Translations   map[string]map[string]string     `json:"translations"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	category, err := h.categoryService.Create(req.Slug, req.IconName, req.Color, req.CoverImageURL, req.ParentID, req.SortOrder, req.Translations)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusCreated, dto.Success(category))
}

func (h *CategoryHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	var req struct {
		IconName       *string                          `json:"icon_name"`
		Color          *string                          `json:"color"`
		CoverImageURL  *string                          `json:"cover_image_url"`
		ParentID       *uint                            `json:"parent_id"`
		SortOrder      *int                             `json:"sort_order"`
		Status         *string                          `json:"status"`
		Translations   map[string]map[string]string     `json:"translations"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	updates := map[string]interface{}{}
	if req.IconName != nil {
		updates["icon_name"] = *req.IconName
	}
	if req.Color != nil {
		updates["color"] = *req.Color
	}
	if req.CoverImageURL != nil {
		updates["cover_image_url"] = *req.CoverImageURL
	}
	if req.ParentID != nil {
		updates["parent_id"] = *req.ParentID
	}
	if req.SortOrder != nil {
		updates["sort_order"] = *req.SortOrder
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}

	category, err := h.categoryService.Update(uint(id), updates, req.Translations)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(category))
}

func (h *CategoryHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	if err := h.categoryService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *CategoryHandler) BatchDelete(c *gin.Context) {
	var req dto.BatchIDsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}
	if err := h.categoryService.BatchDelete(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}
	c.JSON(http.StatusOK, dto.Success(nil))
}
