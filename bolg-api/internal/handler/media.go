package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type MediaHandler struct {
	mediaService *service.MediaService
}

func NewMediaHandler() *MediaHandler {
	return &MediaHandler{mediaService: service.NewMediaService()}
}

func (h *MediaHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))
	folder := c.Query("folder")
	mimeType := c.Query("mime_type")
	search := c.Query("q")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	assets, total, err := h.mediaService.List(folder, mimeType, search, page, perPage)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Paginated(assets, total, page, perPage))
}

func (h *MediaHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	asset, err := h.mediaService.GetByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "Media not found"))
		return
	}

	c.JSON(http.StatusOK, dto.Success(asset))
}

func (h *MediaHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "No file provided"))
		return
	}

	folder := c.DefaultPostForm("folder", "general")
	altText := c.PostForm("alt_text")
	userID := c.GetUint("user_id")

	asset, err := h.mediaService.Upload(file, folder, altText, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeFileUploadFailed, err.Error()))
		return
	}

	c.JSON(http.StatusCreated, dto.Success(asset))
}

func (h *MediaHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Invalid ID"))
		return
	}

	if err := h.mediaService.Delete(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(nil))
}
