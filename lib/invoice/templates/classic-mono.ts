import type { InvoiceTemplateConfig } from "./types";

/**
 * Classic Mono template - designer aesthetic with monospace typography.
 * Uses monospace for section labels, column headers, dates, and numbers.
 */
export const classicMonoTemplate: InvoiceTemplateConfig = {
  id: "classic-mono",
  name: "Classic Mono",
  previewColor: "bg-gray-600",
  colors: {
    label: "text-gray-400",
    text: "text-gray-600",
    border: "border-gray-200",
    avatarBg: "bg-gray-200",
  },
  fonts: {
    numbers: "font-mono",
    labels: "font-mono",
    labelWeight: "font-light",
  },
};
