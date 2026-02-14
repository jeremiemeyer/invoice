/**
 * Converts Lexical serialized state to React-PDF Text elements with styling.
 * Supports: bold, italic, underline, strikethrough, code, lists, paragraphs.
 */

import { Text, View } from "@jeremiemeyer/react-pdf-html";
import type { Style } from "@react-pdf/types";
import type { SerializedEditorState } from "lexical";
import type { ReactNode } from "react";

interface SerializedNode {
  type: string;
  children?: SerializedNode[];
  text?: string;
  format?: number | string;
  listType?: string;
  tag?: string;
  direction?: "ltr" | "rtl" | null;
  indent?: number;
  value?: number;
}

// Text format flags from Lexical (bitmask)
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_UNDERLINE = 8;
const IS_CODE = 16;

// Default base styles (used when no style override is provided)
const defaultBaseTextStyle: Style = {
  fontSize: 10,
  fontWeight: 400,
  color: "#111827",
  fontFamily: "Inter",
};

/**
 * Get style object based on Lexical format flags
 */
function getTextStyle(format: number, base: Style): Style {
  const style: Style = { ...base };

  if (format & IS_BOLD) {
    style.fontWeight = 700;
  }
  if (format & IS_ITALIC) {
    style.fontStyle = "italic";
  }
  if (format & IS_UNDERLINE) {
    style.textDecoration = "underline";
  }
  if (format & IS_STRIKETHROUGH) {
    style.textDecoration = "line-through";
  }
  if (format & IS_CODE) {
    const baseFontSize = typeof base.fontSize === "number" ? base.fontSize : 10;
    Object.assign(style, {
      fontFamily: "Courier",
      fontSize: baseFontSize * 0.8,
      backgroundColor: "#f3f4f6",
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 2,
    });
  }

  return style;
}

/**
 * Render a text node with formatting
 */
function renderTextNode(
  node: SerializedNode,
  key: number,
  base: Style,
): ReactNode {
  const format = (node.format as number) || 0;
  const style = getTextStyle(format, base);

  return (
    <Text key={key} style={style}>
      {node.text || ""}
    </Text>
  );
}

/**
 * Render a paragraph node
 */
function renderParagraph(
  node: SerializedNode,
  key: number,
  isFirst: boolean,
  base: Style,
): ReactNode {
  const children = node.children || [];

  if (children.length === 0) {
    return null;
  }

  return (
    <View
      key={key}
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: isFirst ? 0 : 2,
      }}
    >
      {children.map((child, idx) => renderNode(child, idx, true, base))}
    </View>
  );
}

/**
 * Render a list item
 */
interface ListItemData {
  indent: number;
  content: SerializedNode[];
  isOrdered: boolean;
  value?: number;
}

function collectListItems(
  node: SerializedNode,
  baseIndent: number,
  isOrdered: boolean,
  items: ListItemData[],
): void {
  if (node.type === "list") {
    const listIsOrdered = node.listType === "number";
    for (const child of node.children || []) {
      collectListItems(child, baseIndent, listIsOrdered, items);
    }
  } else if (node.type === "listitem") {
    const itemIndent = baseIndent + (node.indent || 0);

    const contentChildren: SerializedNode[] = [];
    const nestedLists: SerializedNode[] = [];

    for (const child of node.children || []) {
      if (child.type === "list") {
        nestedLists.push(child);
      } else {
        contentChildren.push(child);
      }
    }

    // Only add item if it has actual content
    if (contentChildren.length > 0) {
      items.push({
        indent: itemIndent,
        content: contentChildren,
        isOrdered,
        value: node.value,
      });
    }

    // Process nested lists
    for (const nestedList of nestedLists) {
      collectListItems(nestedList, itemIndent + 1, isOrdered, items);
    }
  }
}

function renderList(node: SerializedNode, key: number, base: Style): ReactNode {
  const items: ListItemData[] = [];
  const isOrdered = node.listType === "number";

  collectListItems(node, 0, isOrdered, items);

  if (items.length === 0) {
    return null;
  }

  return (
    <View key={key} style={{ marginVertical: 2 }}>
      {items.map((item, idx) => {
        const indentPx = item.indent * 12;
        const marker = item.isOrdered ? `${item.value || idx + 1}.` : "•";

        return (
          <View
            key={idx}
            style={{
              flexDirection: "row",
              paddingLeft: indentPx,
              marginBottom: 1,
            }}
          >
            <Text
              style={{
                ...base,
                width: 12,
                color: "#6b7280",
              }}
            >
              {marker}
            </Text>
            <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
              {item.content.map((child, childIdx) =>
                renderNode(child, childIdx, true, base),
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/**
 * Render any node type
 */
function renderNode(
  node: SerializedNode,
  key: number,
  isFirst: boolean,
  base: Style,
): ReactNode {
  switch (node.type) {
    case "root":
      return (node.children || []).map((child, idx) =>
        renderNode(child, idx, idx === 0, base),
      );

    case "paragraph":
      return renderParagraph(node, key, isFirst, base);

    case "text":
      return renderTextNode(node, key, base);

    case "linebreak":
      return <Text key={key}>{"\n"}</Text>;

    case "list":
      return renderList(node, key, base);

    case "listitem":
      // Handled by renderList/collectListItems
      return (node.children || []).map((child, idx) =>
        renderNode(child, idx, true, base),
      );

    case "heading": {
      const baseFontSize =
        typeof base.fontSize === "number" ? base.fontSize : 10;
      const headingSize =
        node.tag === "h1"
          ? baseFontSize * 1.4
          : node.tag === "h2"
            ? baseFontSize * 1.2
            : baseFontSize * 1.1;
      return (
        <View key={key} style={{ marginTop: isFirst ? 0 : 4 }}>
          {(node.children || []).map((child, idx) => {
            if (child.type === "text") {
              return (
                <Text
                  key={idx}
                  style={{
                    ...base,
                    fontSize: headingSize,
                    fontWeight: 700,
                  }}
                >
                  {child.text || ""}
                </Text>
              );
            }
            return renderNode(child, idx, true, base);
          })}
        </View>
      );
    }

    default:
      // For unknown nodes, try to render children
      if (node.children) {
        return node.children.map((child, idx) =>
          renderNode(child, idx, true, base),
        );
      }
      return null;
  }
}

/**
 * Convert Lexical serialized state to React-PDF elements
 */
export function lexicalToPdf(
  state: SerializedEditorState | null,
  style?: Style,
): ReactNode {
  // Build base text style from the passed style, falling back to defaults
  const base: Style = {
    ...defaultBaseTextStyle,
    ...(style
      ? {
          fontSize: style.fontSize ?? defaultBaseTextStyle.fontSize,
          fontWeight: style.fontWeight ?? defaultBaseTextStyle.fontWeight,
          color: style.color ?? defaultBaseTextStyle.color,
          fontFamily: style.fontFamily ?? defaultBaseTextStyle.fontFamily,
          lineHeight: style.lineHeight,
        }
      : {}),
  };

  if (!state || !state.root) {
    return <Text style={base}>-</Text>;
  }

  const elements = renderNode(state.root as SerializedNode, 0, true, base);

  // Wrap in a View if we have multiple elements
  if (Array.isArray(elements)) {
    return <View style={{ flexDirection: "column" }}>{elements}</View>;
  }

  return elements;
}
