"use client";

import Link from "next/link";
import { ArrowRight, Palette, Navigation, PanelBottom, Lock, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const icons: Record<string, React.ComponentType<{ className?: string }>> = { Palette, Navigation, PanelBottom, Lock, Search };

export default function SettingsPage() {
  const { t } = useI18n();

  const settingsPages = [
    { title: t("sidebar.hero"), desc: t("settings.hero.desc"), href: "/settings/hero", icon: "Palette" },
    { title: t("sidebar.navigation"), desc: t("settings.nav.desc"), href: "/settings/navigation", icon: "Navigation" },
    { title: t("sidebar.footer"), desc: t("settings.footer.desc"), href: "/settings/footer", icon: "PanelBottom" },
    { title: t("settings.password.title"), desc: t("settings.password.desc"), href: "/settings/password", icon: "Lock" },
    { title: t("settings.seo.title"), desc: t("settings.seo.desc"), href: "/settings/seo", icon: "Search" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t("settings.desc")}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {settingsPages.map((page) => {
          const Icon = icons[page.icon] || Palette;
          return (
            <Card key={page.href}>
              <CardHeader className="flex flex-row items-center gap-3 pb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted"><Icon className="h-5 w-5" /></div>
                <CardTitle className="text-base">{page.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{page.desc}</p>
                <Link href={page.href}>
                  <Button variant="outline" size="sm">
                    {t("settings.configure")}<ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
