"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

const sections = [
  { key: "works", href: "/works" },
  { key: "categories", href: "/categories" },
  { key: "timeline", href: "/timeline" },
];

export function ContentOverview() {
  const { t } = useI18n();

  const labelMap: Record<string, string> = {
    works: t("dashboard.works"), categories: t("dashboard.categories"), timeline: t("dashboard.timeline"),
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {sections.map((section) => (
        <Card key={section.key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{labelMap[section.key]}</CardTitle>
            <Link href={section.href}>
              <Button variant="ghost" size="sm">
                {t("dashboard.manage")}<ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("dashboard.clickToManage")}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
