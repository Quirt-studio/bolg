"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { timelineAPI, type TimelineMilestone } from "@/lib/api/timeline";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

export default function TimelinePage() {
  const [milestones, setMilestones] = useState<TimelineMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  const fetchTimeline = async () => {
    try {
      const res = await timelineAPI.list({ status: "all" });
      if (res.code === 0 && res.data) {
        setMilestones(res.data);
      }
    } catch {
      toast.error(t("error.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm(t("timeline.deleteConfirm"))) {
      try {
        await timelineAPI.delete(id);
        toast.success(t("timeline.deleted"));
        fetchTimeline();
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
          <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("timeline.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("timeline.desc")}</p>
        </div>
        <Link href="/timeline/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />{t("timeline.new")}
          </Button>
        </Link>
      </div>
      <div className="relative space-y-0">
        {milestones.map((milestone, i) => {
          const enTrans = milestone.translations?.find((tr) => tr.lang === "en");
          const zhTrans = milestone.translations?.find((tr) => tr.lang === "zh");
          return (
            <div key={milestone.id} className="relative flex gap-4 pb-6">
              {i < milestones.length - 1 && <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border" />}
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-mono">
                {milestone.date?.slice(2, 4)}
              </div>
              <Card className="flex-1">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{enTrans?.title || zhTrans?.title || "—"}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{enTrans?.description || ""}</p>
                      <Badge variant="outline" className="text-[10px]">{milestone.date}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/timeline/${milestone.id}`}>
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(String(milestone.id))}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
