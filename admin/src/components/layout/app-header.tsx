"use client";

import { useState, useEffect, Fragment } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Moon, Sun, Download, ExternalLink, RotateCcw, Languages, LogOut, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/store/auth-store";
import { settingsAPI } from "@/lib/api/settings";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";

function getBreadcrumbs(pathname: string, t: (key: string) => string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [
    { label: t("sidebar.dashboard"), href: "/" },
  ];
  const labelMap: Record<string, string> = {
    works: t("sidebar.works"), categories: t("sidebar.categories"), timeline: t("sidebar.timeline"),
    about: t("sidebar.about"), settings: t("sidebar.settings"), hero: t("sidebar.hero"),
    navigation: t("sidebar.navigation"), footer: t("sidebar.footer"), i18n: t("sidebar.translations"), new: t("common.new"),
  };
  let path = "";
  for (const segment of segments) {
    path += `/${segment}`;
    crumbs.push({ label: labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1), href: path });
  }
  return crumbs;
}

function IconBtn({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === "Enter" && onClick?.()} title={title}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer">
      {children}
    </div>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const { lang, setLang, t } = useI18n();
  const crumbs = getBreadcrumbs(pathname, t);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    if (saved) { setIsDark(saved === "dark"); }
    else { setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches); }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleExportJSON = async () => {
    try {
      const res = await settingsAPI.getAll();
      if (res.code === 0 && res.data) {
        const data = { ...res.data, exportedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = "bolg-content.json"; a.click();
        URL.revokeObjectURL(url);
        toast.success(t("common.exportDone"));
      }
    } catch {
      toast.error(t("header.exportFailed"));
    }
  };

  const handleReset = () => {
    toast.info("Reset not available with API backend");
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex-1">
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, i) =>
              i < crumbs.length - 1 ? (
                <Fragment key={crumb.href || i}>
                  <BreadcrumbItem>
                    <BreadcrumbLink render={<Link href={crumb.href!} />}>{crumb.label}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </Fragment>
              ) : (
                <BreadcrumbItem key={crumb.href || i}>
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                </BreadcrumbItem>
              )
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-1">
        {/* Language Toggle */}
        <div className="flex items-center rounded-md border border-input overflow-hidden mr-1">
          <button onClick={() => setLang("en")}
            className={`px-2 py-1 text-xs font-mono font-medium transition-colors ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            EN
          </button>
          <button onClick={() => setLang("zh")}
            className={`px-2 py-1 text-xs font-mono font-medium transition-colors ${lang === "zh" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            中文
          </button>
        </div>

        <IconBtn onClick={handleReset} title={t("header.reset")}>
          <RotateCcw className="h-4 w-4" />
        </IconBtn>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <IconBtn title={t("header.export")}>
              <Download className="h-4 w-4" />
            </IconBtn>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportJSON}>
              <Download className="mr-2 h-4 w-4" />
              {t("header.export")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <ExternalLink className="mr-2 h-4 w-4" />
              <Link href="/site" target="_blank">{t("header.preview")}</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <IconBtn onClick={toggleTheme} title={t("header.toggleTheme")}>
          {mounted && isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </IconBtn>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <IconBtn title={user?.username || t("header.user")}>
              <User className="h-4 w-4" />
            </IconBtn>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              {user?.display_name || user?.username || t("header.admin")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {t("header.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
