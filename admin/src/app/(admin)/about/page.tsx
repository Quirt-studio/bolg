"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { aboutAPI, type AboutSection } from "@/lib/api/about";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function AboutPage() {
  const { t } = useI18n();
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [editContent, setEditContent] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchAbout() {
      try {
        const res = await aboutAPI.getSections();
        if (res.code === 0 && res.data) {
          setSections(res.data.sections);
          // Initialize edit content from API data
          const content: Record<string, Record<string, string>> = {};
          for (const section of res.data.sections) {
            content[section.section_key] = {};
            for (const tr of section.translations || []) {
              content[section.section_key][tr.lang] =
                typeof tr.content === "string" ? tr.content : JSON.stringify(tr.content, null, 2);
            }
          }
          setEditContent(content);
        }
      } catch {
        toast.error(t("error.loadFailed"));
      } finally {
        setLoading(false);
      }
    }
    fetchAbout();
  }, []);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateContent = (sectionKey: string, lang: string, value: string) => {
    setEditContent((prev) => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [lang]: value },
    }));
  };

  const handleSave = async (section: AboutSection) => {
    const sectionKey = section.section_key;
    setSaving((prev) => ({ ...prev, [sectionKey]: true }));
    try {
      const content = editContent[sectionKey] || {};
      // Try to parse as JSON, fall back to raw string
      const parseContent = (val: string) => {
        try { return JSON.parse(val); } catch { return val; }
      };
      await aboutAPI.updateSection(section.id, {
        translations: {
          en: { lang: "en", content: parseContent(content.en || "") },
          zh: { lang: "zh", content: parseContent(content.zh || "") },
        },
      });
      toast.success(t("about.saved"));
    } catch {
      toast.error(t("error.saveFailed"));
    } finally {
      setSaving((prev) => ({ ...prev, [sectionKey]: false }));
    }
  };

  if (loading) return <div className="text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("about.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("about.desc")}</p>
        </div>
      </div>

      {sections.map((section) => {
        const sectionKey = section.section_key;
        const isOpen = openSections[sectionKey] ?? true;
        const content = editContent[sectionKey] || {};
        const isSaving = saving[sectionKey] || false;

        const titleKey = sectionKey === "bio" ? "about.bio"
          : sectionKey === "values" ? "about.values"
          : sectionKey === "quote" ? "about.quote"
          : sectionKey === "tech_stack" ? "about.techStack"
          : sectionKey;

        return (
          <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(sectionKey)}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">{t(titleKey)}</CardTitle>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("about.contentEn")}</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={content.en || ""}
                      onChange={(e) => updateContent(sectionKey, "en", e.target.value)}
                      placeholder={t("about.contentHint")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("about.contentZh")}</label>
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={content.zh || ""}
                      onChange={(e) => updateContent(sectionKey, "zh", e.target.value)}
                      placeholder='纯文本或 JSON（例如 ["段落1", "段落2"]）'
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave(section)} disabled={isSaving}>
                      {isSaving ? t("common.saving") : t("about.save")}
                    </Button>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}
