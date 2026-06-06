"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedStringInput } from "@/components/forms/localized-string-input";
import { settingsAPI } from "@/lib/api/settings";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

interface FooterLink {
  id: string;
  label: string;
  url: string;
}

export default function FooterSettingsPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [brandDescEn, setBrandDescEn] = useState("");
  const [brandDescZh, setBrandDescZh] = useState("");
  const [socialLinks, setSocialLinks] = useState<FooterLink[]>([]);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await settingsAPI.getByKey("footer");
        if (res.code === 0 && res.data) {
          const val = res.data.setting_value as Record<string, unknown>;
          const bd = val?.brandDescription as Record<string, string>;
          setBrandDescEn(bd?.en || "");
          setBrandDescZh(bd?.zh || "");
          setSocialLinks((val?.socialLinks as FooterLink[]) || []);
        }
      } catch {
        // API not available
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.update("footer", {
        brandDescription: { en: brandDescEn, zh: brandDescZh },
        socialLinks,
      });
      toast.success(t("settings.footer.saved"));
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
          <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("settings.footer.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("settings.footer.desc")}</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? t("common.saving") : t("settings.footer.save")}</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">{t("settings.footer.brand")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <LocalizedStringInput label={t("settings.footer.brandDesc")} valueEn={brandDescEn} valueZh={brandDescZh} onChangeEn={setBrandDescEn} onChangeZh={setBrandDescZh} multiline />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{t("settings.footer.social")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {socialLinks.map((link, i) => (
              <div key={link.id} className="flex gap-2">
                <Input value={link.label} onChange={(e) => { const nl = [...socialLinks]; nl[i] = { ...nl[i], label: e.target.value }; setSocialLinks(nl); }} placeholder={t("common.label")} className="flex-1" />
                <Input value={link.url} onChange={(e) => { const nl = [...socialLinks]; nl[i] = { ...nl[i], url: e.target.value }; setSocialLinks(nl); }} placeholder={t("common.url")} className="flex-1" />
                <Button variant="ghost" size="icon-sm" onClick={() => setSocialLinks(socialLinks.filter((_, idx) => idx !== i))}><Trash2 className="h-3 w-3 text-destructive" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setSocialLinks([...socialLinks, { id: `link-${socialLinks.length}-${crypto.randomUUID()}`, label: "", url: "#" }])}>
              <Plus className="mr-2 h-3 w-3" />{t("settings.footer.addLink")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
