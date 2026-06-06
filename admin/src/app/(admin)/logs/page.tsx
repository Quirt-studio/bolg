"use client";

import { useEffect, useState } from "react";
import { logsAPI, ActivityLog } from "@/lib/api/logs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ScrollText, LogIn, LogOut, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

const ACTION_FILTERS = [
  { value: "" },
  { value: "login" },
  { value: "login_failed" },
  { value: "logout" },
  { value: "create" },
  { value: "update" },
  { value: "delete" },
];

export default function LogsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const ACTION_FILTER_LABELS: Record<string, string> = {
    "": t("common.all"),
    login: t("logs.login"),
    login_failed: t("logs.loginFailed"),
    logout: t("logs.logout"),
    create: t("logs.create"),
    update: t("logs.update"),
    delete: t("common.delete"),
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, per_page: 20 };
        if (actionFilter) params.action = actionFilter;
        const res = await logsAPI.list(params);
        if (res.code === 0 && res.data) {
          setLogs(res.data.items || []);
          setTotalPages(res.data.meta?.total_pages || 1);
          setTotalItems(res.data.meta?.total_items || 0);
        }
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [actionFilter, page]);

  const getActionIcon = (action: string) => {
    if (action.includes("login_failed")) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (action.includes("login")) return <LogIn className="h-4 w-4 text-green-500" />;
    if (action.includes("logout")) return <LogOut className="h-4 w-4 text-muted-foreground" />;
    return <ScrollText className="h-4 w-4 text-muted-foreground" />;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> {t("common.back")}
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ScrollText className="h-8 w-8" /> {t("logs.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {totalItems} {t("logs.desc")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ACTION_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={actionFilter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => { setActionFilter(f.value); setPage(1); }}
          >
            {ACTION_FILTER_LABELS[f.value]}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="text-muted-foreground p-6">{t("common.loading")}</p>
          ) : logs.length === 0 ? (
            <p className="text-muted-foreground p-6 text-center">{t("logs.noLogs")}</p>
          ) : (
            <div className="divide-y">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4">
                  <div className="mt-0.5">{getActionIcon(log.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{log.action}</Badge>
                      {log.entity_type && (
                        <span className="text-xs text-muted-foreground">
                          {log.entity_type}{log.entity_name ? `: ${log.entity_name}` : ""}
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-1">{log.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {log.user && <span>{t("common.user")}: {log.user.display_name || log.user.username}</span>}
                      {log.ip_address && <span>IP: {log.ip_address}</span>}
                      <span>{formatTime(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t("common.previous")}
          </Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            {t("common.next")}
          </Button>
        </div>
      )}
    </div>
  );
}
