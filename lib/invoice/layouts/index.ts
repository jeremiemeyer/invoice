import { ClassicLayout } from "./classic";
import { CompactLayout } from "./compact";
import { ModernLayout } from "./modern";
import type { LayoutDefinition } from "./types";

export type { LayoutComponent, LayoutDefinition, LayoutProps } from "./types";
export { getAdaptiveFontSize, PAGE_DIMENSIONS } from "./types";

/** All available layouts */
export const LAYOUTS: LayoutDefinition[] = [
  {
    id: "classic",
    name: "Classic",
    component: ClassicLayout,
  },
  {
    id: "modern",
    name: "Modern",
    component: ModernLayout,
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
export { ClassicLayout, CompactLayout, ModernLayout };
