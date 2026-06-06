package middleware

import (
	"bolg-api/internal/dto"
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RequirePermission(permName string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleName, exists := c.Get("role")
		if !exists {
			c.JSON(http.StatusForbidden, dto.Error(dto.ErrCodeForbidden, "No role found"))
			c.Abort()
			return
		}

		// admin role has all permissions
		if roleName.(string) == "admin" {
			c.Next()
			return
		}

		// Check permission from DB
		var count int64
		database.DB.Table("permissions p").
			Joins("JOIN role_permissions rp ON rp.permission_id = p.id").
			Joins("JOIN roles r ON r.id = rp.role_id").
			Where("r.name = ? AND p.name = ?", roleName, permName).
			Count(&count)

		if count == 0 {
			c.JSON(http.StatusForbidden, dto.Error(dto.ErrCodeForbidden, "Permission denied"))
			c.Abort()
			return
		}

		c.Next()
	}
}

// GetCurrentPermissions returns the permission names for the current user's role
func GetCurrentPermissions(c *gin.Context) []string {
	roleName, exists := c.Get("role")
	if !exists {
		return nil
	}

	if roleName.(string) == "admin" {
		var perms []model.Permission
		database.DB.Find(&perms)
		names := make([]string, len(perms))
		for i, p := range perms {
			names[i] = p.Name
		}
		return names
	}

	var perms []model.Permission
	database.DB.Table("permissions p").
		Joins("JOIN role_permissions rp ON rp.permission_id = p.id").
		Joins("JOIN roles r ON r.id = rp.role_id").
		Where("r.name = ?", roleName).
		Find(&perms)

	names := make([]string, len(perms))
	for i, p := range perms {
		names[i] = p.Name
	}
	return names
}
