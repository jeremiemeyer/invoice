"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import {
  type InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { DotsSixVertical, Trash } from "@phosphor-icons/react";
import type { SerializedEditorState } from "lexical";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { nodes } from "@/components/blocks/editor-00/nodes";
import {
  Popover,
  PopoverBackdrop,
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
import {
  CompactToolbar,
  createEmptyEditorState,
  KeyboardShortcutsPlugin,
  lineItemTheme,
  MARKDOWN_TRANSFORMERS,
  MarkdownPastePlugin,
} from "./line-item-editor";

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

  // Popover open state
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

  // Always keep editingState initialized
  const [editingState, setEditingState] = useState<SerializedEditorState>(
    () => currentState || createEmptyEditorState(),
  );

  // Ref for latest editing state (avoids stale closure on close)
  const editingStateRef = useRef(editingState);

  // Sync editingState when currentState changes and popover is closed
  useEffect(() => {
    if (!namePopoverOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditingState(currentState || createEmptyEditorState());
      editingStateRef.current = currentState || createEmptyEditorState();
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

  // Save handler
  const handleSave = useCallback(() => {
    const newValue = JSON.stringify(editingStateRef.current);
    if (newValue !== item.name) {
      onUpdate("name", newValue);
    }
    setNamePopoverOpen(false);
    onPopoverOpenChange?.(false);
  }, [item.name, onUpdate, onPopoverOpenChange]);

  // Cancel handler - revert to original state
  const handleCancel = useCallback(() => {
    setEditingState(currentState || createEmptyEditorState());
    editingStateRef.current = currentState || createEmptyEditorState();
    setNamePopoverOpen(false);
    onPopoverOpenChange?.(false);
  }, [currentState, onPopoverOpenChange]);

  // Close editor when entering reorder mode
  useEffect(() => {
    if (reorderMode && namePopoverOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleSave();
    }
  }, [reorderMode, namePopoverOpen, handleSave]);

  // Handle popover open/close
  const handlePopoverChange = (open: boolean) => {
    if (open) {
      // Re-sync with current state when opening
      setEditingState(currentState || createEmptyEditorState());
      editingStateRef.current = currentState || createEmptyEditorState();
    } else {
      // Save on close
      const newValue = JSON.stringify(editingStateRef.current);
      if (newValue !== item.name) {
        onUpdate("name", newValue);
      }
    }
    setNamePopoverOpen(open);
    onPopoverOpenChange?.(open);
  };

  // Lexical editor config (remounts each time popover opens)
  const editorConfig: InitialConfigType = {
    namespace: "LineItemEditor",
    theme: lineItemTheme,
    nodes,
    onError: (error: Error) => {
      console.error(error);
    },
    ...(editingState ? { editorState: JSON.stringify(editingState) } : {}),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex w-full items-center",
        isDragging && "z-10 rounded-md bg-background shadow-md",
      )}
    >
      {/* Drag handle — flush left to align with PlusIcon in "Add item" below */}
      {reorderMode && (
        <div
          className="flex h-12 shrink-0 cursor-grab items-center mr-2 text-muted-foreground touch-none active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <DotsSixVertical size={16} />
        </div>
      )}

      {/* Row content */}
      <div
        className={cn(
          "flex min-w-0 flex-1 items-center",
          reorderMode && !isDragging && "animate-pulse-subtle",
          reorderMode &&
            "cursor-grab touch-none select-none active:cursor-grabbing",
        )}
        {...(reorderMode ? { ...attributes, ...listeners } : {})}
      >
        {/* Name cell with Popover - click to edit */}
        <Popover open={namePopoverOpen} onOpenChange={handlePopoverChange}>
          <PopoverBackdrop />
          <PopoverTrigger
            disabled={reorderMode}
            className={cn(
              "flex h-12 min-w-0 flex-1 items-center overflow-hidden border-b pr-3 text-left transition-colors",
              reorderMode
                ? "pointer-events-none border-black/10"
                : namePopoverOpen
                  ? "cursor-pointer border-blue-600"
                  : "cursor-pointer border-black/10 hover:border-black/20",
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
            alignOffset={-12}
            sideOffset={-87}
            collisionAvoidance={{ side: "none", align: "none" }}
            className="w-[calc(var(--anchor-width)+24px)] min-w-80 gap-0 overflow-hidden p-0 !duration-0"
          >
            <LexicalComposer initialConfig={editorConfig}>
              {/* Toolbar on top */}
              <CompactToolbar />

              {/* Editor content — py-3.5 aligns text with trigger's flex h-12 items-center */}
              <div className="relative">
                <RichTextPlugin
                  contentEditable={
                    <LexicalContentEditable
                      className="min-h-[80px] px-3 py-3.5 text-sm outline-none"
                      aria-placeholder="Item description..."
                      placeholder={
                        <div className="pointer-events-none absolute left-3 top-3.5 select-none text-sm leading-6 text-muted-foreground">
                          Item description...
                        </div>
                      }
                    />
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
                <MarkdownPastePlugin />
              </div>

              {/* Save/Cancel footer */}
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

              <ListPlugin />
              <HistoryPlugin />
              <TabIndentationPlugin />
              <AutoFocusPlugin />
              <MarkdownShortcutPlugin transformers={MARKDOWN_TRANSFORMERS} />
              <KeyboardShortcutsPlugin
                onSave={handleSave}
                onCancel={handleCancel}
              />
              <OnChangePlugin
                ignoreSelectionChange={true}
                onChange={(editorState) => {
                  const json = editorState.toJSON();
                  editingStateRef.current = json;
                  setEditingState(json);
                }}
              />
            </LexicalComposer>
          </PopoverContent>
        </Popover>

        {/* Quantity */}
        <label
          className={cn(
            "flex h-12 w-16 shrink-0 items-center justify-center border-b border-black/10 transition-colors focus-within:border-blue-600 [&:hover:not(:focus-within)]:border-black/20",
            reorderMode && "pointer-events-none",
          )}
        >
          <input
            type="text"
            inputMode="numeric"
            readOnly={reorderMode}
            tabIndex={reorderMode ? -1 : undefined}
            value={item.quantity || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d*$/.test(val)) {
                onUpdate("quantity", val === "" ? 0 : Number(val));
              }
            }}
            className="h-full w-full bg-transparent text-center text-base md:text-sm caret-blue-600 outline-none placeholder:text-black/30"
            placeholder="Qty"
          />
        </label>

        {/* Price */}
        <label
          className={cn(
            "flex h-12 w-24 shrink-0 items-center justify-end border-b border-black/10 transition-colors focus-within:border-blue-600 [&:hover:not(:focus-within)]:border-black/20",
            reorderMode && "pointer-events-none",
          )}
        >
          <input
            type="text"
            inputMode="decimal"
            readOnly={reorderMode}
            tabIndex={reorderMode ? -1 : undefined}
            value={item.price || ""}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d*\.?\d*$/.test(val)) {
                onUpdate("price", val === "" ? 0 : Number(val));
              }
            }}
            className="h-full w-full bg-transparent text-right text-base md:text-sm caret-blue-600 outline-none placeholder:text-black/30"
            placeholder="Price"
          />
        </label>
      </div>

      {/* Inline delete */}
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
