"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { publicAPI, PublicPost } from "@/lib/api/public";
import { Badge } from "@/components/ui/badge";

export default function PostsPage() {
  const [lang, setLang] = useState("en");
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLang(localStorage.getItem("bolg-site-lang") || "en");
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await publicAPI.posts();
        if (res.code === 0) setPosts(res.data.items || []);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold">
          {lang === "zh" ? "文章" : "Posts"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {lang === "zh" ? "想法、教程和笔记" : "Thoughts, tutorials, and notes"}
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground">{lang === "zh" ? "加载中..." : "Loading..."}</p>
      ) : posts.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          {lang === "zh" ? "暂无文章" : "No posts yet"}
        </p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/site/posts/${post.slug}`}
              className="block group p-6 rounded-xl border hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                {post.category && <Badge variant="outline" className="text-xs">{post.category.name}</Badge>}
                {post.reading_time > 0 && (
                  <span className="text-xs text-muted-foreground">{post.reading_time} min read</span>
                )}
              </div>
              <h2 className="text-xl font-medium group-hover:text-brand transition-colors">{post.title}</h2>
              {post.excerpt && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{post.excerpt}</p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-1.5 mt-3">
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">{tag.name}</Badge>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
