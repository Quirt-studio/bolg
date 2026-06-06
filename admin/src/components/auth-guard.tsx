"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, setAuth, setLoading } = useAuthStore();
  const [ready, setReady] = useState(false);

  // Login page doesn't need auth
  if (pathname === "/login") {
    return <>{children}</>;
  }

  useEffect(() => {
    // Check if we have tokens in localStorage
    const token = localStorage.getItem("bolg_access_token");
    const userStr = localStorage.getItem("bolg_user");
    const refreshStr = localStorage.getItem("bolg_refresh_token");

    if (token && userStr && refreshStr) {
      // Sync auth store from localStorage
      if (!isAuthenticated) {
        const user = JSON.parse(userStr);
        setAuth(user, token, refreshStr);
      }
      setReady(true);
    } else {
      // No tokens — redirect to login
      setLoading(false);
      router.push("/login");
    }
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
