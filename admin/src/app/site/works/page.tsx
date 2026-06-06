"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { publicAPI, PublicWork, PublicCategory } from "@/lib/api/public";
import { getFullImageUrl } from "@/lib/utils/image";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

function WorksContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";
  const [lang, setLang] = useState("en");
  const [works, setWorks] = useState<PublicWork[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLang(localStorage.getItem("bolg-site-lang") || "en");
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [worksRes, catsRes] = await Promise.all([
          publicAPI.works({ category: categoryFilter || undefined, limit: 50 }),
          publicAPI.categories(),
        ]);
        if (worksRes.code === 0) {
          setWorks(worksRes.data.items || []);
          setTotal(worksRes.data.total || 0);
        }
        if (catsRes.code === 0) setCategories(catsRes.data || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [categoryFilter]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">
          {lang === "zh" ? "作品" : "Works"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {total} {lang === "zh" ? "个作品" : "works"}
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/site/works"
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            !categoryFilter ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
          }`}
        >
          {lang === "zh" ? "全部" : "All"}
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/site/works?category=${cat.slug}`}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              categoryFilter === cat.slug ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Works grid */}
      {loading ? (
        <p className="text-muted-foreground">{lang === "zh" ? "加载中..." : "Loading..."}</p>
      ) : works.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          {lang === "zh" ? "暂无作品" : "No works found"}
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {works.map((work) => (
            <Link
              key={work.id}
              href={`/site/works/${work.slug}`}
              className="group rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
            >
              {work.video_url ? (
                <div className="h-40 bg-muted flex items-center justify-center">
                  <svg className="w-10 h-10 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
              ) : work.cover_image_url ? (
                <img src={getFullImageUrl(work.cover_image_url)} alt={work.title} className="h-40 w-full object-cover" />
              ) : work.gradient ? (
                <div className="h-40" style={{ background: work.gradient }} />
              ) : (
                <div className="h-40 bg-muted" />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {work.category && <Badge variant="outline" className="text-xs">{work.category.name}</Badge>}
                  {work.featured && <Badge className="text-xs">★</Badge>}
                  <span className="text-xs text-muted-foreground ml-auto">{work.date}</span>
                </div>
                <h3 className="font-medium group-hover:text-brand transition-colors line-clamp-2">{work.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{work.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorksPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto px-4 py-12"><p className="text-muted-foreground">Loading...</p></div>}>
      <WorksContent />
    </Suspense>
  );
}
