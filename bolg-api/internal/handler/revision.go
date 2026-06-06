package handler

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type RevisionHandler struct {
	revisionService *service.RevisionService
}

func NewRevisionHandler() *RevisionHandler {
	return &RevisionHandler{
		revisionService: service.NewRevisionService(),
	}
}

// List returns revision history for an entity
// GET /api/v1/revisions?entity_type=work&entity_id=1&page=1&per_page=20
func (h *RevisionHandler) List(c *gin.Context) {
	entityType := c.Query("entity_type")
	entityIDStr := c.Query("entity_id")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	if entityType == "" || entityIDStr == "" {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeValidation, "entity_type and entity_id are required"))
		return
	}

	entityID, err := strconv.ParseUint(entityIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeValidation, "invalid entity_id"))
		return
	}

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	revisions, total, err := h.revisionService.ListRevisions(entityType, uint(entityID), page, perPage)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, "failed to fetch revisions"))
		return
	}

	c.JSON(http.StatusOK, dto.Paginated(revisions, total, page, perPage))
}

// Get returns a single revision by ID
// GET /api/v1/revisions/:id
func (h *RevisionHandler) Get(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeValidation, "invalid revision id"))
		return
	}

	revision, err := h.revisionService.GetRevision(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "revision not found"))
		return
	}

	c.JSON(http.StatusOK, dto.Success(revision))
}

// Rollback restores an entity to a previous revision
// POST /api/v1/revisions/:id/rollback
func (h *RevisionHandler) Rollback(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeValidation, "invalid revision id"))
		return
	}

	// Get entity_type from query or from revision
	entityType := c.Query("entity_type")
	if entityType == "" {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeValidation, "entity_type is required"))
		return
	}

	userID := c.GetUint("user_id")

	err = h.revisionService.Rollback(entityType, uint(id), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(gin.H{"message": "rollback successful"}))
}
