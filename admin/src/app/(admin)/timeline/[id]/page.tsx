"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedStringInput } from "@/components/forms/localized-string-input";
import { timelineAPI, type TimelineMilestone } from "@/lib/api/timeline";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function EditTimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useI18n();

  const [milestone, setMilestone] = useState<TimelineMilestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [titleZh, setTitleZh] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descZh, setDescZh] = useState("");
  const [order, setOrder] = useState(0);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await timelineAPI.get(id);
        if (res.code === 0 && res.data) {
          const m = res.data;
          setMilestone(m);
          setDate(m.date?.split("T")[0] || "");
          setOrder(m.sort_order || 0);
          const en = m.translations?.find((tr) => tr.lang === "en");
          const zh = m.translations?.find((tr) => tr.lang === "zh");
          setTitleEn(en?.title || "");
          setTitleZh(zh?.title || "");
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
      await timelineAPI.update(id, {
        date,
        sort_order: order,
        translations: {
          en: { title: titleEn, description: descEn },
          zh: { title: titleZh, description: descZh },
        },
      });
      toast.success(t("timeline.updated"));
      router.push("/timeline");
    } catch {
      toast.error(t("error.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-muted-foreground">{t("common.loading")}</div>;
  if (!milestone) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">{t("timeline.notFound")}</p></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("timeline.editTitle")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{date} - {titleEn}</p>
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
          <Button type="submit" disabled={saving}>{saving ? t("common.saving") : t("timeline.form.update")}</Button>
          <Button type="button" variant="outline" onClick={() => router.push("/timeline")}>{t("timeline.form.cancel")}</Button>
        </div>
      </form>
    </div>
  );
}
