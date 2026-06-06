"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, FolderOpen, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { worksAPI } from "@/lib/api/works";
import { postsAPI } from "@/lib/api/posts";
import { useI18n } from "@/lib/i18n";

interface ActivityItem {
  id: number;
  type: "work" | "post";
  title: string;
  status: string;
  updatedAt: string;
  href: string;
}

export function RecentActivity() {
  const { t, lang } = useI18n();
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const [worksRes, postsRes] = await Promise.all([
          worksAPI.list({ status: "all", per_page: 5 }),
          postsAPI.list({ status: "all", per_page: 5 }),
        ]);

        const works = (worksRes.data?.items || []).map((w) => ({
          id: w.id,
          type: "work" as const,
          title: w.translations?.[lang]?.title || w.translations?.en?.title || w.slug,
          status: w.status,
          updatedAt: w.updated_at,
          href: `/works/${w.id}`,
        }));

        const posts = (postsRes.data?.items || []).map((p) => ({
          id: p.id,
          type: "post" as const,
          title: p.translations?.[lang]?.title || p.translations?.en?.title || p.slug,
          status: p.status,
          updatedAt: p.updated_at,
          href: `/posts/${p.id}`,
        }));

        // Merge and sort by updated_at desc
        const all = [...works, ...posts]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 8);

        setItems(all);
      } catch {
        // API not available
      }
    }
    fetchRecent();
  }, [lang]);

  const statusVariant = (status: string) => {
    switch (status) {
      case "published": return "default" as const;
      case "draft": return "secondary" as const;
      case "scheduled": return "outline" as const;
      default: return "secondary" as const;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return t("common.justNow");
    if (diffMin < 60) return `${diffMin}${t("common.mAgo")}`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}${t("common.hAgo")}`;
    const diffDay = Math.floor(diffHr / 24);
    if (diffDay < 7) return `${diffDay}${t("common.dAgo")}`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-medium">{t("dashboard.recentlyUpdated")}</CardTitle></CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">{t("dashboard.noActivity")}</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {item.type === "work" ? (
                  <FolderOpen className="h-4 w-4 text-brand shrink-0" />
                ) : (
                  <FileText className="h-4 w-4 text-brand-warm shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant={statusVariant(item.status)} className="text-[10px] px-1.5 py-0">
                      {item.status}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(item.updatedAt)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
