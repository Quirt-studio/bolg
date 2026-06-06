import { api } from "./client";

export interface ExportPreview {
  version: string;
  export_at: string;
  works: number;
  posts: number;
  categories: number;
  tags: number;
}

export interface ImportResult {
  message: string;
  counts: {
    categories: number;
    tags: number;
    works: number;
    posts: number;
  };
}

export const exportAPI = {
  preview() {
    return api.get<{ code: number; data: ExportPreview }>("/export/preview");
  },

  async download() {
    const token = localStorage.getItem("bolg_access_token");
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    const res = await fetch(`${base}/export`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bolg-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  import(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<{ code: number; data: ImportResult }>("/import", formData);
  },
};
