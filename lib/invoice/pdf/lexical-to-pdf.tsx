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

// Base styles
const baseTextStyle: Style = {
  fontSize: 10,
  fontWeight: 400,
  color: "#111827",
  fontFamily: "Inter",
};

const codeStyle: Style = {
  fontFamily: "Courier",
  fontSize: 8,
  backgroundColor: "#f3f4f6",
  paddingHorizontal: 4,
  paddingVertical: 2,
  borderRadius: 2,
};

/**
 * Get style object based on Lexical format flags
 */
function getTextStyle(format: number): Style {
  const style: Style = { ...baseTextStyle };

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
    Object.assign(style, codeStyle);
  }

  return style;
}

/**
 * Render a text node with formatting
 */
function renderTextNode(node: SerializedNode, key: number): ReactNode {
  const format = (node.format as number) || 0;
  const style = getTextStyle(format);

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
      {children.map((child, idx) => renderNode(child, idx, true))}
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

function renderList(node: SerializedNode, key: number): ReactNode {
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
                ...baseTextStyle,
                width: 12,
                color: "#6b7280",
              }}
            >
              {marker}
            </Text>
            <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
              {item.content.map((child, childIdx) =>
                renderNode(child, childIdx, true),
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
): ReactNode {
  switch (node.type) {
    case "root":
      return (node.children || []).map((child, idx) =>
        renderNode(child, idx, idx === 0),
      );

    case "paragraph":
      return renderParagraph(node, key, isFirst);

    case "text":
      return renderTextNode(node, key);

    case "linebreak":
      return <Text key={key}>{"\n"}</Text>;

    case "list":
      return renderList(node, key);

    case "listitem":
      // Handled by renderList/collectListItems
      return (node.children || []).map((child, idx) =>
        renderNode(child, idx, true),
      );

    case "heading": {
      const headingSize = node.tag === "h1" ? 14 : node.tag === "h2" ? 12 : 11;
      return (
        <View key={key} style={{ marginTop: isFirst ? 0 : 4 }}>
          {(node.children || []).map((child, idx) => {
            if (child.type === "text") {
              return (
                <Text
                  key={idx}
                  style={{
                    ...baseTextStyle,
                    fontSize: headingSize,
                    fontWeight: 700,
                  }}
                >
                  {child.text || ""}
                </Text>
              );
            }
            return renderNode(child, idx, true);
          })}
        </View>
      );
    }

    default:
      // For unknown nodes, try to render children
      if (node.children) {
        return node.children.map((child, idx) => renderNode(child, idx, true));
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
  if (!state || !state.root) {
    return <Text style={style || baseTextStyle}>-</Text>;
  }

  const elements = renderNode(state.root as SerializedNode, 0, true);

  // Wrap in a View if we have multiple elements
  if (Array.isArray(elements)) {
    return (
      <View style={{ flexDirection: "column", ...style }}>{elements}</View>
    );
  }

  return elements;
}
