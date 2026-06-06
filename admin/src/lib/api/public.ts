const PUBLIC_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1$/, "") || "http://localhost:8080";

async function publicFetch<T>(path: string): Promise<T> {
  const lang = typeof window !== "undefined"
    ? localStorage.getItem("bolg-site-lang") || "en"
    : "en";
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${PUBLIC_BASE}/api/v1/public${path}${separator}lang=${lang}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export interface PublicWork {
  id: number;
  slug: string;
  cover_image_url: string;
  gradient: string;
  date: string;
  featured: boolean;
  title: string;
  excerpt: string;
  video_url?: string;
  content?: string;
  category?: { id: number; slug: string; name: string };
  tags?: Array<{ id: number; slug: string; name: string }>;
  seo_title?: string;
  seo_description?: string;
}

export interface PublicPost {
  id: number;
  slug: string;
  cover_image_url: string;
  reading_time: number;
  featured: boolean;
  title: string;
  excerpt: string;
  content?: string;
  category?: { id: number; slug: string; name: string };
  tags?: Array<{ id: number; slug: string; name: string }>;
}

export interface PublicCategory {
  id: number;
  slug: string;
  icon_name: string;
  color: string;
  name: string;
  description: string;
}

export interface PublicTimeline {
  id: number;
  date: string;
  year: string;
  icon_name: string;
  title: string;
  description: string;
}

export interface HomeData {
  categories: PublicCategory[];
  works: PublicWork[];
  timeline: PublicTimeline[];
  about: Array<{ id: number; section_key: string; title: string; content: Record<string, unknown> }>;
}

export const publicAPI = {
  home() {
    return publicFetch<{ code: number; data: HomeData }>("/home");
  },

  categories() {
    return publicFetch<{ code: number; data: PublicCategory[] }>("/categories");
  },

  works(params?: { category?: string; page?: number; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    const query = qs.toString() ? `?${qs}` : "";
    return publicFetch<{ code: number; data: { items: PublicWork[]; total: number; page: number; limit: number } }>(`/works${query}`);
  },

  work(slug: string) {
    return publicFetch<{ code: number; data: PublicWork }>(`/works/${slug}`);
  },

  posts(page = 1, perPage = 20) {
    return publicFetch<{ code: number; data: { items: PublicPost[]; meta: { total_items: number } } }>(`/posts?page=${page}&per_page=${perPage}`);
  },

  post(slug: string) {
    return publicFetch<{ code: number; data: PublicPost }>(`/posts/${slug}`);
  },

  timeline() {
    return publicFetch<{ code: number; data: PublicTimeline[] }>("/timeline");
  },
};
