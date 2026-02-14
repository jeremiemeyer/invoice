"use client";

import { $isTableSelection } from "@lexical/table";
import {
  TextB as TextBIcon,
  TextItalic as TextItalicIcon,
  TextStrikethrough as TextStrikethroughIcon,
  TextUnderline as TextUnderlineIcon,
} from "@phosphor-icons/react";
import {
  $isRangeSelection,
  type BaseSelection,
  FORMAT_TEXT_COMMAND,
  type TextFormatType,
} from "lexical";
import { useCallback, useState } from "react";

import { useToolbarContext } from "@/components/editor/context/toolbar-context";
import { useUpdateToolbarHandler } from "@/components/editor/editor-hooks/use-update-toolbar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const FORMATS = [
  { format: "bold", icon: TextBIcon, label: "Bold" },
  { format: "italic", icon: TextItalicIcon, label: "Italic" },
  { format: "underline", icon: TextUnderlineIcon, label: "Underline" },
  {
    format: "strikethrough",
    icon: TextStrikethroughIcon,
    label: "Strikethrough",
  },
] as const;

export function FontFormatToolbarPlugin() {
  const { activeEditor } = useToolbarContext();
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  const $updateToolbar = useCallback((selection: BaseSelection) => {
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      const formats: string[] = [];
      FORMATS.forEach(({ format }) => {
        if (selection.hasFormat(format as TextFormatType)) {
          formats.push(format);
        }
      });
      setActiveFormats((prev) => {
        // Only update if formats have changed
        if (
          prev.length !== formats.length ||
          !formats.every((f) => prev.includes(f))
        ) {
          return formats;
        }
        return prev;
      });
    }
  }, []);

  useUpdateToolbarHandler($updateToolbar);

  return (
    <ToggleGroup
      value={activeFormats}
      onValueChange={setActiveFormats}
      variant="outline"
      size="sm"
    >
      {FORMATS.map(({ format, icon: Icon, label }) => (
        <ToggleGroupItem
          key={format}
          value={format}
          aria-label={label}
          onClick={() => {
            activeEditor.dispatchCommand(
              FORMAT_TEXT_COMMAND,
              format as TextFormatType,
            );
          }}
        >
          <Icon className="size-4" />
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
