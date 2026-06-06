"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PostForm, type PostFormData } from "@/components/forms/post-form";
import { postsAPI, type Post } from "@/lib/api/posts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { previewAPI } from "@/lib/api/preview";
import { useI18n } from "@/lib/i18n";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await postsAPI.get(id);
        if (res.code === 0 && res.data) {
          setPost(res.data);
        }
      } catch {
        toast.error(t("error.loadFailed"));
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  const handleSubmit = async (data: PostFormData) => {
    setSaving(true);
    try {
      await postsAPI.update(id, {
        reading_time: data.readingTime || 0,
        featured: data.featured || false,
        sort_order: data.order || 0,
        seo_title: data.seoTitle || "",
        seo_description: data.seoDescription || "",
        seo_keywords: data.seoKeywords,
        og_image: data.ogImage || "",
        translations: {
          en: { title: data.title.en || "", excerpt: data.excerpt.en || "", content: data.content?.en || "" },
          zh: { title: data.title.zh || "", excerpt: data.excerpt.zh || "", content: data.content?.zh || "" },
        },
      });
      toast.success(t("success.published"));
      router.push("/posts");
    } catch {
      toast.error(t("error.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-muted-foreground">{t("common.loading")}</div>;

  if (!post) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t("posts.postNotFound")}</p></div>;
  }

  const formData: PostFormData = {
    title: { en: post.translations?.en?.title || "", zh: post.translations?.zh?.title || "" },
    excerpt: { en: post.translations?.en?.excerpt || "", zh: post.translations?.zh?.excerpt || "" },
    content: { en: post.translations?.en?.content || "", zh: post.translations?.zh?.content || "" },
    gradient: post.cover_image_url || "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
    readingTime: post.reading_time || 5,
    featured: post.featured || false,
    order: post.sort_order || 0,
    seoTitle: post.seo?.title || "",
    seoDescription: post.seo?.description || "",
    seoKeywords: post.seo?.keywords || "",
    ogImage: post.seo?.og_image || "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("posts.editTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("posts.editDesc")}</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              const res = await previewAPI.generateToken("post", id);
              const url = res.data?.url;
              if (url) {
                const base = window.location.origin;
                window.open(base + url, "_blank");
              }
            } catch {
              toast.error(t("error.previewLinkFailed"));
            }
          }}
        >
          <Eye className="h-4 w-4 mr-2" />
          {t("revisions.preview")}
        </Button>
      </div>
      <PostForm initialData={formData} onSubmit={handleSubmit} disabled={saving} />
    </div>
  );
}
