"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import type { LocalizedString } from "@/lib/validations";

// Simple mode: string[]
interface TagInputSimpleProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  localized?: false;
}

// Localized mode: LocalizedString[]
interface TagInputLocalizedProps {
  label: string;
  value: LocalizedString[];
  onChange: (value: LocalizedString[]) => void;
  localized: true;
}

type TagInputProps = TagInputSimpleProps | TagInputLocalizedProps;

export function TagInput(props: TagInputProps) {
  const { label, value, onChange, localized } = props;
  const [inputValue, setInputValue] = useState("");
  const [inputValueZh, setInputValueZh] = useState("");

  const handleAdd = () => {
    if (localized) {
      if (inputValue.trim() && inputValueZh.trim()) {
        (onChange as (value: LocalizedString[]) => void)([
          ...(value as LocalizedString[]),
          { en: inputValue.trim(), zh: inputValueZh.trim() },
        ]);
        setInputValue("");
        setInputValueZh("");
      }
    } else {
      if (inputValue.trim()) {
        (onChange as (value: string[]) => void)([
          ...(value as string[]),
          inputValue.trim(),
        ]);
        setInputValue("");
      }
    }
  };

  const handleRemove = (index: number) => {
    if (localized) {
      const newVal = [...(value as LocalizedString[])];
      newVal.splice(index, 1);
      (onChange as (value: LocalizedString[]) => void)(newVal);
    } else {
      const newVal = [...(value as string[])];
      newVal.splice(index, 1);
      (onChange as (value: string[]) => void)(newVal);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {localized
          ? (value as LocalizedString[]).map((tag, i) => (
              <Badge key={i} variant="secondary" className="gap-1 pr-1">
                {tag.en} / {tag.zh}
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          : (value as string[]).map((tag, i) => (
              <Badge key={i} variant="secondary" className="gap-1 pr-1">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={localized ? "Tag (EN)" : "Add tag..."}
          className="h-8"
        />
        {localized && (
          <Input
            value={inputValueZh}
            onChange={(e) => setInputValueZh(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="标签 (ZH)"
            className="h-8"
          />
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAdd}
          className="h-8"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
