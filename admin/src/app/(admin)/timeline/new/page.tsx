"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedStringInput } from "@/components/forms/localized-string-input";
import { timelineAPI } from "@/lib/api/timeline";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function NewTimelinePage() {
  const router = useRouter();
  const { t } = useI18n();

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [titleEn, setTitleEn] = useState("");
  const [titleZh, setTitleZh] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descZh, setDescZh] = useState("");
  const [order, setOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await timelineAPI.create({
        date,
        sort_order: order,
        status: "published",
        translations: {
          en: { title: titleEn, description: descEn },
          zh: { title: titleZh, description: descZh },
        },
      });
      toast.success(t("timeline.created"));
      router.push("/timeline");
    } catch {
      toast.error(t("error.createFailed"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("timeline.newTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("timeline.newDesc")}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">{t("timeline.form.content")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <LocalizedStringInput label={t("timeline.form.title")} valueEn={titleEn} valueZh={titleZh} onChangeEn={setTitleEn} onChangeZh={setTitleZh} />
              <LocalizedStringInput label={t("timeline.form.description")} valueEn={descEn} valueZh={descZh} onChangeEn={setDescEn} onChangeZh={setDescZh} multiline />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{t("timeline.form.settings")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>{t("timeline.form.year")}</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>{t("timeline.form.order")}</Label><Input type="number" value={order} onChange={(e) => setOrder(parseInt(e.target.value) || 0)} /></div>
            </CardContent>
          </Card>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? t("common.saving") : t("timeline.form.create")}</Button>
          <Button type="button" variant="outline" onClick={() => router.push("/timeline")}>{t("timeline.form.cancel")}</Button>
        </div>
      </form>
    </div>
  );
}
