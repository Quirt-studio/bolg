"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedStringInput } from "@/components/forms/localized-string-input";
import { settingsAPI } from "@/lib/api/settings";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function SeoSettingsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteTitleEn, setSiteTitleEn] = useState("");
  const [siteTitleZh, setSiteTitleZh] = useState("");
  const [siteDescEn, setSiteDescEn] = useState("");
  const [siteDescZh, setSiteDescZh] = useState("");
  const [ogImage, setOgImage] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await settingsAPI.getByKey("seo");
        if (res.code === 0 && res.data) {
          const val = res.data.setting_value as Record<string, unknown>;
          const title = val?.siteTitle as Record<string, string> || {};
          const desc = val?.siteDescription as Record<string, string> || {};
          setSiteTitleEn(title.en || "");
          setSiteTitleZh(title.zh || "");
          setSiteDescEn(desc.en || "");
          setSiteDescZh(desc.zh || "");
          setOgImage((val?.ogImage as string) || "");
        }
      } catch {
        // Not yet created
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update("seo", {
        siteTitle: { en: siteTitleEn, zh: siteTitleZh },
        siteDescription: { en: siteDescEn, zh: siteDescZh },
        ogImage,
      });
      toast.success(t("settings.seo.saved"));
    } catch {
      toast.error(t("error.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("settings.seo.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("settings.seo.desc")}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>{saving ? t("common.saving") : t("settings.seo.save")}</Button>
          <Button variant="outline" onClick={() => router.push("/settings")}>{t("settings.seo.cancel")}</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("settings.seo.meta")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <LocalizedStringInput label={t("settings.seo.siteTitle")} valueEn={siteTitleEn} valueZh={siteTitleZh} onChangeEn={setSiteTitleEn} onChangeZh={setSiteTitleZh} />
            <LocalizedStringInput label={t("settings.seo.siteDesc")} valueEn={siteDescEn} valueZh={siteDescZh} onChangeEn={setSiteDescEn} onChangeZh={setSiteDescZh} multiline />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{t("settings.seo.og")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t("settings.seo.ogImage")}</Label>
              <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="/images/og-default.jpg" />
              <p className="text-xs text-muted-foreground">{t("settings.seo.ogImageHint")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
