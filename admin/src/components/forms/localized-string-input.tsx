"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";

interface LocalizedStringInputProps {
  label: string;
  valueEn: string;
  valueZh: string;
  onChangeEn: (value: string) => void;
  onChangeZh: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  error?: string;
}

export function LocalizedStringInput({
  label,
  valueEn,
  valueZh,
  onChangeEn,
  onChangeZh,
  multiline = false,
  placeholder,
  error,
}: LocalizedStringInputProps) {
  const { t } = useI18n();
  const InputComponent = multiline ? Textarea : Input;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Tabs defaultValue="en" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="en">{t("common.english")}</TabsTrigger>
          <TabsTrigger value="zh">中文</TabsTrigger>
        </TabsList>
        <TabsContent value="en" className="mt-2">
          <InputComponent
            value={valueEn}
            onChange={(e) => onChangeEn(e.target.value)}
            placeholder={placeholder || `${label} (EN)`}
            className={error ? "border-destructive" : ""}
          />
        </TabsContent>
        <TabsContent value="zh" className="mt-2">
          <InputComponent
            value={valueZh}
            onChange={(e) => onChangeZh(e.target.value)}
            placeholder={placeholder || `${label} (ZH)`}
            className={error ? "border-destructive" : ""}
          />
        </TabsContent>
      </Tabs>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
