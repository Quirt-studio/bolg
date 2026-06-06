"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WorkForm } from "@/components/forms/work-form";
import { worksAPI } from "@/lib/api/works";
import type { WorkFormData } from "@/lib/validations";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function NewWorkPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (data: WorkFormData) => {
    setSaving(true);
    try {
      // Determine category_id from tagCategory
      let category_id: number | null = null;
      const catId = parseInt(data.tagCategory);
      if (!isNaN(catId)) {
        category_id = catId;
      }

      await worksAPI.create({
        slug: data.title.en?.toLowerCase().replace(/\s+/g, "-") || "untitled",
        date: data.date || new Date().toISOString().split("T")[0],
        gradient: data.gradient || "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
        featured: data.featured || false,
        sort_order: data.order || 0,
        status: "draft",
        category_id: category_id,
        cover_image_url: data.coverImageUrl || "",
        seo_title: data.seoTitle || "",
        seo_description: data.seoDescription || "",
        seo_keywords: data.seoKeywords || "",
        og_image: data.ogImage || "",
        video_url: data.videoUrl || "",
        link: data.link || "",
        translations: {
          en: {
            title: data.title.en || "Untitled",
            excerpt: data.excerpt?.en || "",
            content: data.content?.en || "",
          },
          zh: {
            title: data.title.zh || "未命名",
            excerpt: data.excerpt?.zh || "",
            content: data.content?.zh || "",
          },
        },
      });
      toast.success(t("works.created"));
      router.push("/works");
    } catch (err) {
      toast.error(t("error.createFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("works.newTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("works.newDesc")}</p>
      </div>
      <WorkForm onSubmit={handleSubmit} t={t} disabled={saving} />
    </div>
  );
}
