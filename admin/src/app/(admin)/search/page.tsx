"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Search, FileText, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { searchAPI, type SearchResult } from "@/lib/api/search";
import { useI18n } from "@/lib/i18n";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filter, setFilter] = useState<"all" | "works" | "posts">("all");
  const { t } = useI18n();

  const doSearch = useCallback(async (q: string, type: string) => {
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchAPI.search(q, type, 1, 50);
      if (res.code === 0 && res.data) {
        setResults(res.data.items);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query, filter);
  };

  const handleFilterChange = (newFilter: "all" | "works" | "posts") => {
    setFilter(newFilter);
    if (query.trim()) {
      doSearch(query, newFilter);
    }
  };

  const typeIcon = (type: string) => {
    if (type === "work") return <FileText className="h-4 w-4 text-brand" />;
    return <BookOpen className="h-4 w-4 text-brand-warm" />;
  };

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      draft: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    };
    return colors[status] || "";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("search.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("search.desc")}</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search.placeholder")}
            className="pl-9"
            autoFocus
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? t("common.searching") : t("search.title")}
        </Button>
      </form>

      <div className="flex gap-2">
        {(["all", "works", "posts"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilterChange(f)}
          >
            {f === "all" ? t("common.all") : f === "works" ? t("search.works") : t("search.posts")}
          </Button>
        ))}
      </div>

      {searched && !loading && results.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          {t("search.noResults")} {query}
        </div>
      )}

      <div className="space-y-3">
        {results.map((result) => (
          <Card key={`${result.type}-${result.id}`}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">{typeIcon(result.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/${result.type === "work" ? "works" : "posts"}/${result.id}`}
                      className="font-medium hover:underline truncate"
                    >
                      {result.title || t("common.untitled")}
                    </Link>
                    <Badge variant="secondary" className={`text-[10px] ${statusColor(result.status)}`}>
                      {result.status}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {result.type}
                    </Badge>
                  </div>
                  {result.excerpt && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{result.excerpt}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
