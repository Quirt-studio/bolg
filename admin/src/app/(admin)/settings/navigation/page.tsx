"use client";

import { useEffect, useState } from "react";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocalizedStringInput } from "@/components/forms/localized-string-input";
import { settingsAPI } from "@/lib/api/settings";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

interface NavLink {
  label: { en: string; zh: string };
  href: string;
  order: number;
}

export default function NavigationSettingsPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [links, setLinks] = useState<NavLink[]>([]);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await settingsAPI.getByKey("navigation");
        if (res.code === 0 && res.data) {
          const val = res.data.setting_value as { links?: NavLink[] };
          setLinks(val?.links || []);
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
      await settingsAPI.update("navigation", { links: links.map((l, i) => ({ ...l, order: i })) });
      toast.success(t("settings.nav.saved"));
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
          <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("settings.nav.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("settings.nav.desc")}</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>{saving ? t("common.saving") : t("settings.nav.save")}</Button>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">{t("settings.nav.links")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {links.map((link, i) => (
            <div key={i} className="flex items-start gap-2 p-4 rounded-lg border bg-muted/30">
              <div className="pt-2"><GripVertical className="h-4 w-4 text-muted-foreground" /></div>
              <div className="flex-1 space-y-3">
                <LocalizedStringInput label={t("settings.nav.label")} valueEn={link.label?.en || ""} valueZh={link.label?.zh || ""}
                  onChangeEn={(v) => { const nl = [...links]; nl[i] = { ...nl[i], label: { ...nl[i].label, en: v } }; setLinks(nl); }}
                  onChangeZh={(v) => { const nl = [...links]; nl[i] = { ...nl[i], label: { ...nl[i].label, zh: v } }; setLinks(nl); }} />
                <div className="space-y-2">
                  <Label>{t("settings.nav.link")}</Label>
                  <Input value={link.href} onChange={(e) => { const nl = [...links]; nl[i] = { ...nl[i], href: e.target.value }; setLinks(nl); }} />
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={() => setLinks(links.filter((_, j) => j !== i))}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => setLinks([...links, { label: { en: t("common.newLink"), zh: t("common.newLink") }, href: "#", order: links.length }])} className="w-full">
            <Plus className="mr-2 h-4 w-4" />{t("settings.nav.add")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
