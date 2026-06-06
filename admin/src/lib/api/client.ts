const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

interface RequestInitExt extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("bolg_access_token");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("bolg_refresh_token");
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      if (data.code === 0 && data.data) {
        localStorage.setItem("bolg_access_token", data.data.access_token);
        localStorage.setItem("bolg_refresh_token", data.data.refresh_token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async request<T = unknown>(path: string, options: RequestInitExt = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    let url = `${this.baseURL}${path}`;

    // Append query params
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") {
          searchParams.set(key, String(value));
        }
      }
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    // Build headers
    const headers: Record<string, string> = {
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    let res = await fetch(url, { ...fetchOptions, headers });

    // If 401, try to refresh token once
    if (res.status === 401 && token) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${this.getToken()}`;
        res = await fetch(url, { ...fetchOptions, headers });
      } else {
        // Refresh failed, clear tokens and redirect
        if (typeof window !== "undefined") {
          localStorage.removeItem("bolg_access_token");
          localStorage.removeItem("bolg_refresh_token");
          localStorage.removeItem("bolg_user");
          window.location.href = "/login";
        }
        throw new Error("Authentication failed");
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(error.message || `Request failed: ${res.status}`);
    }

    return res.json();
  }

  get<T = unknown>(path: string, params?: Record<string, string | number | boolean | undefined>) {
    return this.request<T>(path, { method: "GET", params });
  }

  post<T = unknown>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  put<T = unknown>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  delete<T = unknown>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }

  upload<T = unknown>(path: string, formData: FormData) {
    return this.request<T>(path, {
      method: "POST",
      body: formData,
    });
  }
}

export const api = new APIClient(API_BASE);

// Re-export all API modules
export * from "./auth";
export * from "./works";
export * from "./posts";
export * from "./categories";
export * from "./tags";
export * from "./timeline";
export * from "./about";
export * from "./settings";
export * from "./media";
export * from "./revisions";
export * from "./export";
export * from "./search";
export * from "./preview";
export * from "./logs";
