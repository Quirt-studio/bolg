"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DataTable } from "@/components/data-table/data-table";
import { postsAPI, type Post } from "@/lib/api/posts";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { getColumns } from "./columns";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleDialog, setScheduleDialog] = useState<{ open: boolean; id: string }>({ open: false, id: "" });
  const [scheduleDate, setScheduleDate] = useState("");
  const { t } = useI18n();

  const fetchPosts = async () => {
    try {
      const res = await postsAPI.list({ status: "all", per_page: 100 });
      if (res.code === 0 && res.data) {
        setPosts(res.data.items);
      }
    } catch {
      toast.error(t("error.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm(t("confirm.deleteThisPost"))) {
      try {
        await postsAPI.delete(id);
        toast.success(t("success.deleted"));
        fetchPosts();
      } catch {
        toast.error(t("error.deleteFailed"));
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await postsAPI.publish(id);
      toast.success(t("success.published"));
      fetchPosts();
    } catch {
      toast.error(t("error.publishFailed"));
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await postsAPI.unpublish(id);
      toast.success(t("success.unpublished"));
      fetchPosts();
    } catch {
      toast.error(t("error.unpublishFailed"));
    }
  };

  const handleSchedule = (id: string) => {
    setScheduleDialog({ open: true, id });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setScheduleDate(tomorrow.toISOString().slice(0, 16));
  };

  const confirmSchedule = async () => {
    if (!scheduleDate) return;
    try {
      await postsAPI.schedulePublish(scheduleDialog.id, scheduleDate);
      toast.success(t("success.scheduled"));
      setScheduleDialog({ open: false, id: "" });
      fetchPosts();
    } catch {
      toast.error(t("error.scheduleFailed"));
    }
  };

  const handleBatchDelete = async (ids: (string | number)[]) => {
    if (confirm(`${ids.length} ${t("confirm.deletePosts")}`)) {
      try {
        await postsAPI.batchDelete(ids);
        toast.success(`${ids.length} ${t("success.deleted")}`);
        fetchPosts();
      } catch {
        toast.error(t("error.deleteFailed"));
      }
    }
  };

  const handleBatchPublish = async (ids: (string | number)[]) => {
    try {
      await postsAPI.batchPublish(ids);
      toast.success(`${ids.length} ${t("success.published")}`);
      fetchPosts();
    } catch {
      toast.error(t("error.publishFailed"));
    }
  };

  const handleBatchUnpublish = async (ids: (string | number)[]) => {
    try {
      await postsAPI.batchUnpublish(ids);
      toast.success(`${ids.length} ${t("success.unpublished")}`);
      fetchPosts();
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
          <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("posts.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("posts.desc")}</p>
        </div>
        <Link href="/posts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />{t("posts.new")}
          </Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={posts}
        searchColumn="title"
        searchPlaceholder={t("posts.search")}
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
