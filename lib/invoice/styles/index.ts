/**
 * Invoice styles collection.
 */

import type { InvoiceStyle } from "./types";

// Default fonts and spacing used by all styles
const defaultFonts = {
  heading: "Inter",
  body: "Inter",
  mono: "Geist Mono",
};

// Elegant style - serif for headings only (accent font)
const elegantFonts = {
  heading: "Cormorant Garamond",
  body: "Inter",
  mono: "Geist Mono",
};

const defaultFontStyle = {
  monoLabels: false,
  monoNumbers: false,
  labelWeight: 500,
};

const monoFontStyle = {
  monoLabels: true,
  monoNumbers: true,
  labelWeight: 400,
};

const defaultSpacing = {
  page: 32,
  section: 24,
  item: 12,
};

export const styles: Record<string, InvoiceStyle> = {
  classic: {
    id: "classic",
    name: "Classic",
    colors: {
      primary: "#111827", // gray-900
      secondary: "#4b5563", // gray-600
      muted: "#9ca3af", // gray-400
      border: "#e5e7eb", // gray-200
      background: "#ffffff",
      accent: "#111827", // gray-900
      avatarBg: "#e5e7eb", // gray-200
    },
    fonts: defaultFonts,
    fontStyle: defaultFontStyle,
    spacing: defaultSpacing,
  },
  "classic-mono": {
    id: "classic-mono",
    name: "Classic Mono",
    colors: {
      primary: "#111827", // gray-900
      secondary: "#4b5563", // gray-600
      muted: "#9ca3af", // gray-400
      border: "#e5e7eb", // gray-200
      background: "#ffffff",
      accent: "#111827", // gray-900
      avatarBg: "#e5e7eb", // gray-200
    },
    fonts: defaultFonts,
    fontStyle: monoFontStyle,
    spacing: defaultSpacing,
  },
  elegant: {
    id: "elegant",
    name: "Elegant",
    colors: {
      primary: "#1c1917", // stone-900
      secondary: "#44403c", // stone-700
      muted: "#a8a29e", // stone-400
      border: "#e7e5e4", // stone-200
      background: "#ffffff", // white
      accent: "#78350f", // amber-900 (warm gold-brown)
      avatarBg: "#fef3c7", // amber-100
    },
    fonts: elegantFonts,
    fontStyle: defaultFontStyle,
    spacing: defaultSpacing,
  },
  blue: {
    id: "blue",
    name: "Blue",
    colors: {
      primary: "#1e3a5f", // deep navy blue
      secondary: "#3d5a80", // medium blue-gray
      muted: "#7c98b3", // soft blue-gray
      border: "#c9d6e3", // light blue-gray
      background: "#ffffff", // white
      accent: "#2563eb", // vibrant blue-600
      avatarBg: "#dbeafe", // blue-100
    },
    fonts: defaultFonts,
    fontStyle: defaultFontStyle,
    spacing: defaultSpacing,
  },
};

/**
 * Get a style by ID. Falls back to classic if not found.
 */
export function getStyle(styleId: string): InvoiceStyle {
  return styles[styleId] || styles.classic;
}

/**
 * Get all available styles as an array.
 */
export function getAllStyles(): InvoiceStyle[] {
  return Object.values(styles);
}

export type { InvoiceStyle } from "./types";
