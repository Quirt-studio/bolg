"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { publicAPI } from "@/lib/api/public";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, FolderOpen } from "lucide-react";

interface SearchResult {
  type: string;
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLang(localStorage.getItem("bolg-site-lang") || "en");
  }, []);

  useEffect(() => {
    if (!initialQ) return;
    doSearch(initialQ);
  }, [initialQ]);

  const doSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1$/, "") || "http://localhost:8080";
      const siteLang = localStorage.getItem("bolg-site-lang") || "en";
      const res = await fetch(`${base}/api/v1/public/search?q=${encodeURIComponent(q)}&lang=${siteLang}&per_page=50`);
      const data = await res.json();
      if (data.code === 0 && data.data) {
        setResults(data.data.items || []);
        setTotal(data.data.total || 0);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">
          {lang === "zh" ? "搜索" : "Search"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === "zh" ? "搜索作品和文章..." : "Search works and posts..."}
          className="w-full h-12 pl-12 pr-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          autoFocus
        />
      </form>

      {loading ? (
        <p className="text-muted-foreground">{lang === "zh" ? "搜索中..." : "Searching..."}</p>
      ) : initialQ && results.length === 0 ? (
        <div className="text-center py-12">
          <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            {lang === "zh" ? `未找到 "${initialQ}" 的结果` : `No results for "${initialQ}"`}
          </p>
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? (lang === "zh" ? "个结果" : "result") : (lang === "zh" ? "个结果" : "results")}
          </p>
          <div className="space-y-4">
            {results.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={`/site/${item.type === "work" ? "works" : "posts"}/${item.slug}`}
                className="block p-4 rounded-xl border hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-2 mb-2">
                  {item.type === "work" ? (
                    <FolderOpen className="h-4 w-4 text-brand" />
                  ) : (
                    <FileText className="h-4 w-4 text-brand-warm" />
                  )}
                  <Badge variant="outline" className="text-xs">
                    {item.type === "work" ? (lang === "zh" ? "作品" : "Work") : (lang === "zh" ? "文章" : "Post")}
                  </Badge>
                  {item.date && <span className="text-xs text-muted-foreground ml-auto">{item.date}</span>}
                </div>
                <h3 className="font-medium group-hover:text-brand transition-colors">{item.title}</h3>
                {item.excerpt && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.excerpt}</p>
                )}
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function SiteSearchPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-12"><p className="text-muted-foreground">Loading...</p></div>}>
      <SearchContent />
    </Suspense>
  );
}
