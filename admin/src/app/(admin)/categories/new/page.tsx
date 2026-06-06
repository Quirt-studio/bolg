"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedStringInput } from "@/components/forms/localized-string-input";
import { IconPicker } from "@/components/forms/icon-picker";
import { ImageUpload } from "@/components/forms/image-upload";
import { categoriesAPI } from "@/lib/api/categories";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function NewCategoryPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [saving, setSaving] = useState(false);
  const [nameEn, setNameEn] = useState("");
  const [nameZh, setNameZh] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descZh, setDescZh] = useState("");
  const [icon, setIcon] = useState("Code2");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim()) {
      toast.error(t("error.nameRequired"));
      return;
    }
    setSaving(true);
    try {
      await categoriesAPI.create({
        slug: nameEn.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        icon_name: icon,
        cover_image_url: coverImageUrl,
        status: "active",
        translations: {
          en: { name: nameEn, description: descEn },
          zh: { name: nameZh, description: descZh },
        },
      });
      toast.success(t("categories.created"));
      router.push("/categories");
    } catch {
      toast.error(t("error.createFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("categories.newTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("categories.newDesc")}</p>
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
          <Button type="submit" disabled={saving}>{saving ? t("common.saving") : t("categories.form.create")}</Button>
          <Button type="button" variant="outline" onClick={() => router.push("/categories")}>{t("categories.form.cancel")}</Button>
        </div>
      </form>
    </div>
  );
}
