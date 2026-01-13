"use client";

import {
  Download04Icon,
  FolderOpenIcon,
  Menu01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { defaultInvoiceState } from "@/lib/invoice/defaults";
import type { InvoiceFormState } from "@/lib/invoice/types";

interface FileMenuProps {
  state: InvoiceFormState;
  onLoadState: (state: InvoiceFormState) => void;
  isBlank: boolean;
}

export function FileMenu({ state, onLoadState, isBlank }: FileMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    // Generate filename from document type and invoice number
    const prefix = state.documentType === "invoice" ? "invoice" : "quote";
    const number = state.invoiceNumber || "draft";
    link.download = `${prefix}-${number}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOpenClick = () => {
    // If current state is not blank, warn the user
    if (!isBlank) {
      const confirmed = window.confirm(
        "Opening a file will replace your current document. Any unsaved changes will be lost. Continue?",
      );
      if (!confirmed) return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      // Check if it looks like an invoice file (has at least some expected fields)
      const hasInvoiceFields =
        "lineItems" in parsed ||
        "documentType" in parsed ||
        "invoiceNumber" in parsed ||
        "fromName" in parsed ||
        "customerName" in parsed;

      if (!hasInvoiceFields || typeof parsed !== "object" || parsed === null) {
        throw new Error("Invalid invoice file format");
      }

      // Merge with defaults to fill in any missing fields
      const loadedState: InvoiceFormState = {
        ...defaultInvoiceState,
        ...parsed,
        // Ensure lineItems is always an array
        lineItems: Array.isArray(parsed.lineItems)
          ? parsed.lineItems
          : defaultInvoiceState.lineItems,
      };

      onLoadState(loadedState);
    } catch (error) {
      console.error("Error loading file:", error);
      window.alert(
        "Failed to load the file. Please make sure it's a valid invoice file.",
      );
    }

    // Reset input so the same file can be selected again
    event.target.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="sr-only"
        tabIndex={-1}
      />

      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex items-center justify-center size-8 rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          aria-label="File menu"
        >
          <HugeiconsIcon icon={Menu01Icon} size={18} strokeWidth={2} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={handleOpenClick}>
            <HugeiconsIcon icon={FolderOpenIcon} size={16} strokeWidth={2} />
            Open...
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSave}>
            <HugeiconsIcon icon={Download04Icon} size={16} strokeWidth={2} />
            Save to...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
