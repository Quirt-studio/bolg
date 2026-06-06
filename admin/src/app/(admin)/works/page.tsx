"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/data-table";
import { worksAPI, type Work } from "@/lib/api/works";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { getColumns } from "./columns";

export default function WorksPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleDialog, setScheduleDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const [scheduleDate, setScheduleDate] = useState("");
  const { t } = useI18n();

  const fetchWorks = async () => {
    try {
      const res = await worksAPI.list({ status: "all", per_page: 100 });
      if (res.code === 0 && res.data) {
        setWorks(res.data.items);
      }
    } catch {
      toast.error(t("error.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm(t("works.deleteConfirm"))) {
      try {
        await worksAPI.delete(id);
        toast.success(t("works.deleted"));
        fetchWorks();
      } catch {
        toast.error(t("error.deleteFailed"));
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await worksAPI.publish(id);
      toast.success(t("success.published"));
      fetchWorks();
    } catch {
      toast.error(t("error.publishFailed"));
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await worksAPI.unpublish(id);
      toast.success(t("success.unpublished"));
      fetchWorks();
    } catch {
      toast.error(t("error.unpublishFailed"));
    }
  };

  const handleSchedule = (id: string) => {
    setScheduleDialog({ open: true, id });
    // Default to tomorrow at 9:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setScheduleDate(tomorrow.toISOString().slice(0, 16));
  };

  const confirmSchedule = async () => {
    if (!scheduleDate) return;
    try {
      await worksAPI.schedulePublish(scheduleDialog.id, scheduleDate);
      toast.success(t("success.scheduled"));
      setScheduleDialog({ open: false, id: "" });
      fetchWorks();
    } catch {
      toast.error(t("error.scheduleFailed"));
    }
  };

  const handleBatchDelete = async (ids: (string | number)[]) => {
    if (confirm(t("confirm.deleteWorks"))) {
      try {
        await worksAPI.batchDelete(ids);
        toast.success(`${ids.length} ${t("success.deleted")}`);
        fetchWorks();
      } catch {
        toast.error(t("error.deleteFailed"));
      }
    }
  };

  const handleBatchPublish = async (ids: (string | number)[]) => {
    try {
      await worksAPI.batchPublish(ids);
      toast.success(`${ids.length} ${t("success.published")}`);
      fetchWorks();
    } catch {
      toast.error(t("error.publishFailed"));
    }
  };

  const handleBatchUnpublish = async (ids: (string | number)[]) => {
    try {
      await worksAPI.batchUnpublish(ids);
      toast.success(`${ids.length} ${t("success.unpublished")}`);
      fetchWorks();
    } catch {
      toast.error(t("error.unpublishFailed"));
    }
  };

  const columns = getColumns({ onDelete: handleDelete, onPublish: handlePublish, onUnpublish: handleUnpublish, onSchedule: handleSchedule }, t);

  if (loading) {
    return <div className="text-muted-foreground">{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("works.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("works.desc")}</p>
        </div>
        <Link href="/works/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />{t("works.new")}
          </Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={works}
        searchColumn="title"
        searchPlaceholder={t("works.search")}
        renderBulkActions={(table) => {
          const selectedIds = table.getFilteredSelectedRowModel().rows.map((r) => r.original.id);
          return (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleBatchPublish(selectedIds)}>
                <Upload className="mr-1 h-3 w-3" />{t("common.publish")}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBatchUnpublish(selectedIds)}>
                <Download className="mr-1 h-3 w-3" />{t("common.unpublish")}
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleBatchDelete(selectedIds)}>
                <Trash2 className="mr-1 h-3 w-3" />{t("common.delete")}
              </Button>
            </div>
          );
        }}
      />

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialog.open} onOpenChange={(open) => setScheduleDialog({ open, id: scheduleDialog.id })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("schedule.title")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("schedule.dateTime")}</label>
              <Input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialog({ open: false, id: "" })}>{t("common.cancel")}</Button>
            <Button onClick={confirmSchedule} disabled={!scheduleDate}>{t("common.schedule")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
