"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Code2, Palette, Heart, BookOpen, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { categoriesAPI, type Category } from "@/lib/api/categories";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = { Code2, Palette, Heart, BookOpen };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoriesAPI.list({});
      if (res.code === 0 && res.data) {
        setCategories(res.data);
      }
    } catch {
      toast.error(t("error.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (id: number) => {
    if (confirm(t("categories.deleteConfirm"))) {
      try {
        await categoriesAPI.delete(id);
        toast.success(t("categories.deleted"));
        fetchCategories();
      } catch {
        toast.error(t("error.deleteFailed"));
      }
    }
  };

  if (loading) return <div className="text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("categories.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("categories.desc")}</p>
        </div>
        <Link href="/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("categories.new")}
          </Button>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {categories.map((category) => {
          const Icon = iconMap[category.icon_name] || Code2;
          const enName = category.translations?.find((t) => t.lang === "en")?.name || category.slug;
          const zhName = category.translations?.find((t) => t.lang === "zh")?.name || "";
          const description = category.translations?.find((t) => t.lang === "en")?.description || "";
          return (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{enName}</CardTitle>
                    {zhName && <p className="text-xs text-muted-foreground">{zhName}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Link href={`/categories/${category.id}`}>
                    <Button variant="ghost" size="sm">
                      {t("categories.edit")}<ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(category.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>
                <Badge variant="outline" className="text-xs">{category.status}</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
