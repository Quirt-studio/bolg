package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/service"
	"fmt"
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ExportHandler struct {
	exportService *service.ExportService
}

func NewExportHandler() *ExportHandler {
	return &ExportHandler{
		exportService: service.NewExportService(),
	}
}

// Export exports all content as JSON download
// GET /api/v1/export
func (h *ExportHandler) Export(c *gin.Context) {
	data, err := h.exportService.ExportAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, "export failed"))
		return
	}

	c.Header("Content-Type", "application/json")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=bolg-export-%s.json", data.ExportAt[:10]))
	c.JSON(http.StatusOK, data)
}

// ExportPreview returns the export data as a preview (not a download)
// GET /api/v1/export/preview
func (h *ExportHandler) ExportPreview(c *gin.Context) {
	data, err := h.exportService.ExportAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, "export failed"))
		return
	}

	c.JSON(http.StatusOK, dto.Success(gin.H{
		"version":    data.Version,
		"export_at":  data.ExportAt,
		"works":      len(data.Works),
		"posts":      len(data.Posts),
		"categories": len(data.Categories),
		"tags":       len(data.Tags),
	}))
}

// Import imports content from uploaded JSON file
// POST /api/v1/import
func (h *ExportHandler) Import(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeValidation, "file is required"))
		return
	}

	f, err := file.Open()
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeValidation, "failed to read file"))
		return
	}
	defer f.Close()

	jsonData, err := io.ReadAll(f)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeValidation, "failed to read file content"))
		return
	}

	userID := c.GetUint("user_id")

	counts, err := h.exportService.ImportAll(jsonData, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeValidation, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(gin.H{
		"message": "import successful",
		"counts":  counts,
	}))
}
