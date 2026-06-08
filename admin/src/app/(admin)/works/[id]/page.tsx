"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WorkForm } from "@/components/forms/work-form";
import { worksAPI, type Work } from "@/lib/api/works";
import type { WorkFormData } from "@/lib/validations";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { previewAPI } from "@/lib/api/preview";

export default function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useI18n();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchWork() {
      try {
        const res = await worksAPI.get(id);
        if (res.code === 0 && res.data) {
          setWork(res.data);
        }
      } catch {
        toast.error(t("error.loadFailed"));
      } finally {
        setLoading(false);
      }
    }
    fetchWork();
  }, [id]);

  const handleSubmit = async (data: WorkFormData) => {
    setSaving(true);
    try {
      // Determine category_id from tagCategory
      let category_id: number | null = null;
      const catId = parseInt(data.tagCategory || "");
      if (!isNaN(catId)) {
        category_id = catId;
      }

      await worksAPI.update(id, {
        date: data.date,
        gradient: data.gradient || "",
        featured: data.featured || false,
        sort_order: data.order || 0,
        category_id: category_id,
        cover_image_url: data.coverImageUrl || "",
        seo_title: data.seoTitle || "",
        seo_description: data.seoDescription || "",
        seo_keywords: data.seoKeywords,
        og_image: data.ogImage || "",
        video_url: data.videoUrl || "",
        link: data.link || "",
        translations: {
          en: {
            title: data.title?.en || "",
            excerpt: data.excerpt?.en || "",
            content: data.content?.en || "",
          },
          zh: {
            title: data.title?.zh || "",
            excerpt: data.excerpt?.zh || "",
            content: data.content?.zh || "",
          },
        },
      });
      toast.success(t("works.updated"));
      router.push("/works");
    } catch {
      toast.error(t("error.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-muted-foreground">{t("common.loading")}</div>;

  if (!work) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t("works.notFound")}</p></div>;
  }

  // Convert API work to form data
  const formData: WorkFormData = {
    title: {
      en: work.translations?.en?.title || "",
      zh: work.translations?.zh?.title || "",
    },
    tag: { en: work.category?.name || "", zh: "" },
    tagCategory: (work.category?.id ? String(work.category.id) : "article") as WorkFormData["tagCategory"],
    date: work.date?.split("T")[0] || "",
    excerpt: {
      en: work.translations?.en?.excerpt || "",
      zh: work.translations?.zh?.excerpt || "",
    },
    content: {
      en: work.translations?.en?.content || "",
      zh: work.translations?.zh?.content || "",
    },
    coverImageUrl: work.cover_image_url || "",
    gradient: work.gradient || "",
    iconName: "FileText",
    featured: work.featured || false,
    order: work.sort_order || 0,
    seoTitle: work.seo?.title || "",
    seoDescription: work.seo?.description || "",
    seoKeywords: work.seo?.keywords || "",
    ogImage: work.seo?.og_image || "",
    videoUrl: work.video_url || "",
    link: work.link || "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("works.editTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("works.editDesc")}</p>
        </div>
        <Button
          variant="outline"
          onClick={async () => {
            try {
              const res = await previewAPI.generateToken("work", id);
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
          {t("works.form.preview")}
        </Button>
      </div>
      <WorkForm initialData={formData} onSubmit={handleSubmit} t={t} disabled={saving} />
    </div>
  );
}
