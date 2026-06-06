package dto

// LoginRequest is the login request payload
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse is the login response
type LoginResponse struct {
	AccessToken  string     `json:"access_token"`
	RefreshToken string     `json:"refresh_token"`
	TokenType    string     `json:"token_type"`
	ExpiresIn    int        `json:"expires_in"`
	User         UserInfo   `json:"user"`
}

// RefreshRequest is the refresh token request
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// UserInfo is the user info in auth response
type UserInfo struct {
	ID          uint         `json:"id"`
	Username    string       `json:"username"`
	Email       string       `json:"email"`
	DisplayName string       `json:"display_name"`
	AvatarURL   string       `json:"avatar_url"`
	Role        RoleInfo     `json:"role"`
}

// RoleInfo is the role info in auth response
type RoleInfo struct {
	ID          uint     `json:"id"`
	Name        string   `json:"name"`
	Permissions []string `json:"permissions"`
}

// ChangePasswordRequest is the change password request
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}
