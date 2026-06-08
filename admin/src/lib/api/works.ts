import { api } from "./client";
import type { APIResponse, PaginatedResponse } from "./types";

export interface WorkTranslation {
  title: string;
  excerpt: string;
  content: string;
}

export interface Work {
  id: number;
  slug: string;
  category: { id: number; slug: string; name: string } | null;
  cover_image_url: string;
  gradient: string;
  date: string;
  featured: boolean;
  sort_order: number;
  status: string;
  published_at: string | null;
  tags: { id: number; slug: string; name: string }[];
  translations: Record<string, WorkTranslation>;
  seo: { title: string; description: string; keywords: string; og_image: string };
  video_url: string;
  link: string;
  created_at: string;
  updated_at: string;
}

export interface WorkCreateInput {
  slug: string;
  category_id?: number | null;
  cover_image_url?: string;
  gradient?: string;
  date: string;
  featured?: boolean;
  sort_order?: number;
  status?: string;
  tag_ids?: number[];
  translations: Record<string, WorkTranslation>;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image?: string;
  video_url?: string;
  link?: string;
}

export interface WorkUpdateInput extends Partial<WorkCreateInput> {}

export const worksAPI = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<APIResponse<PaginatedResponse<Work>>>("/works", params),

  get: (id: number | string) =>
    api.get<APIResponse<Work>>(`/works/${id}`),

  create: (data: WorkCreateInput) =>
    api.post<APIResponse<Work>>("/works", data),

  update: (id: number | string, data: WorkUpdateInput) =>
    api.put<APIResponse<Work>>(`/works/${id}`, data),

  delete: (id: number | string) =>
    api.delete<APIResponse<null>>(`/works/${id}`),

  publish: (id: number | string) =>
    api.put<APIResponse<null>>(`/works/${id}/publish`),

  unpublish: (id: number | string) =>
    api.put<APIResponse<null>>(`/works/${id}/unpublish`),

  batchDelete: (ids: (number | string)[]) =>
    api.post<APIResponse<null>>("/works/batch-delete", { ids }),

  batchPublish: (ids: (number | string)[]) =>
    api.put<APIResponse<null>>("/works/batch-publish", { ids }),

  batchUnpublish: (ids: (number | string)[]) =>
    api.put<APIResponse<null>>("/works/batch-unpublish", { ids }),

  schedulePublish: (id: number | string, publishAt: string) =>
    api.put<APIResponse<null>>(`/works/${id}/schedule`, { publish_at: publishAt }),
};
