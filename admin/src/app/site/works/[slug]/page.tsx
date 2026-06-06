"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { publicAPI, PublicWork } from "@/lib/api/public";
import { getFullImageUrl } from "@/lib/utils/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [lang, setLang] = useState("en");
  const [work, setWork] = useState<PublicWork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLang(localStorage.getItem("bolg-site-lang") || "en");
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await publicAPI.work(slug);
        if (res.code === 0) setWork(res.data);
        else setError("Not found");
      } catch {
        setError("Not found");
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-12"><p className="text-muted-foreground">Loading...</p></div>;
  }

  if (error || !work) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground text-lg">{lang === "zh" ? "作品未找到" : "Work not found"}</p>
        <Link href="/site/works" className="text-sm text-brand mt-4 inline-block">
          {lang === "zh" ? "返回作品列表" : "Back to works"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/site/works" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        {lang === "zh" ? "返回作品列表" : "Back to works"}
      </Link>

      {work.video_url ? (
        <div className="w-full aspect-video rounded-xl mb-8 overflow-hidden bg-black">
          {work.video_url.includes("bilibili.com") ? (
            <iframe
              src={`//player.bilibili.com/player.html?bvid=${work.video_url.match(/BV[\w]+/)?.[0] || ""}&high_quality=1`}
              className="w-full h-full" allowFullScreen
            />
          ) : work.video_url.includes("youtube.com") || work.video_url.includes("youtu.be") ? (
            <iframe
              src={`https://www.youtube.com/embed/${work.video_url.includes("youtu.be") ? work.video_url.split("/").pop()?.split("?")[0] : work.video_url.match(/[?&]v=([^&]+)/)?.[1] || ""}`}
              className="w-full h-full" allowFullScreen
            />
          ) : (
            <video src={work.video_url} controls className="w-full h-full object-contain" />
          )}
        </div>
      ) : work.cover_image_url ? (
        <img src={getFullImageUrl(work.cover_image_url)} alt={work.title} className="w-full h-auto rounded-xl mb-8" />
      ) : work.gradient ? (
        <div className="w-full h-48 md:h-64 rounded-xl mb-8" style={{ background: work.gradient }} />
      ) : null}

      <div className="flex items-center gap-2 mb-4">
        {work.category && <Badge variant="outline">{work.category.name}</Badge>}
        {work.tags?.map((tag) => <Badge key={tag.id} variant="secondary">{tag.name}</Badge>)}
        <span className="text-sm text-muted-foreground ml-auto">{work.date}</span>
      </div>

      <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">{work.title}</h1>
      {work.excerpt && <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{work.excerpt}</p>}

      {work.content && (
        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: work.content }} />
      )}
    </div>
  );
}
