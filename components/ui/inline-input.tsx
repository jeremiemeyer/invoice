"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface InlineInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  id?: string;
  autoComplete?: string;
  suffix?: string;
  required?: boolean;
  invalid?: boolean;
}

export function InlineInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className,
  id,
  autoComplete,
  suffix,
  required,
  invalid,
}: InlineInputProps) {
  return (
    <div
      className={cn(
        "relative flex h-[54px] items-center justify-between border-b border-black/10 transition-colors",
        "focus-within:border-blue-600",
        "[&:hover:not(:focus-within)]:border-black/20",
        className,
      )}
    >
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
            className="h-full w-full bg-transparent text-right text-base md:text-sm caret-blue-600 outline-none placeholder:text-black/30"
            autoComplete={autoComplete}
            aria-required={required}
            aria-invalid={invalid}
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
  required?: boolean;
  invalid?: boolean;
}

export function InlineTextarea({
  label,
  value,
  onChange,
  placeholder,
  className,
  id,
  required,
  invalid,
}: InlineTextareaProps) {
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
      <p className="block pb-2 text-sm font-medium">{label}</p>
      <label
        className={cn(
          "flex border-b border-black/10 pb-2 transition-colors",
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
          className="w-full resize-none bg-transparent text-base md:text-sm caret-blue-600 outline-none placeholder:text-black/30 whitespace-pre-wrap"
          aria-required={required}
          aria-invalid={invalid}
        />
      </label>
    </div>
  );
}
