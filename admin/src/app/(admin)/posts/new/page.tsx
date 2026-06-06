"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PostForm, type PostFormData } from "@/components/forms/post-form";
import { postsAPI } from "@/lib/api/posts";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export default function NewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (data: PostFormData) => {
    setSaving(true);
    try {
      await postsAPI.create({
        slug: data.title.en?.toLowerCase().replace(/\s+/g, "-") || "untitled",
        reading_time: data.readingTime || 0,
        featured: data.featured || false,
        sort_order: data.order || 0,
        status: "draft",
        seo_title: data.seoTitle || "",
        seo_description: data.seoDescription || "",
        seo_keywords: data.seoKeywords || "",
        translations: {
          en: { title: data.title.en || "", excerpt: data.excerpt.en || "", content: data.content?.en || "" },
          zh: { title: data.title.zh || "", excerpt: data.excerpt.zh || "", content: data.content?.zh || "" },
        },
      });
      toast.success(t("success.published"));
      router.push("/posts");
    } catch {
      toast.error(t("error.createFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("posts.newTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("posts.newDesc")}</p>
      </div>
      <PostForm onSubmit={handleSubmit} disabled={saving} />
    </div>
  );
}
