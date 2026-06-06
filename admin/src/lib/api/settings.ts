import { api } from "./client";
import type { APIResponse } from "./types";

export const settingsAPI = {
  getAll: () =>
    api.get<APIResponse<Record<string, unknown>>>("/settings"),

  getByKey: (key: string) =>
    api.get<APIResponse<Record<string, unknown>>>(`/settings/${key}`),

  update: (key: string, value: unknown) =>
    api.put<APIResponse<Record<string, unknown>>>(`/settings/${key}`, { value }),
};
