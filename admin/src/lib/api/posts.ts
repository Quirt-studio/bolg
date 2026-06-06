import { api } from "./client";
import type { APIResponse, PaginatedResponse } from "./types";

export interface PostTranslation {
  title: string;
  excerpt: string;
  content: string;
}

export interface Post {
  id: number;
  slug: string;
  category: { id: number; slug: string; name: string } | null;
  cover_image_url: string;
  reading_time: number;
  date: string;
  featured: boolean;
  sort_order: number;
  status: string;
  published_at: string | null;
  tags: { id: number; slug: string; name: string }[];
  translations: Record<string, PostTranslation>;
  seo: { title: string; description: string; keywords: string; og_image: string };
  video_url: string;
  created_at: string;
  updated_at: string;
}

export interface PostCreateInput {
  slug: string;
  category_id?: number | null;
  cover_image_url?: string;
  reading_time?: number;
  featured?: boolean;
  sort_order?: number;
  status?: string;
  tag_ids?: number[];
  translations: Record<string, PostTranslation>;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  og_image?: string;
  video_url?: string;
}

export interface PostUpdateInput extends Partial<PostCreateInput> {}

export const postsAPI = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    api.get<APIResponse<PaginatedResponse<Post>>>("/posts", params),

  get: (id: number | string) =>
    api.get<APIResponse<Post>>(`/posts/${id}`),

  create: (data: PostCreateInput) =>
    api.post<APIResponse<Post>>("/posts", data),

  update: (id: number | string, data: PostUpdateInput) =>
    api.put<APIResponse<Post>>(`/posts/${id}`, data),

  delete: (id: number | string) =>
    api.delete<APIResponse<null>>(`/posts/${id}`),

  publish: (id: number | string) =>
    api.put<APIResponse<null>>(`/posts/${id}/publish`),

  unpublish: (id: number | string) =>
    api.put<APIResponse<null>>(`/posts/${id}/unpublish`),

  batchDelete: (ids: (number | string)[]) =>
    api.post<APIResponse<null>>("/posts/batch-delete", { ids }),

  batchPublish: (ids: (number | string)[]) =>
    api.put<APIResponse<null>>("/posts/batch-publish", { ids }),

  batchUnpublish: (ids: (number | string)[]) =>
    api.put<APIResponse<null>>("/posts/batch-unpublish", { ids }),

  schedulePublish: (id: number | string, publishAt: string) =>
    api.put<APIResponse<null>>(`/posts/${id}/schedule`, { publish_at: publishAt }),
};
