const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
// Extract base URL without /api/v1 for serving static files
const API_BASE = API_URL.replace(/\/api\/v1$/, "");

/**
 * Convert a relative image URL to a full URL
 * @param url - The image URL (can be relative like /uploads/... or absolute)
 * @returns The full image URL
 */
export function getFullImageUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url}`;
}
