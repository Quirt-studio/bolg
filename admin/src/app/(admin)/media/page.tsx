"use client";

import { useEffect, useState, useRef } from "react";
import { Upload, Trash2, Search, Image as ImageIcon, FileText, Film, Music, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mediaAPI, type MediaAsset } from "@/lib/api/media";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function getIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.startsWith("video/")) return Film;
  if (mimeType.startsWith("audio/")) return Music;
  if (mimeType.includes("zip") || mimeType.includes("rar")) return Archive;
  return FileText;
}

export default function MediaPage() {
  const { t } = useI18n();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAssets = async () => {
    try {
      const params: Record<string, string> = { per_page: "20", page: String(page) };
      if (search) params.q = search;
      if (typeFilter === "image") params.mime_type = "image/";
      if (typeFilter === "video") params.mime_type = "video/";
      const res = await mediaAPI.list(params);
      if (res.code === 0 && res.data) {
        setAssets(res.data.items);
        setTotalPages(res.data.meta?.total_pages || 1);
        setTotalItems(res.data.meta?.total_items || 0);
      }
    } catch {
      toast.error(t("error.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [search, typeFilter, page]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await mediaAPI.upload(file);
      }
      toast.success(t("media.uploaded"));
      fetchAssets();
    } catch {
      toast.error(t("error.uploadFailed"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("media.deleteConfirm"))) return;
    try {
      await mediaAPI.delete(id);
      toast.success(t("media.deleted"));
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error(t("error.deleteFailed"));
    }
  };

  if (loading) return <div className="text-muted-foreground">{t("common.loading")}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">{t("media.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("media.desc")}</p>
        </div>
        <div>
          <input ref={fileInputRef} type="file" multiple onChange={handleUpload} className="hidden" id="media-upload" />
          <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? t("common.uploading") : t("media.upload")}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={t("media.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">{t("media.allTypes")}</option>
          <option value="image">{t("media.images")}</option>
          <option value="video">{t("common.video")}</option>
        </select>
      </div>

      <div className="text-sm text-muted-foreground">
        {totalItems} {totalItems === 1 ? t("common.file") : t("common.files")}
      </div>

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
          <p>{t("media.noFiles")}</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {assets.map((asset) => {
            const Icon = getIcon(asset.mime_type);
            const isImage = asset.mime_type.startsWith("image/");
            return (
              <Card key={asset.id} className="group overflow-hidden">
                <div className="relative aspect-square bg-muted flex items-center justify-center">
                  {isImage ? (
                    <img
                      src={`http://localhost:8080${asset.url}`}
                      alt={asset.alt_text || asset.original_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : asset.mime_type.startsWith("video/") ? (
                    <video
                      src={`http://localhost:8080${asset.url}`}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <Icon className="h-10 w-10 text-muted-foreground" />
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="destructive" size="icon-sm" onClick={() => handleDelete(asset.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-xs font-medium truncate" title={asset.original_name}>{asset.original_name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <Badge variant="outline" className="text-[10px] px-1 py-0">{formatFileSize(asset.file_size)}</Badge>
                    <span className="text-[10px] text-muted-foreground">{asset.folder}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t("common.previous")}
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            {t("common.next")}
          </Button>
        </div>
      )}
    </div>
  );
}
