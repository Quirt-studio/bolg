import { api } from "./client";
import type { APIResponse } from "./types";

export interface TagTranslation {
  name: string;
}

export interface Tag {
  id: number;
  slug: string;
  translations: TagTranslation[];
  created_at: string;
}

export const tagsAPI = {
  list: (params?: Record<string, string>) =>
    api.get<APIResponse<Tag[]>>("/tags", params),

  get: (id: number | string) =>
    api.get<APIResponse<Tag>>(`/tags/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post<APIResponse<Tag>>("/tags", data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put<APIResponse<Tag>>(`/tags/${id}`, data),

  delete: (id: number | string) =>
    api.delete<APIResponse<null>>(`/tags/${id}`),
};
