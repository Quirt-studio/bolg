package service

import (
	"bolg-api/config"
	"bolg-api/internal/dto"
	"bolg-api/internal/model"
	"bolg-api/internal/pkg/database"
	"bolg-api/internal/pkg/hash"
	jwtpkg "bolg-api/internal/pkg/jwt"
	"errors"
	"time"
)

type AuthService struct{}

func NewAuthService() *AuthService {
	return &AuthService{}
}

func (s *AuthService) Login(username, password, ipAddress string) (*dto.LoginResponse, error) {
	var user model.User
	err := database.DB.Preload("Role.Permissions").Where("username = ? OR email = ?", username, username).First(&user).Error
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !user.IsActive {
		return nil, errors.New("account disabled")
	}

	if !hash.CheckPassword(password, user.PasswordHash) {
		// Log failed login attempt
		database.DB.Create(&model.ActivityLog{
			UserID:      &user.ID,
			Action:      "login_failed",
			EntityType:  "auth",
			EntityID:    user.ID,
			EntityName:  user.Username,
			Description: "Failed login attempt",
			IPAddress:   ipAddress,
		})
		return nil, errors.New("invalid credentials")
	}

	// Update last login
	now := time.Now()
	database.DB.Model(&user).Updates(map[string]interface{}{
		"last_login_at": now,
	})

	// Log successful login
	database.DB.Create(&model.ActivityLog{
		UserID:      &user.ID,
		Action:      "login",
		EntityType:  "auth",
		EntityID:    user.ID,
		EntityName:  user.Username,
		Description: "User logged in",
		IPAddress:   ipAddress,
	})

	// Generate tokens
	cfg := config.Get()
	accessToken, err := jwtpkg.GenerateAccessToken(user.ID, user.Role.Name, cfg.JWT.AccessSecret, cfg.JWT.AccessExpire)
	if err != nil {
		return nil, errors.New("failed to generate access token")
	}

	refreshToken, err := jwtpkg.GenerateRefreshToken(user.ID, cfg.JWT.RefreshSecret, cfg.JWT.RefreshExpire)
	if err != nil {
		return nil, errors.New("failed to generate refresh token")
	}

	// Build permissions list
	perms := make([]string, len(user.Role.Permissions))
	for i, p := range user.Role.Permissions {
		perms[i] = p.Name
	}

	return &dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    cfg.JWT.AccessExpire,
		User: dto.UserInfo{
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
		},
	}, nil
}

func (s *AuthService) Refresh(refreshToken string) (*dto.LoginResponse, error) {
	cfg := config.Get()
	claims, err := jwtpkg.ParseRefreshToken(refreshToken, cfg.JWT.RefreshSecret)
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}

	// Get user
	var user model.User
	err = database.DB.Preload("Role.Permissions").First(&user, claims.Subject).Error
	if err != nil {
		return nil, errors.New("user not found")
	}

	if !user.IsActive {
		return nil, errors.New("account disabled")
	}

	// Generate new tokens
	accessToken, err := jwtpkg.GenerateAccessToken(user.ID, user.Role.Name, cfg.JWT.AccessSecret, cfg.JWT.AccessExpire)
	if err != nil {
		return nil, errors.New("failed to generate access token")
	}

	newRefreshToken, err := jwtpkg.GenerateRefreshToken(user.ID, cfg.JWT.RefreshSecret, cfg.JWT.RefreshExpire)
	if err != nil {
		return nil, errors.New("failed to generate refresh token")
	}

	perms := make([]string, len(user.Role.Permissions))
	for i, p := range user.Role.Permissions {
		perms[i] = p.Name
	}

	return &dto.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshToken,
		TokenType:    "Bearer",
		ExpiresIn:    cfg.JWT.AccessExpire,
		User: dto.UserInfo{
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
		},
	}, nil
}

func (s *AuthService) GetCurrentUser(userID uint) (*dto.UserInfo, error) {
	var user model.User
	err := database.DB.Preload("Role.Permissions").First(&user, userID).Error
	if err != nil {
		return nil, errors.New("user not found")
	}

	perms := make([]string, len(user.Role.Permissions))
	for i, p := range user.Role.Permissions {
		perms[i] = p.Name
	}

	return &dto.UserInfo{
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
	}, nil
}

func (s *AuthService) ChangePassword(userID uint, oldPassword, newPassword string) error {
	var user model.User
	if err := database.DB.First(&user, userID).Error; err != nil {
		return errors.New("user not found")
	}

	if !hash.CheckPassword(oldPassword, user.PasswordHash) {
		return errors.New("old password is incorrect")
	}

	hashedPassword, err := hash.HashPassword(newPassword)
	if err != nil {
		return errors.New("failed to hash password")
	}

	if err := database.DB.Model(&user).Update("password_hash", hashedPassword).Error; err != nil {
		return errors.New("failed to update password")
	}

	return nil
}
