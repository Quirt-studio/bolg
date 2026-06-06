"use client";

import { useEffect, useState } from "react";
import { FileText, FolderOpen, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { worksAPI } from "@/lib/api/works";
import { postsAPI } from "@/lib/api/posts";
import { categoriesAPI } from "@/lib/api/categories";
import { timelineAPI } from "@/lib/api/timeline";
import { useI18n } from "@/lib/i18n";

export function StatsCards() {
  const { t } = useI18n();
  const [stats, setStats] = useState({ works: 0, posts: 0, categories: 0, timeline: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [worksRes, postsRes, catsRes, timelineRes] = await Promise.all([
          worksAPI.list({ status: "all", per_page: 1 }),
          postsAPI.list({ status: "all", per_page: 1 }),
          categoriesAPI.list({}),
          timelineAPI.list({ status: "all" }),
        ]);
        setStats({
          works: worksRes.data?.meta?.total_items ?? 0,
          posts: postsRes.data?.meta?.total_items ?? 0,
          categories: catsRes.data?.length ?? 0,
          timeline: timelineRes.data?.length ?? 0,
        });
      } catch {
        // API not available yet
      }
    }
    fetchStats();
  }, []);

  const statConfig = [
    { key: "works", label: t("dashboard.works"), icon: FileText, color: "text-brand", count: stats.works },
    { key: "posts", label: t("dashboard.posts"), icon: FileText, color: "text-brand-warm", count: stats.posts },
    { key: "categories", label: t("dashboard.categories"), icon: FolderOpen, color: "text-emerald-600", count: stats.categories },
    { key: "timeline", label: t("dashboard.timeline"), icon: GitBranch, color: "text-violet-600", count: stats.timeline },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statConfig.map((stat) => (
        <Card key={stat.key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.count}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("dashboard.itemsManaged")}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
