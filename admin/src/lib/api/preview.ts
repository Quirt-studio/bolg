import { api } from "./client";

export interface PreviewData {
  id: number;
  slug: string;
  cover_image_url: string;
  gradient?: string;
  date?: string;
  reading_time?: number;
  featured: boolean;
  status: string;
  title: string;
  excerpt: string;
  content: string;
  tags: Array<{ id: number; slug: string; name: string }>;
  category?: { id: number; slug: string; name: string };
  seo_title: string;
  seo_description: string;
}

export interface PreviewTokenResponse {
  code: number;
  data: {
    token: string;
    url: string;
  };
}

export const previewAPI = {
  generateToken(entityType: string, entityId: number | string) {
    return api.post<PreviewTokenResponse>("/preview/token", {
      entity_type: entityType,
      entity_id: Number(entityId),
    });
  },

  getWork(id: number | string, lang = "en", token?: string) {
    const params: Record<string, string> = { lang };
    if (token) params.token = token;
    return api.get<{ code: number; data: PreviewData }>(`/preview/work/${id}`, params);
  },

  getPost(id: number | string, lang = "en", token?: string) {
    const params: Record<string, string> = { lang };
    if (token) params.token = token;
    return api.get<{ code: number; data: PreviewData }>(`/preview/post/${id}`, params);
  },
};
