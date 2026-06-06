"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { previewAPI, PreviewData } from "@/lib/api/preview";
import { getFullImageUrl } from "@/lib/utils/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useI18n } from "@/lib/i18n";

function PreviewContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "work";
  const id = searchParams.get("id");
  const token = searchParams.get("token") || "";
  const lang = searchParams.get("lang") || "en";
  const { t } = useI18n();

  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError(t("error.missingId"));
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const res = type === "post"
          ? await previewAPI.getPost(id, lang, token)
          : await previewAPI.getWork(id, lang, token);
        setData(res.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("error.previewFailed"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [type, id, lang, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t("preview.loadingPreview")}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive text-lg font-medium">{error || t("error.notFound")}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.close()}>
            {t("common.close")}
          </Button>
        </div>
      </div>
    );
  }

  const statusColor = data.status === "published" ? "default" : data.status === "draft" ? "secondary" : "outline";

  return (
    <div className="min-h-screen bg-background">
      {/* Preview banner */}
      <div className="sticky top-0 z-50 bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
            {t("preview.mode")} — {data.status.toUpperCase()}
          </span>
          <Badge variant={statusColor as "default" | "secondary" | "outline"}>
            {data.status}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => window.close()}>
          {t("preview.close")}
        </Button>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        {data.gradient && (
          <div className="w-full h-48 rounded-xl mb-8" style={{ background: data.gradient }} />
        )}
        {data.cover_image_url && (
          <img src={getFullImageUrl(data.cover_image_url)} alt={data.title} className="w-full h-auto rounded-xl mb-8 object-cover" />
        )}

        <div className="flex items-center gap-2 mb-4">
          {data.category && <Badge variant="outline">{data.category.name}</Badge>}
          {data.tags?.map((tag) => (
            <Badge key={tag.id} variant="secondary">{tag.name}</Badge>
          ))}
          {data.date && <span className="text-sm text-muted-foreground ml-auto">{data.date}</span>}
          {data.reading_time ? <span className="text-sm text-muted-foreground">{data.reading_time} {t("common.minRead")}</span> : null}
        </div>

        <h1 className="text-4xl font-bold font-serif tracking-tight mb-4">{data.title}</h1>

        {data.excerpt && (
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{data.excerpt}</p>
        )}

        {(data.seo_title || data.seo_description) && (
          <div className="mb-8 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{t("preview.seoPreview")}</p>
            <p className="text-blue-600 dark:text-blue-400 text-lg font-medium">
              {data.seo_title || data.title}
            </p>
            <p className="text-green-700 dark:text-green-400 text-sm">
              example.com/{type}s/{data.slug}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {data.seo_description || data.excerpt}
            </p>
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: data.content }} />
      </article>
    </div>
  );
}

export default function PreviewPage() {
  const { t } = useI18n();
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{t("common.loading")}</p>
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
