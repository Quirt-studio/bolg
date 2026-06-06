"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, FolderOpen, GitBranch, User,
  Settings, Languages, ChevronDown, Image, Search, History, Database, ScrollText,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";

export function AppSidebar() {
  const pathname = usePathname();
  const { t, lang } = useI18n();
  const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith("/settings"));

  const mainNavItems = [
    { title: t("sidebar.works"), url: "/works", icon: FileText },
    { title: t("sidebar.posts"), url: "/posts", icon: FileText },
    { title: t("sidebar.categories"), url: "/categories", icon: FolderOpen },
    { title: t("sidebar.timeline"), url: "/timeline", icon: GitBranch },
    { title: t("sidebar.about"), url: "/about", icon: User },
    { title: t("sidebar.media"), url: "/media", icon: Image },
    { title: t("sidebar.search"), url: "/search", icon: Search },
    { title: t("sidebar.revisions"), url: "/revisions", icon: History },
    { title: t("sidebar.exportImport"), url: "/export", icon: Database },
    { title: t("sidebar.logs"), url: "/logs", icon: ScrollText },
  ];

  const settingsItems = [
    { title: t("sidebar.hero"), url: "/settings/hero" },
    { title: t("sidebar.navigation"), url: "/settings/navigation" },
    { title: t("sidebar.footer"), url: "/settings/footer" },
  ];

  return (
    <Sidebar variant="inset">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-serif font-semibold text-sm">
            B
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-semibold text-sm text-sidebar-foreground">{t("sidebar.brand")}</span>
            <span className="text-[10px] text-muted-foreground">{t("sidebar.brandSub")}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.content")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton render={<Link href={item.url} />} isActive={pathname === item.url} tooltip={item.title}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.config")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <Settings className="h-4 w-4" />
                    <span>{t("sidebar.settings")}</span>
                    <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {settingsItems.map((item) => (
                        <SidebarMenuSubItem key={item.url}>
                          <SidebarMenuSubButton render={<Link href={item.url} />} isActive={pathname === item.url}>
                            <span>{item.title}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/i18n" />} isActive={pathname === "/i18n"} tooltip={t("sidebar.translations")}>
                  <Languages className="h-4 w-4" />
                  <span>{t("sidebar.translations")}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">EN/ZH</Badge>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-4 py-2 text-[10px] text-muted-foreground">
          <p>Bol G Admin v1.0</p>
          <p>{lang === "zh" ? "数据存储在 localStorage" : "Data stored in localStorage"}</p>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
