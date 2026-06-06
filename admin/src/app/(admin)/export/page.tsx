"use client";

import { useState, useEffect, useRef } from "react";
import { exportAPI, ExportPreview, ImportResult } from "@/lib/api/export";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Upload, Database, ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function ExportPage() {
  const router = useRouter();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<ExportPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const res = await exportAPI.preview();
        setPreview(res.data || null);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    loadPreview();
  }, []);

  const handleDownload = async () => {
    try {
      await exportAPI.download();
    } catch {
      setError(t("error.exportFailed"));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setError("");
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setError("");
    try {
      const res = await exportAPI.import(importFile);
      setImportResult(res.data || null);
      setImportFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("error.importFailed"));
    } finally {
      setImporting(false);
    }
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
            <Database className="h-8 w-8" />
            {t("export.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("export.desc")}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Export Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              {t("export.exportCard")}
            </CardTitle>
            <CardDescription>
              {t("export.exportDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground">{t("export.loadingPreview")}</p>
            ) : preview ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{preview.works}</p>
                  <p className="text-sm text-muted-foreground">{t("search.works")}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{preview.posts}</p>
                  <p className="text-sm text-muted-foreground">{t("sidebar.posts")}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{preview.categories}</p>
                  <p className="text-sm text-muted-foreground">{t("sidebar.categories")}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{preview.tags}</p>
                  <p className="text-sm text-muted-foreground">{t("categories.form.tags")}</p>
                </div>
              </div>
            ) : null}
            <Button onClick={handleDownload} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              {t("export.downloadBtn")}
            </Button>
          </CardContent>
        </Card>

        {/* Import Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {t("export.importCard")}
            </CardTitle>
            <CardDescription>
              {t("export.importDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border file:text-sm
                file:bg-background file:hover:bg-muted file:cursor-pointer"
            />
            {importFile && (
              <p className="text-sm text-muted-foreground">
                {t("common.selectedLabel")}<strong>{importFile.name}</strong> ({(importFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              onClick={handleImport}
              disabled={!importFile || importing}
              className="w-full"
            >
              {importing ? t("common.importing") : t("export.importBtn")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Import Result Dialog */}
      <Dialog open={!!importResult} onOpenChange={() => setImportResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              {t("export.importSuccess")}
            </DialogTitle>
            <DialogDescription>{t("export.importSuccessDesc")}</DialogDescription>
          </DialogHeader>
          {importResult && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{importResult.counts.categories}</p>
                <p className="text-sm text-muted-foreground">{t("sidebar.categories")}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{importResult.counts.tags}</p>
                <p className="text-sm text-muted-foreground">{t("categories.form.tags")}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{importResult.counts.works}</p>
                <p className="text-sm text-muted-foreground">{t("search.works")}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{importResult.counts.posts}</p>
                <p className="text-sm text-muted-foreground">{t("sidebar.posts")}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setImportResult(null)}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
