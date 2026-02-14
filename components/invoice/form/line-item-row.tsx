"use client";

import {
  ArrowDown,
  ArrowUp,
  DotsThreeVertical,
  Trash,
} from "@phosphor-icons/react";
import type { SerializedEditorState } from "lexical";
import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  onMoveUp: () => void;
  onMoveDown: () => void;
  canRemove: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  autoOpen?: boolean;
  onPopoverOpenChange?: (isOpen: boolean) => void;
}

export function LineItemRow({
  item,
  onRemove,
  onUpdate,
  onMoveUp,
  onMoveDown,
  canRemove,
  canMoveUp,
  canMoveDown,
  autoOpen = false,
  onPopoverOpenChange,
}: LineItemRowProps) {
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
    <div className="group relative flex w-full items-center">
      {/* Actions dropdown menu */}
      <div className="absolute -left-10 top-1/2 -translate-y-1/2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="
              flex h-8 w-8 items-center justify-center rounded
              transition-[opacity,background-color]

              opacity-0 group-hover:opacity-100

              aria-expanded:opacity-100
              aria-expanded:bg-accent
              aria-expanded:text-accent-foreground

              hover:bg-accent/80
            "
          >
            <DotsThreeVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={4}>
            <DropdownMenuItem onClick={onMoveUp} disabled={!canMoveUp}>
              <ArrowUp className="mr-2 size-4" />
              Move up
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMoveDown} disabled={!canMoveDown}>
              <ArrowDown className="mr-2 size-4" />
              Move down
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onRemove}
              disabled={!canRemove}
              variant="destructive"
            >
              <Trash className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Row content */}
      <div className="flex w-full items-center">
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
                className="flex items-center rounded-md px-1.5 py-1 -mx-1.5 -my-1 transition-colors hover:bg-black/5"
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
                className="flex items-center rounded-md px-1.5 py-1 -mx-1.5 -my-1 transition-colors hover:bg-black/5"
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
    </div>
  );
}
