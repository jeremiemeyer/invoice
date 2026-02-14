"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToggleableFieldProps {
  isVisible: boolean;
  onToggleVisibility: () => void;
  children: ReactNode;
  className?: string;
}

export function ToggleableField({
  isVisible,
  onToggleVisibility,
  children,
  className,
}: ToggleableFieldProps) {
  return (
    <div
      className={cn(
        "group/toggleable relative",
        !isVisible && "opacity-40",
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggleVisibility}
        aria-pressed={!isVisible}
        aria-label={isVisible ? "Hide in invoice" : "Show in invoice"}
        className="absolute -left-10 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded opacity-0 transition-all hover:bg-accent group-hover/toggleable:opacity-100"
      >
        {isVisible ? (
          <Eye size={16} weight="light" className="text-muted-foreground" />
        ) : (
          <EyeSlash
            size={16}
            weight="light"
            className="text-muted-foreground"
          />
        )}
      </button>
      {children}
    </div>
  );
}
