import { api } from "./client";
import type { APIResponse } from "./types";

export interface TimelineTranslation {
  lang: string;
  title: string;
  description: string;
}

export interface TimelineMilestone {
  id: number;
  date: string;
  icon_name: string;
  sort_order: number;
  status: string;
  translations: TimelineTranslation[];
  created_at: string;
  updated_at: string;
}

export const timelineAPI = {
  list: (params?: Record<string, string>) =>
    api.get<APIResponse<TimelineMilestone[]>>("/timeline", params),

  get: (id: number | string) =>
    api.get<APIResponse<TimelineMilestone>>(`/timeline/${id}`),

  create: (data: Record<string, unknown>) =>
    api.post<APIResponse<TimelineMilestone>>("/timeline", data),

  update: (id: number | string, data: Record<string, unknown>) =>
    api.put<APIResponse<TimelineMilestone>>(`/timeline/${id}`, data),

  delete: (id: number | string) =>
    api.delete<APIResponse<null>>(`/timeline/${id}`),
};
