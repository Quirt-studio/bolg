export interface APIResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  trace_id?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
}
