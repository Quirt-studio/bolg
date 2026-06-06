"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { categoriesAPI } from "@/lib/api/categories";
import { worksAPI } from "@/lib/api/works";
import { useI18n } from "@/lib/i18n";

const COLORS = ["#2C3E6B", "#C4884E", "#11998E", "#8B6F4E", "#6B4C9A", "#E74C3C", "#3498DB"];

interface CategoryItem {
  id: number;
  slug: string;
  translations?: Array<{ lang: string; name: string }>;
}

export function ContentChart() {
  const { t, lang } = useI18n();
  const [data, setData] = useState<{ name: string; value: number; color: string }[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catsRes, worksRes] = await Promise.all([
          categoriesAPI.list({}),
          worksAPI.list({ status: "all", per_page: 100 }),
        ]);

        if (catsRes.code === 0 && catsRes.data) {
          const categories: CategoryItem[] = catsRes.data;
          const works = worksRes.data?.items || [];

          // Count works per category
          const countMap: Record<number, number> = {};
          for (const w of works) {
            const catId = w.category?.id;
            if (catId) {
              countMap[catId] = (countMap[catId] || 0) + 1;
            }
          }

          const chartData = categories
            .map((cat, i) => {
              const name = cat.translations?.find((tr) => tr.lang === lang)?.name
                || cat.translations?.find((tr) => tr.lang === "en")?.name
                || cat.slug;
              return {
                name,
                value: countMap[cat.id] || 0,
                color: COLORS[i % COLORS.length],
              };
            })
            .filter((d) => d.value > 0);

          setData(chartData);
        }
      } catch {
        // API not available
      }
    }
    fetchData();
  }, [lang]);

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-medium">{t("dashboard.distribution")}</CardTitle></CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">{t("dashboard.noWorks")}</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "12px" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
