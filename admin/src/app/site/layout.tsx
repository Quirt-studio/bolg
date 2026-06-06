"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, ReactNode } from "react";
import { Globe, Menu, X, Search } from "lucide-react";

type Lang = "en" | "zh";

const NAV_LABELS: Record<string, Record<Lang, string>> = {
  home: { en: "Home", zh: "首页" },
  works: { en: "Works", zh: "作品" },
  posts: { en: "Posts", zh: "文章" },
  about: { en: "About", zh: "关于" },
};

export default function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>("en");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("bolg-site-lang") as Lang;
    if (saved === "en" || saved === "zh") {
      setLang(saved);
    } else {
      // Detect browser language
      const browser = navigator.language.toLowerCase();
      if (browser.startsWith("zh")) setLang("zh");
    }
  }, []);

  const toggleLang = () => {
    const next = lang === "en" ? "zh" : "en";
    setLang(next);
    localStorage.setItem("bolg-site-lang", next);
    window.location.reload();
  };

  const navItems = [
    { href: "/site", label: NAV_LABELS.home[lang] },
    { href: "/site/works", label: NAV_LABELS.works[lang] },
    { href: "/site/posts", label: NAV_LABELS.posts[lang] },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/site" className="font-serif font-bold text-lg tracking-tight">
            Bol G
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors hover:text-foreground ${
                  pathname === item.href ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/site/search" className="text-muted-foreground hover:text-foreground transition-colors">
              <Search className="h-4 w-4" />
            </Link>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              {lang === "en" ? "中文" : "EN"}
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleLang} className="p-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden border-t px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`block py-2 text-sm ${
                  pathname === item.href ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Bol G. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
