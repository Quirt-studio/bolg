package handler

import (
	"bolg-api/config"
	"bolg-api/internal/dto"
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"bolg-api/internal/pkg/hash"
	jwtpkg "bolg-api/internal/pkg/jwt"
	"bolg-api/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{authService: service.NewAuthService()}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	resp, err := h.authService.Login(req.Username, req.Password, c.ClientIP())
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.Error(dto.ErrCodeLoginFailed, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(resp))
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	var req dto.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	resp, err := h.authService.Refresh(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.Error(dto.ErrCodeTokenInvalid, err.Error()))
		return
	}

	c.JSON(http.StatusOK, dto.Success(resp))
}

func (h *AuthHandler) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, dto.Success(gin.H{"message": "Logged out"}))
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID := c.GetUint("user_id")

	var user model.User
	err := database.DB.Preload("Role.Permissions").First(&user, userID).Error
	if err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "User not found"))
		return
	}

	perms := make([]string, len(user.Role.Permissions))
	for i, p := range user.Role.Permissions {
		perms[i] = p.Name
	}

	c.JSON(http.StatusOK, dto.Success(dto.UserInfo{
		ID:          user.ID,
		Username:    user.Username,
		Email:       user.Email,
		DisplayName: user.DisplayName,
		AvatarURL:   user.AvatarURL,
		Role: dto.RoleInfo{
			ID:          user.Role.ID,
			Name:        user.Role.Name,
			Permissions: perms,
		},
	}))
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	var req struct {
		OldPassword string `json:"old_password" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, err.Error()))
		return
	}

	userID := c.GetUint("user_id")
	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "User not found"))
		return
	}

	if !hash.CheckPassword(req.OldPassword, user.PasswordHash) {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "Old password is incorrect"))
		return
	}

	hashedPassword, err := hash.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, "Failed to hash password"))
		return
	}

	database.DB.Model(&user).Update("password_hash", hashedPassword)
	c.JSON(http.StatusOK, dto.Success(gin.H{"message": "Password changed successfully"}))
}

// ForgotPassword generates a password reset token
// POST /api/v1/auth/forgot-password { username_or_email }
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req struct {
		UsernameOrEmail string `json:"username_or_email" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "username_or_email is required"))
		return
	}

	var user model.User
	err := database.DB.Where("username = ? OR email = ?", req.UsernameOrEmail, req.UsernameOrEmail).First(&user).Error
	if err != nil {
		c.JSON(http.StatusOK, dto.Success(gin.H{"message": "If the account exists, a reset token has been generated"}))
		return
	}

	cfg := config.Get()
	token, err := jwtpkg.GeneratePreviewToken("reset", user.ID, cfg.JWT.AccessSecret, 3600)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, "failed to generate token"))
		return
	}

	database.DB.Create(&model.ActivityLog{
		UserID:      &user.ID,
		Action:      "password_reset_requested",
		EntityType:  "auth",
		EntityID:    user.ID,
		EntityName:  user.Username,
		Description: "Password reset token generated",
		IPAddress:   c.ClientIP(),
	})

	c.JSON(http.StatusOK, dto.Success(gin.H{
		"message":    "If the account exists, a reset token has been generated",
		"reset_token": token,
	}))
}

// ResetPassword resets the password using a reset token
// POST /api/v1/auth/reset-password { token, new_password }
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req struct {
		Token       string `json:"token" binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=6"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "token and new_password (min 6 chars) required"))
		return
	}

	cfg := config.Get()
	claims, err := jwtpkg.ParsePreviewToken(req.Token, cfg.JWT.AccessSecret)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "invalid or expired token"))
		return
	}

	if claims.EntityType != "reset" {
		c.JSON(http.StatusBadRequest, dto.Error(dto.ErrCodeBadRequest, "invalid token type"))
		return
	}

	var user model.User
	if err := database.DB.First(&user, claims.EntityID).Error; err != nil {
		c.JSON(http.StatusNotFound, dto.Error(dto.ErrCodeNotFound, "user not found"))
		return
	}

	hashedPassword, err := hash.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.Error(dto.ErrCodeInternal, "failed to hash password"))
		return
	}

	database.DB.Model(&user).Update("password_hash", hashedPassword)

	database.DB.Create(&model.ActivityLog{
		UserID:      &user.ID,
		Action:      "password_reset",
		EntityType:  "auth",
		EntityID:    user.ID,
		EntityName:  user.Username,
		Description: "Password was reset",
		IPAddress:   c.ClientIP(),
	})

	c.JSON(http.StatusOK, dto.Success(gin.H{"message": "Password reset successfully"}))
}
