import { api } from "./client";
import type { APIResponse } from "./types";

export interface CategoryTranslation {
  lang: string;
  name: string;
  description: string;
}

export interface Category {
  id: number;
  slug: string;
  icon_name: string;
  color: string;
  cover_image_url: string;
  parent_id: number | null;
  sort_order: number;
  status: string;
  translations: CategoryTranslation[];
  created_at: string;
  updated_at: string;
}

export const categoriesAPI = {
  list: (params?: Record<string, string>) =>
    api.get<APIResponse<Category[]>>("/categories", params),

  get: (id: number | string) =>
    api.get<APIResponse<Category>>(`/categories/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post<APIResponse<Category>>("/categories", data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put<APIResponse<Category>>(`/categories/${id}`, data),

  delete: (id: number | string) =>
    api.delete<APIResponse<null>>(`/categories/${id}`),
};
