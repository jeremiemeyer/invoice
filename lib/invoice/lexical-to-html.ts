import type { SerializedEditorState } from "lexical";

interface SerializedNode {
  type: string;
  children?: SerializedNode[];
  text?: string;
  format?: number;
  listType?: string;
  tag?: string;
  direction?: string | null;
  indent?: number;
  value?: number;
}

// Text format flags from Lexical
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_UNDERLINE = 8;
const IS_CODE = 16;

function renderTextWithFormat(text: string, format: number): string {
  let result = escapeHtml(text);

  if (format & IS_CODE) {
    result = `<code>${result}</code>`;
  }
  if (format & IS_BOLD) {
    result = `<strong>${result}</strong>`;
  }
  if (format & IS_ITALIC) {
    result = `<em>${result}</em>`;
  }
  if (format & IS_UNDERLINE) {
    result = `<u>${result}</u>`;
  }
  if (format & IS_STRIKETHROUGH) {
    result = `<s>${result}</s>`;
  }

  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Recursively collect all list items with their indent levels
function collectListItems(
  node: SerializedNode,
  baseIndent: number,
  isOrdered: boolean,
  items: Array<{
    indent: number;
    content: string;
    isOrdered: boolean;
    value?: number;
  }>,
): void {
  if (node.type === "list") {
    const listIsOrdered = node.listType === "number";
    for (const child of node.children || []) {
      collectListItems(child, baseIndent, listIsOrdered, items);
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

    // Render the content (without nested lists)
    const itemContent = contentChildren.map(renderNode).join("");

    // Only add item if it has actual content (not just a container for nested lists)
    const hasContent =
      itemContent.replace(/<p><br\/><\/p>/g, "").trim().length > 0;
    if (hasContent || nestedLists.length === 0) {
      items.push({
        indent: itemIndent,
        content: itemContent,
        isOrdered,
        value: node.value,
      });
    }

    // Process nested lists (they add items at deeper indent)
    for (const nestedList of nestedLists) {
      collectListItems(nestedList, itemIndent + 1, isOrdered, items);
    }
  }
}

// Render a list with flat structure and inline styles for indentation
function renderList(node: SerializedNode): string {
  const items: Array<{
    indent: number;
    content: string;
    isOrdered: boolean;
    value?: number;
  }> = [];
  const isOrdered = node.listType === "number";

  collectListItems(node, 0, isOrdered, items);

  if (items.length === 0) {
    return "";
  }

  let html = '<div class="list-container">';

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const indentPx = item.indent * 16; // 16px per indent level
    const marker = item.isOrdered ? `${item.value || i + 1}.` : "•";

    html += `<div class="list-item" style="padding-left: ${indentPx}px; display: flex; gap: 8px;">`;
    html += `<span class="list-marker" style="flex-shrink: 0;">${marker}</span>`;
    html += `<span class="list-content">${item.content || "&nbsp;"}</span>`;
    html += "</div>";
  }

  html += "</div>";
  return html;
}

function renderNode(node: SerializedNode): string {
  switch (node.type) {
    case "root":
      return (node.children || []).map(renderNode).join("");

    case "paragraph": {
      const pContent = (node.children || []).map(renderNode).join("");
      return pContent ? `<p>${pContent}</p>` : "<p><br/></p>";
    }

    case "text":
      return renderTextWithFormat(node.text || "", node.format || 0);

    case "linebreak":
      return "<br/>";

    case "list":
      return renderList(node);

    case "listitem": {
      // Handled by renderList/collectListItems
      const liContent = (node.children || []).map(renderNode).join("");
      return liContent;
    }

    case "heading": {
      const headingTag = node.tag || "h1";
      const headingContent = (node.children || []).map(renderNode).join("");
      return `<${headingTag}>${headingContent}</${headingTag}>`;
    }

    case "quote": {
      const quoteContent = (node.children || []).map(renderNode).join("");
      return `<blockquote>${quoteContent}</blockquote>`;
    }

    default:
      // For unknown nodes, try to render children
      if (node.children) {
        return node.children.map(renderNode).join("");
      }
      return "";
  }
}

/**
 * Convert Lexical serialized state to HTML string
 */
export function lexicalToHtml(state: SerializedEditorState | null): string {
  if (!state || !state.root) {
    return "";
  }
  return renderNode(state.root as unknown as SerializedNode);
}

/**
 * Convert Lexical serialized state to plain text (for first line display)
 */
export function lexicalToPlainText(
  state: SerializedEditorState | null,
): string {
  if (!state || !state.root) {
    return "";
  }

  function extractText(node: SerializedNode): string {
    if (node.type === "text") {
      return node.text || "";
    }
    if (node.type === "linebreak") {
      return "\n";
    }
    if (node.type === "paragraph") {
      // Extract text from children and add newline at end
      const content = node.children?.map(extractText).join("") || "";
      return `${content}\n`;
    }
    if (node.type === "listitem") {
      const content = node.children?.map(extractText).join("") || "";
      return `${content}\n`;
    }
    if (node.type === "root") {
      // Join children but trim trailing newline
      return (node.children?.map(extractText).join("") || "").replace(
        /\n$/,
        "",
      );
    }
    if (node.children) {
      return node.children.map(extractText).join("");
    }
    return "";
  }

  return extractText(state.root as unknown as SerializedNode);
}

/**
 * Get first line of plain text (for truncated display)
 */
export function lexicalToFirstLine(
  state: SerializedEditorState | null,
): string {
  const text = lexicalToPlainText(state);
  const firstLine = text.split("\n")[0] || "";
  return firstLine.trim();
}

/**
 * Check if the Lexical state is empty or has no content
 */
export function isLexicalEmpty(state: SerializedEditorState | null): boolean {
  if (!state || !state.root) return true;
  const text = lexicalToPlainText(state).trim();
  return text.length === 0;
}

/**
 * Check if the Lexical state has more than one line of content
 */
export function hasMultipleLines(state: SerializedEditorState | null): boolean {
  if (!state || !state.root) return false;
  const text = lexicalToPlainText(state);
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  return lines.length > 1;
}

/**
 * Parse a JSON string to SerializedEditorState, returns null if invalid
 */
export function parseLexicalState(json: string): SerializedEditorState | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed?.root) {
      return parsed as SerializedEditorState;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Convert plain text to a simple Lexical state
 */
export function plainTextToLexical(text: string): SerializedEditorState {
  const lines = text.split("\n");
  const children = lines.map((line) => ({
    children: line
      ? [
          {
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: line,
            type: "text",
            version: 1,
          },
        ]
      : [],
    direction: null,
    format: "",
    indent: 0,
    type: "paragraph",
    version: 1,
    textFormat: 0,
    textStyle: "",
  }));

  return {
    root: {
      children,
      direction: null,
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  } as SerializedEditorState;
}
