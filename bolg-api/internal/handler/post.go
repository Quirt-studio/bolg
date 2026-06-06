package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/service"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type PostHandler struct {
	postService *service.PostService
}

func NewPostHandler() *PostHandler {
	return &PostHandler{postService: service.NewPostService()}
}

func (h *PostHandler) List(c *gin.Context) {
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

	posts, total, err := h.postService.List(page, perPage, status, lang, categoryID, featured, search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Paginated(posts, total, page, perPage))
}

func (h *PostHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	lang := c.Query("lang")
	post, err := h.postService.GetByID(uint(id), lang)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "Post not found"))
		return
	}

	c.JSON(http.StatusOK, dto.Success(post))
}

func (h *PostHandler) Create(c *gin.Context) {
	var req dto.PostCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	userID := c.GetUint("user_id")
	post, err := h.postService.Create(req, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusCreated, dto.Success(post))
}

func (h *PostHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	var req dto.PostUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	userID := c.GetUint("user_id")
	post, err := h.postService.Update(uint(id), req, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(post))
}

func (h *PostHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	if err := h.postService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *PostHandler) Publish(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	if err := h.postService.Publish(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *PostHandler) Unpublish(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	if err := h.postService.Unpublish(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *PostHandler) BatchDelete(c *gin.Context) {
	var req dto.BatchIDsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	if err := h.postService.BatchDelete(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *PostHandler) BatchPublish(c *gin.Context) {
	var req dto.BatchIDsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	if err := h.postService.BatchPublish(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *PostHandler) BatchUnpublish(c *gin.Context) {
	var req dto.BatchIDsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	if err := h.postService.BatchUnpublish(req.IDs); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}

func (h *PostHandler) SchedulePublish(c *gin.Context) {
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

	if err := h.postService.SchedulePublish(uint(id), publishAt); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}
