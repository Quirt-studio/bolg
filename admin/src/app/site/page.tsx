"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { publicAPI, PublicWork, PublicCategory, PublicTimeline } from "@/lib/api/public";
import { getFullImageUrl } from "@/lib/utils/image";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export default function SiteHomePage() {
  const [lang, setLang] = useState("en");
  const [works, setWorks] = useState<PublicWork[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [timeline, setTimeline] = useState<PublicTimeline[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("bolg-site-lang") || "en";
    setLang(saved);

    async function load() {
      try {
        const res = await publicAPI.home();
        if (res.code === 0 && res.data) {
          setWorks(res.data.works || []);
          setCategories(res.data.categories || []);
          setTimeline(res.data.timeline || []);
        }
      } catch { /* ignore */ }
    }
    load();
  }, []);

  return (
    <div className="space-y-16 py-12">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">
          {lang === "zh" ? "作品集 & 博客" : "Portfolio & Blog"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {lang === "zh"
            ? "探索我的作品、文章和旅程。"
            : "Explore my works, articles, and journey."}
        </p>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/site/works?category=${cat.slug}`}
                className="p-6 rounded-xl border hover:shadow-md transition-shadow text-center group"
              >
                <div
                  className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center text-white text-xl"
                  style={{ backgroundColor: cat.color || "#2C3E6B" }}
                >
                  {cat.icon_name?.[0]?.toUpperCase() || "C"}
                </div>
                <h3 className="font-medium">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cat.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Works */}
      {works.length > 0 && (
        <section className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold">
              {lang === "zh" ? "精选作品" : "Featured Works"}
            </h2>
            <Link href="/site/works" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              {lang === "zh" ? "查看全部" : "View all"} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.slice(0, 6).map((work) => (
              <Link
                key={work.id}
                href={`/site/works/${work.slug}`}
                className="group rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
              >
                {work.cover_image_url ? (
                  <img src={getFullImageUrl(work.cover_image_url)} alt={work.title} className="h-40 w-full object-cover" />
                ) : work.gradient ? (
                  <div className="h-40" style={{ background: work.gradient }} />
                ) : (
                  <div className="h-40 bg-muted" />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {work.category && <Badge variant="outline" className="text-xs">{work.category.name}</Badge>}
                    <span className="text-xs text-muted-foreground">{work.date}</span>
                  </div>
                  <h3 className="font-medium group-hover:text-brand transition-colors line-clamp-2">{work.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{work.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <section className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-serif font-bold mb-8 text-center">
            {lang === "zh" ? "旅程" : "Journey"}
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-8">
              {timeline.slice(0, 5).map((m) => (
                <div key={m.id} className="relative pl-10">
                  <div className="absolute left-2 w-5 h-5 rounded-full bg-background border-2 border-brand" />
                  <div>
                    <span className="text-sm font-mono text-muted-foreground">{m.year}</span>
                    <h3 className="font-medium mt-1">{m.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
