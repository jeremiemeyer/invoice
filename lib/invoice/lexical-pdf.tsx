import { Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { SerializedEditorState } from "lexical";
import { parseLexicalState } from "./lexical-to-html";

interface LexicalPdfProps {
  children: string;
  style?: Style;
}

interface SerializedNode {
  type: string;
  children?: SerializedNode[];
  text?: string;
  format?: number;
  listType?: string;
  tag?: string;
  value?: number;
  indent?: number;
}

// Text format flags from Lexical
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_UNDERLINE = 8;
const IS_CODE = 16;

function getTextStyle(format: number): Style {
  const style: Style = {};
  if (format & IS_BOLD) {
    style.fontWeight = 600;
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
    style.fontFamily = "Courier";
    style.backgroundColor = "#f3f4f6";
    style.padding = 2;
    style.borderRadius = 2;
  }
  return style;
}

function renderTextNode(node: SerializedNode, key: string): React.ReactNode {
  const style = getTextStyle(node.format || 0);
  return (
    <Text key={key} style={style}>
      {node.text || ""}
    </Text>
  );
}

function renderChildren(
  children: SerializedNode[] | undefined,
  keyPrefix: string
): React.ReactNode[] {
  if (!children) return [];
  return children.map((child, i) => renderNode(child, `${keyPrefix}-${i}`));
}

function renderNode(node: SerializedNode, key: string): React.ReactNode {
  switch (node.type) {
    case "root":
      return (
        <View key={key}>{renderChildren(node.children, key)}</View>
      );

    case "paragraph": {
      const children = renderChildren(node.children, key);
      if (children.length === 0) {
        return <Text key={key} style={{ height: 4 }} />;
      }
      return (
        <Text key={key} style={{ marginBottom: 2 }}>
          {children}
        </Text>
      );
    }

    case "text":
      return renderTextNode(node, key);

    case "linebreak":
      return <Text key={key}>{"\n"}</Text>;

    case "list": {
      const items: FlatListItem[] = [];
      const isOrdered = node.listType === "number";
      collectPdfListItems(node, 0, isOrdered, items);

      return (
        <View key={key} style={{ marginVertical: 2 }}>
          {items.map((item, i) => {
            const bullet = item.isOrdered ? `${item.value || i + 1}.` : "•";
            const indentPadding = item.indent * 12; // 12pt per indent level
            return (
              <View
                key={`${key}-item-${i}`}
                style={{
                  flexDirection: "row",
                  marginBottom: 2,
                  paddingLeft: indentPadding,
                }}
              >
                <Text style={{ width: item.isOrdered ? 16 : 12 }}>{bullet}</Text>
                <Text style={{ flex: 1 }}>
                  {renderListItemContent(item.content, `${key}-item-${i}`)}
                </Text>
              </View>
            );
          })}
        </View>
      );
    }

    case "listitem":
      return renderChildren(node.children, key);

    case "heading": {
      const fontSize =
        node.tag === "h1" ? 14 : node.tag === "h2" ? 12 : 10;
      return (
        <Text
          key={key}
          style={{ fontSize, fontWeight: 600, marginBottom: 4 }}
        >
          {renderChildren(node.children, key)}
        </Text>
      );
    }

    case "quote":
      return (
        <View
          key={key}
          style={{
            borderLeftWidth: 2,
            borderLeftColor: "#9ca3af",
            paddingLeft: 8,
            marginVertical: 4,
          }}
        >
          <Text style={{ fontStyle: "italic" }}>
            {renderChildren(node.children, key)}
          </Text>
        </View>
      );

    default:
      if (node.children) {
        return renderChildren(node.children, key);
      }
      return null;
  }
}

interface FlatListItem {
  indent: number;
  content: SerializedNode[];
  isOrdered: boolean;
  value?: number;
}

// Recursively collect all list items with their indent levels
function collectPdfListItems(
  node: SerializedNode,
  baseIndent: number,
  isOrdered: boolean,
  items: FlatListItem[]
): void {
  if (node.type === "list") {
    const listIsOrdered = node.listType === "number";
    for (const child of node.children || []) {
      collectPdfListItems(child, baseIndent, listIsOrdered, items);
    }
  } else if (node.type === "listitem") {
    const itemIndent = baseIndent + (node.indent || 0);

    // Separate content from nested lists
    const contentChildren: SerializedNode[] = [];
    const nestedLists: SerializedNode[] = [];

    for (const child of node.children || []) {
      if (child.type === "list") {
        nestedLists.push(child);
      } else {
        contentChildren.push(child);
      }
    }

    // Check if there's actual text content (not just empty paragraphs)
    const hasContent = contentChildren.some(child => {
      if (child.type === "paragraph" && child.children) {
        return child.children.some(c => c.type === "text" && c.text?.trim());
      }
      return child.type === "text" && child.text?.trim();
    });

    // Only add item if it has actual content (not just a container for nested lists)
    if (hasContent || nestedLists.length === 0) {
      items.push({
        indent: itemIndent,
        content: contentChildren,
        isOrdered,
        value: node.value,
      });
    }

    // Process nested lists (they add items at deeper indent)
    for (const nestedList of nestedLists) {
      collectPdfListItems(nestedList, itemIndent + 1, isOrdered, items);
    }
  }
}

function renderListItemContent(
  contentChildren: SerializedNode[],
  keyPrefix: string
): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  for (const child of contentChildren) {
    if (child.type === "paragraph" && child.children) {
      result.push(...renderChildren(child.children, keyPrefix));
    } else {
      result.push(renderNode(child, `${keyPrefix}-child`));
    }
  }
  return result;
}

export function LexicalPdf({ children, style }: LexicalPdfProps) {
  const state = parseLexicalState(children);

  if (!state || !state.root) {
    return (
      <Text style={style}>-</Text>
    );
  }

  return (
    <View style={style}>
      {renderChildren(
        (state.root as SerializedNode).children,
        "lexical"
      )}
    </View>
  );
}
