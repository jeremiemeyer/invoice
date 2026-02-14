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
        "group/toggleable relative flex items-center gap-2",
        !isVisible && "opacity-40",
        className,
      )}
    >
      <button
        type="button"
        onClick={onToggleVisibility}
        aria-pressed={!isVisible}
        aria-label={isVisible ? "Hide in invoice" : "Show in invoice"}
        className="shrink-0 -ml-10 flex h-8 w-8 items-center justify-center rounded transition-all hover:bg-accent"
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
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
