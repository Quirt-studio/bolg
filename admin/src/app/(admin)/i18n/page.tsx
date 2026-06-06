"use client";

import { useState, useMemo } from "react";
import { Search, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useI18n, translations } from "@/lib/i18n";
import { toast } from "sonner";

interface TranslationEntry { key: string; section: string; en: string; zh: string; }

const STORAGE_KEY = "bolg-admin-i18n-overrides";

function getOverrides(): Record<string, { en: string; zh: string }> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

export default function I18nPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [overrides, setOverrides] = useState<Record<string, { en: string; zh: string }>>(() => getOverrides());

  const entries: TranslationEntry[] = useMemo(() => {
    return Object.entries(translations).map(([key, val]) => {
      const section = key.split(".")[0] || "other";
      const override = overrides[key];
      return {
        key,
        section,
        en: override?.en ?? val.en ?? "",
        zh: override?.zh ?? val.zh ?? "",
      };
    });
  }, [overrides]);

  const sections = useMemo(() => [...new Set(entries.map((e) => e.section))].sort(), [entries]);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchSearch = !search || e.key.toLowerCase().includes(search.toLowerCase()) || e.en.toLowerCase().includes(search.toLowerCase()) || e.zh.toLowerCase().includes(search.toLowerCase());
      const matchSection = sectionFilter === "all" || e.section === sectionFilter;
      return matchSearch && matchSection;
    });
  }, [entries, search, sectionFilter]);

  const updateEntry = (key: string, lang: "en" | "zh", value: string) => {
    setOverrides((prev) => ({ ...prev, [key]: { ...prev[key], [lang]: value } }));
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
    toast.success(t("success.saved"));
  };

  const handleExport = () => {
    const data: Record<string, { en: string; zh: string }> = {};
    entries.forEach((e) => { data[e.key] = { en: e.en, zh: e.zh }; });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "translations.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("common.exportDone"));
  };

  const editedCount = Object.keys(overrides).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("i18n.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("i18n.desc")}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={editedCount === 0}>
            <Save className="mr-2 h-4 w-4" />{t("common.save")}{editedCount > 0 ? ` (${editedCount})` : ""}
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />{t("i18n.export")}
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder={t("i18n.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-3 text-sm">
              <option value="all">All Sections</option>
              {sections.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">{t("i18n.key")}</TableHead>
                <TableHead className="w-[80px]">{t("i18n.section")}</TableHead>
                <TableHead>EN</TableHead>
                <TableHead>ZH</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => {
                const isEdited = !!overrides[entry.key];
                return (
                  <TableRow key={entry.key} className={isEdited ? "bg-muted/50" : ""}>
                    <TableCell className="font-mono text-xs">{entry.key}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{entry.section}</Badge></TableCell>
                    <TableCell>
                      <Input value={entry.en} onChange={(e) => updateEntry(entry.key, "en", e.target.value)} className="h-7 text-sm" />
                    </TableCell>
                    <TableCell>
                      <Input value={entry.zh} onChange={(e) => updateEntry(entry.key, "zh", e.target.value)} className="h-7 text-sm" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-4">{filtered.length} / {entries.length} entries</p>
        </CardContent>
      </Card>
    </div>
  );
}
