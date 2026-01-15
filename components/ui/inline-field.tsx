"use client";

import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface InlineFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  id?: string;
  autoComplete?: string;
  suffix?: string;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export function InlineField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  id,
  autoComplete,
  suffix,
  isVisible = true,
  onToggleVisibility,
}: InlineFieldProps) {
  return (
    <div
      className={cn(
        "group relative flex h-[54px] items-center justify-between border-b border-black/10 transition-colors",
        "focus-within:border-blue-600",
        "[&:hover:not(:focus-within)]:border-black/20",
        !isVisible && "opacity-40",
        className,
      )}
    >
      {/* Visibility toggle */}
      {onToggleVisibility && (
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute -left-10 flex h-8 w-8 items-center justify-center rounded opacity-0 transition-all hover:bg-accent group-hover:opacity-100"
          title={isVisible ? "Hide in invoice" : "Show in invoice"}
        >
          <HugeiconsIcon
            icon={isVisible ? ViewIcon : ViewOffSlashIcon}
            size={16}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
        </button>
      )}

      <label className="flex h-full flex-1 items-center">
        <span className="mr-3 shrink-0 whitespace-nowrap text-sm font-medium">
          {label}
        </span>
        <div className="flex h-full flex-1 items-center">
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-full w-full bg-transparent text-right text-sm caret-blue-600 outline-none placeholder:text-black/30"
            autoComplete={autoComplete}
          />
          {suffix && (
            <span className="ml-1 select-none text-sm text-black/40">
              {suffix}
            </span>
          )}
        </div>
      </label>
    </div>
  );
}

interface InlineTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  rows?: number;
}

export function InlineTextarea({
  label,
  value,
  onChange,
  placeholder,
  className,
  id,
  rows = 3,
}: InlineTextareaProps) {
  return (
    <label
      className={cn(
        "group flex min-h-[54px] items-start justify-between border-b border-black/10 py-3 transition-colors",
        "focus-within:border-blue-600",
        "[&:hover:not(:focus-within)]:border-black/20",
        className,
      )}
    >
      <span className="mr-3 shrink-0 whitespace-nowrap pt-0.5 text-sm font-medium">
        {label}
      </span>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="h-full w-full resize-none bg-transparent text-right text-sm caret-blue-600 outline-none placeholder:text-black/30"
      />
    </label>
  );
}

// Label-above variants (for notes, payment details, etc.)
interface LabelAboveTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function LabelAboveTextarea({
  label,
  value,
  onChange,
  placeholder,
  className,
  id,
}: LabelAboveTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  // biome-ignore lint/correctness/useExhaustiveDependencies: need to resize when value/placeholder changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, placeholder]);

  return (
    <div className={cn("", className)}>
      <p className="block pb-2 text-sm font-medium text-black/60">{label}</p>
      <label
        className={cn(
          "group flex border-b border-black/10 pb-2 transition-colors",
          "focus-within:border-blue-600",
          "[&:hover:not(:focus-within)]:border-black/20",
        )}
      >
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none bg-transparent text-sm caret-blue-600 outline-none placeholder:text-black/30 whitespace-pre-wrap"
        />
      </label>
    </div>
  );
}
