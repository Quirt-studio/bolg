package dto

// APIResponse is the unified response format
type APIResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
	TraceID string      `json:"trace_id,omitempty"`
}

// PaginatedData wraps items with pagination meta
type PaginatedData struct {
	Items interface{} `json:"items"`
	Meta  PaginationMeta `json:"meta"`
}

// PaginationMeta contains pagination info
type PaginationMeta struct {
	CurrentPage int `json:"current_page"`
	PerPage     int `json:"per_page"`
	TotalItems  int64 `json:"total_items"`
	TotalPages  int `json:"total_pages"`
}

// ValidationErrorDetail contains field-level validation errors
type ValidationErrorDetail struct {
	Errors map[string][]string `json:"errors"`
}

// Success creates a success response
func Success(data interface{}) APIResponse {
	return APIResponse{Code: 0, Message: "success", Data: data}
}

// Paginated creates a paginated response
func Paginated(items interface{}, total int64, page, perPage int) APIResponse {
	totalPages := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPages++
	}
	return APIResponse{
		Code:    0,
		Message: "success",
		Data: PaginatedData{
			Items: items,
			Meta: PaginationMeta{
				CurrentPage: page,
				PerPage:     perPage,
				TotalItems:  total,
				TotalPages:  totalPages,
			},
		},
	}
}

// Error creates an error response
func Error(code int, message string) APIResponse {
	return APIResponse{Code: code, Message: message}
}

// ValidationError creates a validation error response
func ValidationError(errors map[string][]string) APIResponse {
	return APIResponse{
		Code:    2002,
		Message: "Validation failed",
		Data:    ValidationErrorDetail{Errors: errors},
	}
}
