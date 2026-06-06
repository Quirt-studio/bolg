package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/service"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type WorkHandler struct {
	workService *service.WorkService
}

func NewWorkHandler() *WorkHandler {
	return &WorkHandler{workService: service.NewWorkService()}
}

func (h *WorkHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	status := c.Query("status")
	lang := c.Query("lang")
	search := c.Query("q")

	var categoryID *uint
	if cid := c.Query("category_id"); cid != "" {
		id, err := strconv.ParseUint(cid, 10, 64)
		if err == nil {
			uid := uint(id)
			categoryID = &uid
		}
	}

	var featured *bool
	if f := c.Query("featured"); f != "" {
		b := f == "true"
		featured = &b
	}

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	works, total, err := h.workService.List(page, perPage, status, lang, categoryID, featured, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Paginated(works, total, page, perPage))
}

func (h *WorkHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	lang := c.Query("lang")
	work, err := h.workService.GetByID(uint(id), lang)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "Work not found"))
		return
	}

	c.JSON(http.StatusOK, dto.Success(work))
}

func (h *WorkHandler) Create(c *gin.Context) {
	var req dto.WorkCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	userID := c.GetUint("user_id")
	work, err := h.workService.Create(req, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.Set("entity_name", work.Translations["en"].Title)
	c.JSON(http.StatusCreated, dto.Success(work))
}

func (h *WorkHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	var req dto.WorkUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	userID := c.GetUint("user_id")
	work, err := h.workService.Update(uint(id), req, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.Set("entity_name", work.Translations["en"].Title)
	c.JSON(http.StatusOK, dto.Success(work))
}

func (h *WorkHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	if err := h.workService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *WorkHandler) Publish(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	if err := h.workService.Publish(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *WorkHandler) Unpublish(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	if err := h.workService.Unpublish(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *WorkHandler) BatchDelete(c *gin.Context) {
	var req dto.BatchIDsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	if err := h.workService.BatchDelete(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *WorkHandler) BatchPublish(c *gin.Context) {
	var req dto.BatchIDsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	if err := h.workService.BatchPublish(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *WorkHandler) BatchUnpublish(c *gin.Context) {
	var req dto.BatchIDsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	if err := h.workService.BatchUnpublish(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *WorkHandler) SchedulePublish(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	var req struct {
		PublishAt string `json:"publish_at" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	publishAt, err := time.Parse("2006-01-02T15:04", req.PublishAt)
	if err != nil {
		publishAt, err = time.Parse("2006-01-02T15:04:05", req.PublishAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid datetime format, use YYYY-MM-DDTHH:MM"))
			return
		}
	}

	if err := h.workService.SchedulePublish(uint(id), publishAt); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}
