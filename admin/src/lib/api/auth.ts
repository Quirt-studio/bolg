import { api } from "./client";

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  display_name: string;
  avatar_url: string;
  role: {
    id: number;
    name: string;
    permissions: string[];
  };
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: UserInfo;
}

export interface APIResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export const authAPI = {
  login: (username: string, password: string) =>
    api.post<APIResponse<LoginResponse>>("/auth/login", { username, password }),

  refresh: (refreshToken: string) =>
    api.post<APIResponse<LoginResponse>>("/auth/refresh", { refresh_token: refreshToken }),

  me: () =>
    api.get<APIResponse<UserInfo>>("/auth/me"),

  logout: () =>
    api.post<APIResponse<null>>("/auth/logout"),

  changePassword: (oldPassword: string, newPassword: string) =>
    api.put<APIResponse<null>>("/auth/password", { old_password: oldPassword, new_password: newPassword }),
};
