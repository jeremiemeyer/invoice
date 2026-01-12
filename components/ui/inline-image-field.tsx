"use client";

import {
  Add01Icon,
  Cancel01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

interface InlineImageFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  maxSize?: number;
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

async function resizeImage(
  file: File,
  maxDimension: number = 200,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = reject;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Calculate new dimensions maintaining aspect ratio
      if (width > height) {
        if (width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Use PNG for transparency support, JPEG for photos
      const isPng = file.type === "image/png" || file.type === "image/svg+xml";
      const mimeType = isPng ? "image/png" : "image/jpeg";
      const quality = isPng ? 1 : 0.85;

      resolve(canvas.toDataURL(mimeType, quality));
    };

    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function InlineImageField({
  label,
  value,
  onChange,
  className,
  maxSize = 200,
  isVisible = true,
  onToggleVisibility,
}: InlineImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const resized = await resizeImage(file, maxSize);
      onChange(resized);
    } catch (error) {
      console.error("Failed to process image:", error);
    }

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div
      className={cn(
        "group relative flex h-[54px] items-center justify-between border-b border-black/10 transition-colors",
        "hover:border-black/20",
        !isVisible && "opacity-40",
        className,
      )}
    >
      {/* Visibility toggle - controls whether logo/avatar area shows in invoice */}
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

      <span className="mr-3 shrink-0 whitespace-nowrap text-sm font-medium">
        {label}
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="relative">
          <button
            type="button"
            onClick={handleClick}
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border border-black/10 transition-all hover:border-black/20"
          >
            {/* biome-ignore lint: Using native img for data URLs */}
            <img src={value} alt="" className="h-full w-full object-cover" />
          </button>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-black/50 opacity-0 shadow-sm ring-1 ring-black/10 backdrop-blur-sm transition-all hover:bg-white hover:text-black/70 hover:ring-black/15 group-hover:opacity-100"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={12} strokeWidth={2.5} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-dashed border-black/20 text-black/40 transition-colors hover:border-black/40 hover:text-black/60"
        >
          <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
