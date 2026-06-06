import { api } from "./client";
import type { APIResponse, PaginatedResponse } from "./types";

export interface SearchResult {
  type: "work" | "post";
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  status: string;
  cover_image_url: string;
  published_at?: string;
}

export const searchAPI = {
  search: (q: string, type?: string, page?: number, perPage?: number) =>
    api.get<APIResponse<PaginatedResponse<SearchResult>>>("/search", {
      q,
      type: type || "all",
      page: page || 1,
      per_page: perPage || 20,
    }),
};
