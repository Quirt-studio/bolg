"use client";

import { AuthGuard } from "@/components/auth-guard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex flex-1 flex-col">
          <AppHeader />
          <div className="flex-1 p-6">{children}</div>
        </main>
      </SidebarProvider>
    </AuthGuard>
  );
}
