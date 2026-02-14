"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DotsSixVertical, Trash } from "@phosphor-icons/react";
import type { SerializedEditorState } from "lexical";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  hasMultipleLines,
  isLexicalEmpty,
  lexicalToFirstLine,
  parseLexicalState,
} from "@/lib/invoice/lexical-to-html";
import type { LineItem } from "@/lib/invoice/types";
import { cn } from "@/lib/utils";
import { createEmptyEditorState, LineItemEditor } from "./line-item-editor";

interface LineItemRowProps {
  item: LineItem;
  onRemove: () => void;
  onUpdate: (field: keyof LineItem, value: unknown) => void;
  canRemove: boolean;
  reorderMode: boolean;
  autoOpen?: boolean;
  onPopoverOpenChange?: (isOpen: boolean) => void;
}

export function LineItemRow({
  item,
  onRemove,
  onUpdate,
  canRemove,
  reorderMode,
  autoOpen = false,
  onPopoverOpenChange,
}: LineItemRowProps) {
  // Sortable
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Inline delete state
  const [confirming, setConfirming] = useState(false);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDeleteClick = () => {
    if (!canRemove) return;
    if (confirming) {
      onRemove();
      setConfirming(false);
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    } else {
      setConfirming(true);
      confirmTimerRef.current = setTimeout(() => setConfirming(false), 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (confirmTimerRef.current) clearTimeout(confirmTimerRef.current);
    };
  }, []);

  // Name popover state - initialize with autoOpen
  const [namePopoverOpen, setNamePopoverOpen] = useState(autoOpen);

  // Detect Mac vs Windows for keyboard shortcut display
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  // Parse the stored name (JSON string) to Lexical state
  const currentState = useMemo(() => {
    if (!item.name) return null;
    return parseLexicalState(item.name);
  }, [item.name]);

  // Always keep editingState initialized - prevents flash when opening popover
  const [editingState, setEditingState] = useState<SerializedEditorState>(
    () => currentState || createEmptyEditorState(),
  );

  // Sync editingState when currentState changes and popover is closed
  useEffect(() => {
    if (!namePopoverOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditingState(currentState || createEmptyEditorState());
    }
  }, [currentState, namePopoverOpen]);

  // Get display text (first line)
  const displayText = useMemo(() => {
    return lexicalToFirstLine(currentState);
  }, [currentState]);

  const isEmpty = isLexicalEmpty(currentState);
  const isMultiLine = hasMultipleLines(currentState);

  // Auto-open when autoOpen prop becomes true
  useEffect(() => {
    if (autoOpen && !namePopoverOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNamePopoverOpen(true);
    }
  }, [autoOpen, namePopoverOpen]);

  // Handle popover open/close
  const handlePopoverChange = (open: boolean) => {
    if (open) {
      // Re-sync with current state when opening (in case it changed while closed)
      setEditingState(currentState || createEmptyEditorState());
    } else {
      // Save on close
      const newValue = JSON.stringify(editingState);
      if (newValue !== item.name) {
        onUpdate("name", newValue);
      }
    }
    setNamePopoverOpen(open);
    onPopoverOpenChange?.(open);
  };

  // Save handler
  const handleSave = () => {
    const newValue = JSON.stringify(editingState);
    onUpdate("name", newValue);
    setNamePopoverOpen(false);
  };

  // Cancel handler - revert to original state
  const handleCancel = () => {
    setEditingState(currentState || createEmptyEditorState());
    setNamePopoverOpen(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex w-full items-center gap-2",
        isDragging && "z-10 rounded-md bg-background shadow-md",
      )}
    >
      {/* Drag handle */}
      {reorderMode && (
        <div className="-ml-10 shrink-0">
          <button
            type="button"
            className="flex h-8 w-8 cursor-grab items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent/80 active:cursor-grabbing touch-none"
            {...attributes}
            {...listeners}
          >
            <DotsSixVertical className="size-4" />
          </button>
        </div>
      )}

      {/* Row content */}
      <div
        className={cn(
          "flex w-full items-center",
          reorderMode && !isDragging && "animate-pulse-subtle",
        )}
      >
        {/* Name cell with Popover - click to edit */}
        <Popover open={namePopoverOpen} onOpenChange={handlePopoverChange}>
          <PopoverTrigger
            className={cn(
              "flex h-12 min-w-0 flex-1 cursor-pointer items-center overflow-hidden border-b pr-3 text-left transition-colors",
              namePopoverOpen
                ? "border-blue-600"
                : "border-black/10 hover:border-black/20",
            )}
          >
            {!isEmpty ? (
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="truncate text-sm">{displayText}</span>
                {isMultiLine && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    …
                  </span>
                )}
              </span>
            ) : (
              <span className="truncate text-sm text-muted-foreground">
                Item description
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={4}
            className="w-96 p-0"
          >
            <LineItemEditor
              value={editingState}
              onChange={setEditingState}
              onSave={handleSave}
              onCancel={handleCancel}
            />
            <div className="flex w-full items-center justify-between border-t border-black/10 px-3 py-2">
              <button
                type="button"
                onClick={handleCancel}
                className="-mx-1.5 -my-1 flex items-center rounded-md px-1.5 py-1 transition-colors hover:bg-black/5"
              >
                <kbd className="rounded bg-black/5 px-1.5 py-0.5 text-xs text-muted-foreground">
                  Esc
                </kbd>
                <span className="ml-1.5 text-xs text-muted-foreground">
                  Cancel
                </span>
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="-mx-1.5 -my-1 flex items-center rounded-md px-1.5 py-1 transition-colors hover:bg-black/5"
              >
                <kbd className="flex items-center gap-1 rounded bg-black/5 px-1.5 py-0.5 text-xs text-muted-foreground">
                  {isMac ? "⌘" : "Ctrl"}
                  <span>↵</span>
                </kbd>
                <span className="ml-1.5 text-xs text-muted-foreground">
                  Save
                </span>
              </button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Quantity - inline input with bottom border style */}
        <label className="flex h-12 w-16 shrink-0 items-center justify-center border-b border-black/10 transition-colors focus-within:border-blue-600 [&:hover:not(:focus-within)]:border-black/20">
          <input
            type="text"
            inputMode="numeric"
            value={item.quantity || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d*$/.test(val)) {
                onUpdate("quantity", val === "" ? 0 : Number(val));
              }
            }}
            className="h-full w-full bg-transparent text-center text-sm caret-blue-600 outline-none placeholder:text-black/30"
            placeholder="Qty"
          />
        </label>

        {/* Price - inline input with bottom border style */}
        <label className="flex h-12 w-24 shrink-0 items-center justify-end border-b border-black/10 transition-colors focus-within:border-blue-600 [&:hover:not(:focus-within)]:border-black/20">
          <input
            type="text"
            inputMode="decimal"
            value={item.price || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d*\.?\d*$/.test(val)) {
                onUpdate("price", val === "" ? 0 : Number(val));
              }
            }}
            className="h-full w-full bg-transparent text-right text-sm caret-blue-600 outline-none placeholder:text-black/30"
            placeholder="Price"
          />
        </label>
      </div>

      {/* Inline delete — wrapper stays in flow at icon size, button goes absolute when confirming */}
      {reorderMode && (
        <div className="relative shrink-0 w-8">
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={!canRemove}
            className={cn(
              "flex items-center gap-1 rounded-md py-1.5 text-xs transition-colors",
              !canRemove && "pointer-events-none opacity-30",
              confirming
                ? "absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-(--destructive-bg) px-2 text-destructive"
                : "w-full justify-center text-muted-foreground hover:text-foreground",
            )}
          >
            <Trash
              className="size-3.5"
              weight={confirming ? "fill" : "regular"}
            />
            {confirming && <span className="font-medium">Delete?</span>}
          </button>
        </div>
      )}
    </div>
  );
}
