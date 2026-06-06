import { api } from "./client";
import type { APIResponse, PaginatedResponse } from "./types";

export interface MediaAsset {
  id: number;
  filename: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  width: number;
  height: number;
  url: string;
  thumbnail_url: string;
  alt_text: string;
  folder: string;
  uploaded_by: number;
  created_at: string;
}

export const mediaAPI = {
  list: (params?: Record<string, string | number>) =>
    api.get<APIResponse<PaginatedResponse<MediaAsset>>>("/media", params),

  get: (id: number | string) =>
    api.get<APIResponse<MediaAsset>>(`/media/${id}`),

  upload: (file: File, folder = "general", altText = "") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("alt_text", altText);
    return api.upload<APIResponse<MediaAsset>>("/media/upload", formData);
  },

  delete: (id: number | string) =>
    api.delete<APIResponse<null>>(`/media/${id}`),
};
