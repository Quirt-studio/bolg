"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedStringInput } from "@/components/forms/localized-string-input";
import { settingsAPI } from "@/lib/api/settings";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function HeroSettingsPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brandEn, setBrandEn] = useState("");
  const [brandZh, setBrandZh] = useState("");
  const [headingEn, setHeadingEn] = useState("");
  const [headingZh, setHeadingZh] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [subtitleZh, setSubtitleZh] = useState("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await settingsAPI.getByKey("hero");
        if (res.code === 0 && res.data) {
          const val = res.data.setting_value as Record<string, Record<string, string>>;
          setBrandEn(val?.brandText?.en || "");
          setBrandZh(val?.brandText?.zh || "");
          setHeadingEn(val?.headingText?.en || "");
          setHeadingZh(val?.headingText?.zh || "");
          setSubtitleEn(val?.subtitleText?.en || "");
          setSubtitleZh(val?.subtitleText?.zh || "");
        }
      } catch {
        // API not available
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update("hero", {
        brandText: { en: brandEn, zh: brandZh },
        headingText: { en: headingEn, zh: headingZh },
        subtitleText: { en: subtitleEn, zh: subtitleZh },
      });
      toast.success(t("settings.hero.saved"));
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
          <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("settings.hero.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("settings.hero.desc")}</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? t("common.saving") : t("settings.hero.save")}</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">{t("settings.hero.mainContent")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <LocalizedStringInput label={t("common.brandText")} valueEn={brandEn} valueZh={brandZh} onChangeEn={setBrandEn} onChangeZh={setBrandZh} />
          <LocalizedStringInput label={t("common.heading")} valueEn={headingEn} valueZh={headingZh} onChangeEn={setHeadingEn} onChangeZh={setHeadingZh} />
          <LocalizedStringInput label={t("common.subtitle")} valueEn={subtitleEn} valueZh={subtitleZh} onChangeEn={setSubtitleEn} onChangeZh={setSubtitleZh} />
        </CardContent>
      </Card>
    </div>
  );
}
