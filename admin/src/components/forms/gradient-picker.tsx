"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

const PRESETS = [
  "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
  "linear-gradient(135deg, #2D1B69 0%, #11998E 100%)",
  "linear-gradient(135deg, #434343 0%, #000000 100%)",
  "linear-gradient(135deg, #4A2C2A 0%, #8B6F4E 100%)",
  "linear-gradient(135deg, #1B2838 0%, #2A4858 100%)",
  "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)",
  "linear-gradient(135deg, #232526 0%, #414345 100%)",
  "linear-gradient(135deg, #3E5151 0%, #DECBA4 100%)",
];

interface GradientPickerProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function GradientPicker({ value, onChange, error }: GradientPickerProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-2">
      <Label>{t("works.form.gradient")}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {PRESETS.map((gradient) => (
          <button
            key={gradient}
            type="button"
            onClick={() => onChange(gradient)}
            className={cn(
              "h-8 w-12 rounded-md border-2 transition-all",
              value === gradient
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent hover:border-muted-foreground/30"
            )}
            style={{ background: gradient }}
          />
        ))}
      </div>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("gradient.placeholder")}
        className={cn("font-mono text-xs", error && "border-destructive")}
      />
      {value && (
        <div
          className="h-16 rounded-lg border"
          style={{ background: value }}
        />
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
