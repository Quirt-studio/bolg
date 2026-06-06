"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedStringInput } from "@/components/forms/localized-string-input";
import { IconPicker } from "@/components/forms/icon-picker";
import { ImageUpload } from "@/components/forms/image-upload";
import { categoriesAPI, type Category } from "@/lib/api/categories";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useI18n();

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descZh, setDescZh] = useState("");
  const [icon, setIcon] = useState("Code2");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  useEffect(() => {
    async function fetch() {
      try {
        const res = await categoriesAPI.get(id);
        if (res.code === 0 && res.data) {
          const c = res.data;
          setCategory(c);
          setIcon(c.icon_name || "Code2");
          setCoverImageUrl(c.cover_image_url || "");
          const en = c.translations?.find((tr) => tr.lang === "en");
          const zh = c.translations?.find((tr) => tr.lang === "zh");
          setNameEn(en?.name || "");
          setNameZh(zh?.name || "");
          setDescEn(en?.description || "");
          setDescZh(zh?.description || "");
        }
      } catch {
        toast.error(t("error.loadFailed"));
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await categoriesAPI.update(id, {
        icon_name: icon,
        cover_image_url: coverImageUrl,
        translations: {
          en: { name: nameEn, description: descEn },
          zh: { name: nameZh, description: descZh },
        },
      });
      toast.success(t("categories.updated"));
      router.push("/categories");
    } catch {
      toast.error(t("error.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-muted-foreground">{t("common.loading")}</div>;
  if (!category) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t("categories.notFound")}</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("categories.editTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{nameEn}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("categories.form.content")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <LocalizedStringInput label={t("categories.form.title")} valueEn={nameEn} valueZh={nameZh} onChangeEn={setNameEn} onChangeZh={setNameZh} />
              <LocalizedStringInput label={t("categories.form.description")} valueEn={descEn} valueZh={descZh} onChangeEn={setDescEn} onChangeZh={setDescZh} multiline />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{t("categories.form.appearance")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <IconPicker value={icon} onChange={setIcon} />
              <div className="space-y-2">
                <Label>{t("categories.form.coverImage")}</Label>
                <ImageUpload value={coverImageUrl} onChange={setCoverImageUrl} folder="categories" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? t("common.saving") : t("categories.form.update")}</Button>
          <Button type="button" variant="outline" onClick={() => router.push("/categories")}>{t("categories.form.cancel")}</Button>
        </div>
      </form>
    </div>
  );
}
