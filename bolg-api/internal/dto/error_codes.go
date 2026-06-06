package dto

// Error codes
const (
	ErrCodeOK = 0

	// Auth errors 10xx
	ErrCodeUnauthorized    = 1001
	ErrCodeTokenExpired    = 1002
	ErrCodeTokenInvalid    = 1003
	ErrCodeForbidden       = 1004
	ErrCodeLoginFailed     = 1005
	ErrCodeAccountDisabled = 1006

	// Request errors 20xx
	ErrCodeBadRequest       = 2001
	ErrCodeValidation       = 2002
	ErrCodeNotFound         = 2003
	ErrCodeConflict         = 2004
	ErrCodeMethodNotAllowed = 2005

	// Business errors 30xx
	ErrCodeSlugExists       = 3001
	ErrCodeDraftOnly        = 3002
	ErrCodeAlreadyPublished = 3003
	ErrCodeRevertFailed     = 3004

	// Server errors 50xx
	ErrCodeInternal         = 5001
	ErrCodeDBError          = 5002
	ErrCodeFileUploadFailed = 5003
)
