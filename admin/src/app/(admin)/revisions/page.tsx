"use client";

import { useState, useEffect, useCallback } from "react";
import { revisionsAPI, ContentRevision } from "@/lib/api/revisions";
import { worksAPI } from "@/lib/api/works";
import { postsAPI } from "@/lib/api/posts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { History, RotateCcw, Eye, ArrowLeft, GitCompareArrows, Minus, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

interface WorkItem {
  id: number;
  slug: string;
  translations?: Record<string, { title: string }>;
}

interface PostItem {
  id: number;
  slug: string;
  translations?: Record<string, { title: string }>;
}

export default function RevisionsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [entityType, setEntityType] = useState<string>("work");
  const [entityId, setEntityId] = useState<number | null>(null);
  const [entities, setEntities] = useState<(WorkItem | PostItem)[]>([]);
  const [revisions, setRevisions] = useState<ContentRevision[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewRevision, setPreviewRevision] = useState<ContentRevision | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<ContentRevision | null>(null);
  const [rollingBack, setRollingBack] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showDiff, setShowDiff] = useState(false);

  // Load entities list
  useEffect(() => {
    const loadEntities = async () => {
      try {
        if (entityType === "work") {
          const res = await worksAPI.list({ per_page: 100 });
          setEntities(res.data?.items || []);
        } else {
          const res = await postsAPI.list({ per_page: 100 });
          setEntities(res.data?.items || []);
        }
      } catch {
        setEntities([]);
      }
    };
    loadEntities();
    setEntityId(null);
    setRevisions([]);
  }, [entityType]);

  // Load revisions when entity selected
  const loadRevisions = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const res = await revisionsAPI.list(entityType, entityId, 1, 50);
      setRevisions(res.data?.items || []);
    } catch {
      setRevisions([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    loadRevisions();
  }, [loadRevisions]);

  const handleRollback = async () => {
    if (!rollbackTarget) return;
    setRollingBack(true);
    try {
      await revisionsAPI.rollback(rollbackTarget.id, rollbackTarget.entity_type);
      setRollbackTarget(null);
      loadRevisions();
    } catch (err) {
      console.error("Rollback failed:", err);
    } finally {
      setRollingBack(false);
    }
  };

  const toggleCompareSelect = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const getDiff = (): Array<{ key: string; oldVal: string; newVal: string; changed: boolean }> => {
    if (selectedIds.length !== 2) return [];
    const oldRev = revisions.find((r) => r.id === selectedIds[0]);
    const newRev = revisions.find((r) => r.id === selectedIds[1]);
    if (!oldRev?.snapshot || !newRev?.snapshot) return [];

    const oldSnap = oldRev.snapshot as Record<string, unknown>;
    const newSnap = newRev.snapshot as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(oldSnap), ...Object.keys(newSnap)]);

    return Array.from(allKeys).map((key) => {
      const ov = JSON.stringify(oldSnap[key] ?? "");
      const nv = JSON.stringify(newSnap[key] ?? "");
      return { key, oldVal: ov, newVal: nv, changed: ov !== nv };
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t("common.back")}
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8" />
            {t("revisions.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("revisions.desc")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("revisions.selectContent")}</CardTitle>
          <CardDescription>{t("revisions.selectContentDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select value={entityType} onValueChange={(v) => { if (v) setEntityType(v); setEntityId(null); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("common.type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="work">{t("search.works")}</SelectItem>
              <SelectItem value="post">{t("search.posts")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={entityId?.toString() || ""}
            onValueChange={(v) => setEntityId(Number(v))}
          >
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder={t("revisions.selectItem")} />
            </SelectTrigger>
            <SelectContent>
              {entities.map((e) => {
                const title = e.translations?.en?.title || e.slug;
                return (
                  <SelectItem key={e.id} value={e.id.toString()}>
                    {title}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {entityId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t("revisions.revisions")} ({revisions.length})</CardTitle>
              {revisions.length >= 2 && (
                <Button
                  variant={compareMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setCompareMode(!compareMode); setSelectedIds([]); setShowDiff(false); }}
                >
                  <GitCompareArrows className="h-4 w-4 mr-1" />
                  {compareMode ? t("common.cancel") : t("common.compare")}
                </Button>
              )}
            </div>
            {compareMode && (
              <CardDescription>
                {t("revisions.selectTwo")} {selectedIds.length}/2 {t("revisions.selected")}
                {selectedIds.length === 2 && (
                  <Button variant="link" size="sm" className="ml-2 p-0 h-auto" onClick={() => setShowDiff(true)}>
                    {t("common.showDiff")}
                  </Button>
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">{t("common.loading")}</p>
            ) : revisions.length === 0 ? (
              <p className="text-muted-foreground">{t("revisions.noRevisions")}</p>
            ) : (
              <div className="space-y-3">
                {revisions.map((rev) => (
                  <div
                    key={rev.id}
                    className={`flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 ${
                      compareMode && selectedIds.includes(rev.id) ? "border-brand bg-brand/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {compareMode && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(rev.id)}
                          onChange={() => toggleCompareSelect(rev.id)}
                          className="h-4 w-4 rounded"
                        />
                      )}
                      <Badge variant="outline">v{rev.revision_number}</Badge>
                      <div>
                        <p className="font-medium">{rev.change_summary || t("revisions.noSummary")}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(rev.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewRevision(rev)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t("common.view")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRollbackTarget(rev)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        {t("common.restore")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewRevision} onOpenChange={() => setPreviewRevision(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {t("revisions.revisionNum")}#{previewRevision?.revision_number} — {previewRevision?.change_summary}
            </DialogTitle>
            <DialogDescription>
              {previewRevision && new Date(previewRevision.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-[50vh]">
            {JSON.stringify(previewRevision?.snapshot, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>

      {/* Rollback Confirmation Dialog */}
      <Dialog open={!!rollbackTarget} onOpenChange={() => setRollbackTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirm.restoreVersion")}</DialogTitle>
            <DialogDescription>
              {t("confirm.restoreDesc")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRollbackTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleRollback} disabled={rollingBack}>
              {rollingBack ? t("common.restoring") : t("common.restore")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diff Dialog */}
      <Dialog open={showDiff} onOpenChange={() => setShowDiff(false)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompareArrows className="h-5 w-5" />
              {t("revisions.versionComparison")}
            </DialogTitle>
            <DialogDescription>
              v{revisions.find((r) => r.id === selectedIds[0])?.revision_number} → v{revisions.find((r) => r.id === selectedIds[1])?.revision_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {getDiff().map((d) => (
              <div key={d.key} className={`rounded-lg border p-3 ${d.changed ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono font-medium">{d.key}</span>
                  {d.changed && <RefreshCw className="h-3 w-3 text-amber-500" />}
                </div>
                {d.changed && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-red-50 dark:bg-red-950/30 rounded p-2 overflow-auto">
                      <div className="flex items-center gap-1 text-red-500 mb-1"><Minus className="h-3 w-3" /> {t("common.old")}</div>
                      <pre className="whitespace-pre-wrap break-all">{d.oldVal}</pre>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/30 rounded p-2 overflow-auto">
                      <div className="flex items-center gap-1 text-green-500 mb-1"><Plus className="h-3 w-3" /> {t("common.new")}</div>
                      <pre className="whitespace-pre-wrap break-all">{d.newVal}</pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
