import { ClassicLayout } from "./classic";
import { CompactLayout } from "./compact";
import { MinimalistLayout } from "./minimalist";
import type { LayoutDefinition } from "./types";

export type { LayoutComponent, LayoutDefinition, LayoutProps } from "./types";
export { getAdaptiveFontSize, PAGE_DIMENSIONS } from "./types";

/** All available layouts */
export const LAYOUTS: LayoutDefinition[] = [
  {
    id: "minimalist",
    name: "Minimalist",
    component: MinimalistLayout,
  },
  {
    id: "classic",
    name: "Classic",
    component: ClassicLayout,
  },
  {
    id: "compact",
    name: "Compact",
    component: CompactLayout,
  },
];

/** Default layout ID */
export const DEFAULT_LAYOUT_ID = "classic";

/**
 * Get a layout by ID.
 * Falls back to classic layout if ID not found.
 */
export function getLayout(id: string): LayoutDefinition {
  return LAYOUTS.find((l) => l.id === id) ?? LAYOUTS[0];
}

/** Export individual layouts */
export { ClassicLayout, CompactLayout, MinimalistLayout };
