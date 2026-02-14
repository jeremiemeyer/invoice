"use client";

import { DownloadSimple, FolderOpen, List } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { defaultInvoiceState } from "@/lib/invoice/defaults";
import {
  CURRENT_SCHEMA_VERSION,
  detectSchemaVersion,
  getMigrationSummary,
  migrate,
  needsMigration,
} from "@/lib/invoice/migrations";
import type { InvoiceFormState } from "@/lib/invoice/types";

interface FileMenuProps {
  state: InvoiceFormState;
  onLoadState: (state: InvoiceFormState) => void;
  isBlank: boolean;
}

export function FileMenu({ state, onLoadState, isBlank }: FileMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Migration dialog state
  const [migrationDialog, setMigrationDialog] = useState<{
    open: boolean;
    parsedData: unknown;
    fromVersion: number;
    summary: string[];
  }>({ open: false, parsedData: null, fromVersion: 0, summary: [] });

  const handleSave = () => {
    // Ensure schemaVersion is included when saving
    const dataToSave = {
      ...state,
      schemaVersion: state.schemaVersion ?? CURRENT_SCHEMA_VERSION,
    };
    const dataStr = JSON.stringify(dataToSave, null, 2);
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

  const loadParsedData = (parsed: unknown) => {
    // Check if migration is needed
    if (needsMigration(parsed)) {
      const detection = detectSchemaVersion(parsed);
      const summary = getMigrationSummary(parsed);
      setMigrationDialog({
        open: true,
        parsedData: parsed,
        fromVersion: detection.version,
        summary,
      });
      return;
    }

    // No migration needed - load directly
    finalizeLoad(parsed as InvoiceFormState);
  };

  const finalizeLoad = (data: InvoiceFormState | unknown) => {
    // Merge with defaults to fill in any missing fields
    const loadedState: InvoiceFormState = {
      ...defaultInvoiceState,
      ...(data as InvoiceFormState),
      // Ensure lineItems is always an array
      lineItems: Array.isArray((data as InvoiceFormState).lineItems)
        ? (data as InvoiceFormState).lineItems
        : defaultInvoiceState.lineItems,
    };

    onLoadState(loadedState);
  };

  const handleMigrationConfirm = () => {
    if (!migrationDialog.parsedData) return;

    try {
      const result = migrate(migrationDialog.parsedData);
      finalizeLoad(result.data);
    } catch (error) {
      console.error("Migration failed:", error);
      window.alert("Migration failed. Please contact support.");
    }

    setMigrationDialog({
      open: false,
      parsedData: null,
      fromVersion: 0,
      summary: [],
    });
  };

  const handleMigrationCancel = () => {
    setMigrationDialog({
      open: false,
      parsedData: null,
      fromVersion: 0,
      summary: [],
    });
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

      loadParsedData(parsed);
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
          <List size={18} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuItem onClick={handleOpenClick}>
            <FolderOpen size={16} />
            Open...
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSave}>
            <DownloadSimple size={16} />
            Save to...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Migration Dialog */}
      <AlertDialog
        open={migrationDialog.open}
        onOpenChange={(open) => !open && handleMigrationCancel()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update file format?</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Migration dialog for updating invoice file format
            </AlertDialogDescription>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                This file uses an older format (v{migrationDialog.fromVersion}).
                Would you like to update it to the current format (v
                {CURRENT_SCHEMA_VERSION})?
              </p>
              <div className="rounded-md bg-muted p-3 text-xs font-mono text-foreground">
                {migrationDialog.summary.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
              </div>
              <p className="text-xs">
                The original file won&apos;t be modified. You can save the
                updated version as a new file.
              </p>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleMigrationCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleMigrationConfirm}>
              Update & Open
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
