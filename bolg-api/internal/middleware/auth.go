package middleware

import (
	"bolg-api/config"
	"bolg-api/internal/dto"
	jwtpkg "bolg-api/internal/pkg/jwt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func AuthRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, dto.Error(dto.ErrCodeUnauthorized, "Missing authorization header"))
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, dto.Error(dto.ErrCodeUnauthorized, "Invalid authorization format"))
			c.Abort()
			return
		}

		cfg := config.Get()
		claims, err := jwtpkg.ParseAccessToken(parts[1], cfg.JWT.AccessSecret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, dto.Error(dto.ErrCodeTokenInvalid, "Invalid or expired token"))
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}
