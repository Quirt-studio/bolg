"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { publicAPI, PublicPost } from "@/lib/api/public";
import { getFullImageUrl } from "@/lib/utils/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [lang, setLang] = useState("en");
  const [post, setPost] = useState<PublicPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLang(localStorage.getItem("bolg-site-lang") || "en");
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await publicAPI.post(slug);
        if (res.code === 0) setPost(res.data);
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

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground text-lg">{lang === "zh" ? "文章未找到" : "Post not found"}</p>
        <Link href="/site/posts" className="text-sm text-brand mt-4 inline-block">
          {lang === "zh" ? "返回文章列表" : "Back to posts"}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/site/posts" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-4 w-4" />
        {lang === "zh" ? "返回文章列表" : "Back to posts"}
      </Link>

      {post.cover_image_url && (
        <img src={getFullImageUrl(post.cover_image_url)} alt={post.title} className="w-full h-auto rounded-xl mb-8" />
      )}

      <div className="flex items-center gap-2 mb-4">
        {post.category && <Badge variant="outline">{post.category.name}</Badge>}
        {post.tags?.map((tag) => <Badge key={tag.id} variant="secondary">{tag.name}</Badge>)}
        {post.reading_time > 0 && (
          <span className="text-sm text-muted-foreground ml-auto">{post.reading_time} min read</span>
        )}
      </div>

      <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">{post.title}</h1>
      {post.excerpt && <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{post.excerpt}</p>}

      {post.content && (
        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
      )}
    </div>
  );
}
