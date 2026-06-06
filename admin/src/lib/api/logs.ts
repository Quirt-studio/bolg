import { api } from "./client";

export interface ActivityLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number;
  entity_name: string;
  description: string;
  ip_address: string;
  created_at: string;
  user?: { id: number; username: string; display_name: string };
}

export const logsAPI = {
  list(params?: { action?: string; entity_type?: string; user_id?: number; page?: number; per_page?: number }) {
    return api.get<{
      code: number;
      data: { items: ActivityLog[]; meta: { current_page: number; per_page: number; total_items: number; total_pages: number } };
    }>("/logs", params as Record<string, string | number | boolean | undefined>);
  },
};
