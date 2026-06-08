"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedStringInput } from "./localized-string-input";
import { GradientPicker } from "./gradient-picker";
import { IconPicker } from "./icon-picker";
import { ImageUpload } from "./image-upload";
import { workSchema, type WorkInput, type WorkFormData, type TagCategory } from "@/lib/validations";
import { categoriesAPI, type Category } from "@/lib/api/categories";

type TFunc = (key: string) => string;

interface WorkFormProps {
  initialData?: WorkFormData;
  onSubmit: (data: WorkFormData) => void;
  t: TFunc;
  disabled?: boolean;
}


export function WorkForm({ initialData, onSubmit, t, disabled }: WorkFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoriesAPI.list({}).then((res) => {
      if (res.code === 0 && res.data) {
        setCategories(res.data);
      }
    }).catch(() => {});
  }, []);

  const form = useForm<WorkInput>({
    resolver: zodResolver(workSchema),
    defaultValues: initialData
      ? { title: initialData.title, tag: initialData.tag, tagCategory: initialData.tagCategory, date: initialData.date, excerpt: initialData.excerpt, content: initialData.content || { en: "", zh: "" }, coverImageUrl: initialData.coverImageUrl || "", gradient: initialData.gradient, iconName: initialData.iconName, featured: initialData.featured, order: initialData.order, seoTitle: initialData.seoTitle, seoDescription: initialData.seoDescription, seoKeywords: initialData.seoKeywords, ogImage: initialData.ogImage, videoUrl: initialData.videoUrl || "", link: initialData.link || "" }
      : { title: { en: "", zh: "" }, tag: { en: "", zh: "" }, tagCategory: "", date: new Date().toISOString().split("T")[0], excerpt: { en: "", zh: "" }, content: { en: "", zh: "" }, coverImageUrl: "", gradient: "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)", iconName: "FileText", featured: false, order: 0, seoTitle: "", seoDescription: "", seoKeywords: "", ogImage: "", videoUrl: "", link: "" },
    mode: "onChange",
  });

  const handleSubmit = form.handleSubmit(
    async (data) => {
      console.log("Form submitted with data:", data);
      try {
        await onSubmit(data);
        console.log("onSubmit completed successfully");
      } catch (err) {
        console.error("onSubmit error:", err);
      }
    },
    (errors) => {
      console.error("Form validation errors:", errors);
      alert("Please fill in all required fields: Title (EN/ZH), Tag (EN/ZH), Excerpt (EN/ZH)");
    }
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("works.form.content")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <LocalizedStringInput label={t("works.form.title")} valueEn={form.watch("title.en") || ""} valueZh={form.watch("title.zh") || ""}
                onChangeEn={(v) => form.setValue("title.en", v)} onChangeZh={(v) => form.setValue("title.zh", v)} />
              {form.formState.errors.title && <p className="text-sm text-destructive">Title is required in both languages</p>}
              <LocalizedStringInput label={t("works.form.excerpt")} valueEn={form.watch("excerpt.en") || ""} valueZh={form.watch("excerpt.zh") || ""}
                onChangeEn={(v) => form.setValue("excerpt.en", v)} onChangeZh={(v) => form.setValue("excerpt.zh", v)} multiline />
              {form.formState.errors.excerpt && <p className="text-sm text-destructive">Excerpt is required in both languages</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{t("works.form.content")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("works.form.contentEn")}</Label>
                <textarea className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder={t("works.form.writeEn")}
                  value={form.watch("content.en")}
                  onChange={(e) => form.setValue("content.en", e.target.value)}
                  disabled={disabled} />
              </div>
              <div className="space-y-2">
                <Label>{t("works.form.contentZh")}</Label>
                <textarea className="flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="用中文写内容..."
                  value={form.watch("content.zh")}
                  onChange={(e) => form.setValue("content.zh", e.target.value)}
                  disabled={disabled} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{t("works.form.appearance")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                value={form.watch("coverImageUrl") || ""}
                onChange={(url) => form.setValue("coverImageUrl", url)}
                disabled={disabled}
              />
              <GradientPicker value={form.watch("gradient") || ""} onChange={(v) => form.setValue("gradient", v)} />
              <IconPicker value={form.watch("iconName") || ""} onChange={(v) => form.setValue("iconName", v)} />
              <div className="space-y-2">
                <Label>{t("works.form.videoUrl")}</Label>
                <Input value={form.watch("videoUrl")} onChange={(e) => form.setValue("videoUrl", e.target.value)} placeholder={t("works.form.videoUrl")} disabled={disabled} />
                <p className="text-xs text-muted-foreground">{t("works.form.videoUrlHint")}</p>
              </div>
              <div className="space-y-2">
                <Label>{t("works.form.link")}</Label>
                <Input value={form.watch("link") || ""} onChange={(e) => form.setValue("link", e.target.value)} placeholder="https://..." disabled={disabled} />
                <p className="text-xs text-muted-foreground">{t("works.form.linkHint")}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{t("works.form.seo")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("works.form.seoTitle")}</Label>
                <Input value={form.watch("seoTitle")} onChange={(e) => form.setValue("seoTitle", e.target.value)} placeholder={t("works.form.seoTitleHint")} disabled={disabled} />
              </div>
              <div className="space-y-2">
                <Label>{t("works.form.seoDesc")}</Label>
                <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder={t("works.form.seoDescHint")}
                  value={form.watch("seoDescription")}
                  onChange={(e) => form.setValue("seoDescription", e.target.value)}
                  disabled={disabled} />
              </div>
              <div className="space-y-2">
                <Label>{t("works.form.seoKeywords")}</Label>
                <Input value={form.watch("seoKeywords")} onChange={(e) => form.setValue("seoKeywords", e.target.value)} placeholder={t("works.form.seoKeywordsHint")} disabled={disabled} />
              </div>
              <div className="space-y-2">
                <Label>{t("works.form.ogImage")}</Label>
                <Input value={form.watch("ogImage")} onChange={(e) => form.setValue("ogImage", e.target.value)} placeholder={t("works.form.ogImage")} disabled={disabled} />
                <p className="text-xs text-muted-foreground">{t("works.form.ogImageHint")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("works.form.settings")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <LocalizedStringInput label={t("works.form.tag")} valueEn={form.watch("tag.en") || ""} valueZh={form.watch("tag.zh") || ""}
                onChangeEn={(v) => form.setValue("tag.en", v)} onChangeZh={(v) => form.setValue("tag.zh", v)} />
              {form.formState.errors.tag && <p className="text-sm text-destructive">Tag is required in both languages</p>}
              <div className="space-y-2">
                <Label>{t("works.form.category")}</Label>
                <Select value={form.watch("tagCategory")} onValueChange={(v) => v && form.setValue("tagCategory", v as TagCategory)}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => {
                      const name = cat.translations?.find((tr) => tr.lang === "en")?.name || cat.slug;
                      return <SelectItem key={cat.id} value={String(cat.id)}>{name}</SelectItem>;
                    })}
                    {categories.length === 0 && <SelectItem value="none" disabled>No categories</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{t("works.form.date")}</Label><Input type="date" value={form.watch("date")} onChange={(e) => form.setValue("date", e.target.value)} /></div>
              <div className="space-y-2"><Label>{t("works.form.order")}</Label><Input type="number" value={form.watch("order")} onChange={(e) => form.setValue("order", parseInt(e.target.value) || 0)} /></div>
              <div className="flex items-center justify-between"><Label>{t("works.form.featured")}</Label><Switch checked={form.watch("featured")} onCheckedChange={(v) => form.setValue("featured", v)} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{t("works.form.preview")}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-32 rounded-lg flex items-end p-3" style={{ background: form.watch("gradient") }}>
                <div className="text-white">
                  <p className="text-xs opacity-80">{form.watch("tag.en") || t("works.form.tag")}</p>
                  <p className="font-medium text-sm line-clamp-2">{form.watch("title.en") || t("works.form.title")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={disabled}>{disabled ? t("common.saving") : (isEdit ? t("works.form.update") : t("works.form.create"))}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/works")}>{t("works.form.cancel")}</Button>
          </div>
        </div>
      </div>
    </form>
  );
}
