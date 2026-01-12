import type { InvoiceTemplateConfig } from "./types";

/**
 * Classic template - clean grayscale design.
 * This is the default template that matches the original invoice styling.
 */
export const classicTemplate: InvoiceTemplateConfig = {
  id: "classic",
  name: "Classic",
  previewColor: "bg-gray-400",
  colors: {
    label: "text-gray-400",
    text: "text-gray-600",
    border: "border-gray-200",
    avatarBg: "bg-gray-200",
  },
  fonts: {},
};
