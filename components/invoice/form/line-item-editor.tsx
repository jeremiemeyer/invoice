"use client";

import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import {
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  INLINE_CODE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  ORDERED_LIST,
  STRIKETHROUGH,
  UNORDERED_LIST,
} from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import {
  type InitialConfigType,
  LexicalComposer,
} from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable as LexicalContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import type { EditorThemeClasses } from "lexical";
import {
  COMMAND_PRIORITY_HIGH,
  FORMAT_TEXT_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  type SerializedEditorState,
} from "lexical";
import {
  BoldIcon,
  CodeIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  StrikethroughIcon,
  UnderlineIcon,
} from "lucide-react";
import { useCallback, useEffect } from "react";
import { nodes } from "@/components/blocks/editor-00/nodes";
import { editorTheme } from "@/components/editor/themes/editor-theme";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";

// Custom theme for line item editor - no margin between paragraphs
const lineItemTheme: EditorThemeClasses = {
  ...editorTheme,
  // Override paragraph to remove large margin
  paragraph: "leading-6",
  // Adjust list styling for compact display
  list: {
    ...editorTheme.list,
    ol: "m-0 p-0 pl-4 list-decimal",
    ul: "m-0 p-0 pl-4 list-disc",
    listitem: "ml-2",
  },
};

interface LineItemEditorProps {
  value: SerializedEditorState | null;
  onChange: (value: SerializedEditorState) => void;
  onSave: () => void;
  onCancel: () => void;
  placeholder?: string;
}

// Keyboard shortcuts plugin
function KeyboardShortcutsPlugin({
  onSave,
  onCancel,
}: {
  onSave: () => void;
  onCancel: () => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Cmd/Ctrl + Enter to save
    const unregisterEnter = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        if (event?.metaKey || event?.ctrlKey) {
          event.preventDefault();
          onSave();
          return true;
        }
        return false;
      },
      COMMAND_PRIORITY_HIGH,
    );

    // Escape to cancel
    const unregisterEscape = editor.registerCommand(
      KEY_ESCAPE_COMMAND,
      (event) => {
        event?.preventDefault();
        onCancel();
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );

    return () => {
      unregisterEnter();
      unregisterEscape();
    };
  }, [editor, onSave, onCancel]);

  return null;
}

// Compact toolbar
function CompactToolbar() {
  const [editor] = useLexicalComposerContext();

  const formatText = useCallback(
    (format: "bold" | "italic" | "underline" | "strikethrough" | "code") => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
    },
    [editor],
  );

  const formatList = useCallback(
    (type: "bullet" | "number") => {
      if (type === "bullet") {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      } else {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      }
    },
    [editor],
  );

  return (
    <div className="flex items-center gap-0.5 border-b border-black/10 p-1">
      <Toggle
        size="sm"
        aria-label="Bold"
        onPressedChange={() => formatText("bold")}
        className="h-7 w-7 p-0"
      >
        <BoldIcon className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        aria-label="Italic"
        onPressedChange={() => formatText("italic")}
        className="h-7 w-7 p-0"
      >
        <ItalicIcon className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        aria-label="Underline"
        onPressedChange={() => formatText("underline")}
        className="h-7 w-7 p-0"
      >
        <UnderlineIcon className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        aria-label="Strikethrough"
        onPressedChange={() => formatText("strikethrough")}
        className="h-7 w-7 p-0"
      >
        <StrikethroughIcon className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        aria-label="Code"
        onPressedChange={() => formatText("code")}
        className="h-7 w-7 p-0"
      >
        <CodeIcon className="h-3.5 w-3.5" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 my-auto h-4" />

      <Toggle
        size="sm"
        aria-label="Bulleted list"
        onPressedChange={() => formatList("bullet")}
        className="h-7 w-7 p-0"
      >
        <ListIcon className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        aria-label="Numbered list"
        onPressedChange={() => formatList("number")}
        className="h-7 w-7 p-0"
      >
        <ListOrderedIcon className="h-3.5 w-3.5" />
      </Toggle>
    </div>
  );
}

export function LineItemEditor({
  value,
  onChange,
  onSave,
  onCancel,
  placeholder = "Item description...",
}: LineItemEditorProps) {
  const editorConfig: InitialConfigType = {
    namespace: "LineItemEditor",
    theme: lineItemTheme,
    nodes,
    onError: (error: Error) => {
      console.error(error);
    },
    ...(value ? { editorState: JSON.stringify(value) } : {}),
  };

  return (
    <div className="overflow-hidden rounded-t-lg bg-background">
      <LexicalComposer initialConfig={editorConfig}>
        <CompactToolbar />

        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <LexicalContentEditable
                className="min-h-[100px] p-3 text-sm outline-none"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="pointer-events-none absolute left-3 top-3 select-none text-sm text-muted-foreground">
                    {placeholder}
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>

        <ListPlugin />
        <HistoryPlugin />
        <TabIndentationPlugin />
        <AutoFocusPlugin />
        <MarkdownShortcutPlugin
          transformers={[
            BOLD_STAR,
            BOLD_UNDERSCORE,
            ITALIC_STAR,
            ITALIC_UNDERSCORE,
            BOLD_ITALIC_STAR,
            BOLD_ITALIC_UNDERSCORE,
            STRIKETHROUGH,
            INLINE_CODE,
            UNORDERED_LIST,
            ORDERED_LIST,
          ]}
        />
        <KeyboardShortcutsPlugin onSave={onSave} onCancel={onCancel} />

        <OnChangePlugin
          ignoreSelectionChange={true}
          onChange={(editorState) => {
            onChange(editorState.toJSON());
          }}
        />
      </LexicalComposer>
    </div>
  );
}

// Helper to create empty editor state
export function createEmptyEditorState(): SerializedEditorState {
  return {
    root: {
      children: [
        {
          children: [],
          direction: null,
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
          textFormat: 0,
          textStyle: "",
        },
      ],
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  } as unknown as SerializedEditorState;
}

// Helper to check if state is empty
export function isEditorStateEmpty(
  state: SerializedEditorState | null,
): boolean {
  if (!state) return true;
  const root = state.root;
  if (!root || !root.children || root.children.length === 0) return true;
  if (root.children.length === 1) {
    const firstChild = root.children[0] as {
      children?: unknown[];
      type?: string;
    };
    if (
      firstChild.type === "paragraph" &&
      (!firstChild.children || firstChild.children.length === 0)
    ) {
      return true;
    }
  }
  return false;
}
