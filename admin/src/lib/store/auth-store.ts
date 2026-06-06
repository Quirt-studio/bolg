"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserInfo {
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

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: UserInfo, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("bolg_access_token", accessToken);
          localStorage.setItem("bolg_refresh_token", refreshToken);
          localStorage.setItem("bolg_user", JSON.stringify(user));
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
      },

      clearAuth: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("bolg_access_token");
          localStorage.removeItem("bolg_refresh_token");
          localStorage.removeItem("bolg_user");
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "bolg-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
