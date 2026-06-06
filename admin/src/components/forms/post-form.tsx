"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedStringInput } from "./localized-string-input";
import { GradientPicker } from "./gradient-picker";
import { useI18n } from "@/lib/i18n";

export interface PostFormData {
  title: { en: string; zh: string };
  excerpt: { en: string; zh: string };
  content?: { en: string; zh: string };
  gradient: string;
  readingTime: number;
  featured: boolean;
  order: number;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
}

interface PostFormProps {
  initialData?: PostFormData;
  onSubmit: (data: PostFormData) => void;
  disabled?: boolean;
}

export function PostForm({ initialData, onSubmit, disabled }: PostFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const { t } = useI18n();

  const form = useForm<PostFormData>({
    defaultValues: initialData || {
      title: { en: "", zh: "" },
      excerpt: { en: "", zh: "" },
      content: { en: "", zh: "" },
      gradient: "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
      readingTime: 5,
      featured: false,
      order: 0,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      ogImage: "",
    },
  });

  const handleSubmit = form.handleSubmit((data) => { onSubmit(data); router.push("/posts"); });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("posts.form.content")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <LocalizedStringInput label={t("posts.form.title")} valueEn={form.watch("title.en")} valueZh={form.watch("title.zh")}
                onChangeEn={(v) => form.setValue("title.en", v)} onChangeZh={(v) => form.setValue("title.zh", v)} />
              <LocalizedStringInput label={t("posts.form.excerpt")} valueEn={form.watch("excerpt.en")} valueZh={form.watch("excerpt.zh")}
                onChangeEn={(v) => form.setValue("excerpt.en", v)} onChangeZh={(v) => form.setValue("excerpt.zh", v)} multiline />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{t("posts.form.body")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("posts.form.contentEn")}</Label>
                <textarea className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder={t("posts.form.writeEn")}
                  value={form.watch("content.en")}
                  onChange={(e) => form.setValue("content.en", e.target.value)}
                  disabled={disabled} />
              </div>
              <div className="space-y-2">
                <Label>{t("posts.form.contentZh")}</Label>
                <textarea className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="用中文写内容..."
                  value={form.watch("content.zh")}
                  onChange={(e) => form.setValue("content.zh", e.target.value)}
                  disabled={disabled} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{t("posts.form.appearance")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <GradientPicker value={form.watch("gradient")} onChange={(v) => form.setValue("gradient", v)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{t("posts.form.seo")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("posts.form.seoTitle")}</Label>
                <Input value={form.watch("seoTitle")} onChange={(e) => form.setValue("seoTitle", e.target.value)} placeholder={t("posts.form.seoTitleHint")} disabled={disabled} />
              </div>
              <div className="space-y-2">
                <Label>{t("posts.form.seoDesc")}</Label>
                <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder={t("posts.form.seoDescHint")}
                  value={form.watch("seoDescription")}
                  onChange={(e) => form.setValue("seoDescription", e.target.value)}
                  disabled={disabled} />
              </div>
              <div className="space-y-2">
                <Label>{t("posts.form.seoKeywords")}</Label>
                <Input value={form.watch("seoKeywords")} onChange={(e) => form.setValue("seoKeywords", e.target.value)} placeholder={t("posts.form.seoKeywordsHint")} disabled={disabled} />
              </div>
              <div className="space-y-2">
                <Label>{t("posts.form.ogImage")}</Label>
                <Input value={form.watch("ogImage")} onChange={(e) => form.setValue("ogImage", e.target.value)} placeholder={t("posts.form.ogImage")} disabled={disabled} />
                <p className="text-xs text-muted-foreground">{t("posts.form.ogImageHint")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("posts.form.settings")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>{t("posts.form.readingTime")}</Label><Input type="number" value={form.watch("readingTime")} onChange={(e) => form.setValue("readingTime", parseInt(e.target.value) || 0)} /></div>
              <div className="space-y-2"><Label>{t("posts.form.order")}</Label><Input type="number" value={form.watch("order")} onChange={(e) => form.setValue("order", parseInt(e.target.value) || 0)} /></div>
              <div className="flex items-center justify-between"><Label>{t("posts.form.featured")}</Label><Switch checked={form.watch("featured")} onCheckedChange={(v) => form.setValue("featured", v)} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{t("posts.form.preview")}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-32 rounded-lg flex items-end p-3" style={{ background: form.watch("gradient") }}>
                <div className="text-white">
                  <p className="text-xs opacity-80">{form.watch("readingTime")} {t("common.minRead")}</p>
                  <p className="font-medium text-sm line-clamp-2">{form.watch("title.en") || t("posts.form.title")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={disabled}>{disabled ? t("common.saving") : (isEdit ? t("common.update") : t("common.create"))}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/posts")}>{t("common.cancel")}</Button>
          </div>
        </div>
      </div>
    </form>
  );
}
