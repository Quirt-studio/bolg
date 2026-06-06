import { api } from "./client";
import type { APIResponse } from "./types";

export interface AboutTranslation {
  lang: string;
  title: string;
  content: unknown;
}

export interface AboutSection {
  id: number;
  section_key: string;
  sort_order: number;
  translations: AboutTranslation[];
  created_at: string;
  updated_at: string;
}

export const aboutAPI = {
  getSections: () =>
    api.get<APIResponse<{ sections: AboutSection[] }>>("/about"),

  updateSection: (id: number | string, data: Record<string, unknown>) =>
    api.put<APIResponse<AboutSection>>(`/about/${id}`, data),
};
