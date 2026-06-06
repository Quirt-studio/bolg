package jwt

import (
	"errors"
	"time"

	jwtlib "github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID uint   `json:"user_id"`
	Role   string `json:"role"`
	jwtlib.RegisteredClaims
}

func GenerateAccessToken(userID uint, role, secret string, expireSeconds int) (string, error) {
	claims := Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwtlib.RegisteredClaims{
			ExpiresAt: jwtlib.NewNumericDate(time.Now().Add(time.Duration(expireSeconds) * time.Second)),
			IssuedAt:  jwtlib.NewNumericDate(time.Now()),
			Issuer:    "bolg-api",
		},
	}
	token := jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func GenerateRefreshToken(userID uint, secret string, expireSeconds int) (string, error) {
	claims := jwtlib.RegisteredClaims{
		Subject:   itoa(userID),
		ExpiresAt: jwtlib.NewNumericDate(time.Now().Add(time.Duration(expireSeconds) * time.Second)),
		IssuedAt:  jwtlib.NewNumericDate(time.Now()),
		Issuer:    "bolg-api",
	}
	token := jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ParseAccessToken(tokenStr, secret string) (*Claims, error) {
	token, err := jwtlib.ParseWithClaims(tokenStr, &Claims{}, func(token *jwtlib.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}

func ParseRefreshToken(tokenStr, secret string) (*jwtlib.RegisteredClaims, error) {
	token, err := jwtlib.ParseWithClaims(tokenStr, &jwtlib.RegisteredClaims{}, func(token *jwtlib.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*jwtlib.RegisteredClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid refresh token")
}

// PreviewClaims are claims for preview token links
type PreviewClaims struct {
	EntityType string `json:"entity_type"`
	EntityID   uint   `json:"entity_id"`
	jwtlib.RegisteredClaims
}

func GeneratePreviewToken(entityType string, entityID uint, secret string, expireSeconds int) (string, error) {
	claims := PreviewClaims{
		EntityType: entityType,
		EntityID:   entityID,
		RegisteredClaims: jwtlib.RegisteredClaims{
			ExpiresAt: jwtlib.NewNumericDate(time.Now().Add(time.Duration(expireSeconds) * time.Second)),
			IssuedAt:  jwtlib.NewNumericDate(time.Now()),
			Issuer:    "bolg-api",
		},
	}
	token := jwtlib.NewWithClaims(jwtlib.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ParsePreviewToken(tokenStr, secret string) (*PreviewClaims, error) {
	token, err := jwtlib.ParseWithClaims(tokenStr, &PreviewClaims{}, func(token *jwtlib.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*PreviewClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid preview token")
}

func itoa(i uint) string {
	if i == 0 {
		return "0"
	}
	result := ""
	for i > 0 {
		result = string(rune('0'+i%10)) + result
		i /= 10
	}
	return result
}
