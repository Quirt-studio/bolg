"use client";

import { useState } from "react";
import * as Icons from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

const COMMON_ICONS = [
  "Rocket", "Code2", "Terminal", "FileText", "Feather",
  "Sparkles", "Palette", "Heart", "Wine", "BookOpen",
  "Pen", "Camera", "Music", "Film", "Mic",
  "Coffee", "Compass", "Globe", "Star", "Zap",
  "Cpu", "Database", "Server", "Cloud", "Layers",
  "Shield", "Hammer", "Search", "Target", "Award",
  "TrendingUp", "BarChart3", "PieChart", "Activity", "GitBranch",
  "Mail", "MessageCircle", "Phone", "MapPin", "Calendar",
];

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function IconPicker({ value, onChange, error }: IconPickerProps) {
  const { t } = useI18n();
  const [search, setSearch] = useState("");

  const filteredIcons = COMMON_ICONS.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SelectedIcon = (Icons as any)[value] as React.ComponentType<{ className?: string }> | undefined;

  return (
    <div className="space-y-2">
      <Label>{t("works.form.icon")}</Label>
      <Popover>
        <PopoverTrigger>
          <div role="button" tabIndex={0}
            className="group/button inline-flex h-8 shrink-0 items-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 w-full justify-start gap-2 cursor-pointer">
            {SelectedIcon ? (
              <>
                <SelectedIcon className="h-4 w-4" />
                <span>{value}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{t("icon.select")}</span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <Input
            placeholder={t("icon.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 mb-2"
          />
          <ScrollArea className="h-48">
            <div className="grid grid-cols-5 gap-1">
              {filteredIcons.map((name) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const Icon = (Icons as any)[name] as React.ComponentType<{ className?: string }> | undefined;
                if (!Icon) return null;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => onChange(name)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted ${
                      value === name ? "bg-primary text-primary-foreground" : ""
                    }`}
                    title={name}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
