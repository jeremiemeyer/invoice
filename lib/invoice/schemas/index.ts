/**
 * Invoice Schema Definitions
 *
 * This is the source of truth for all invoice data structures.
 * Each version is frozen and should never be modified.
 *
 * To create a new version:
 * 1. Create schemas/v3.ts with the new frozen schema
 * 2. Update CURRENT_SCHEMA_VERSION
 * 3. Update InvoiceFormState to reference the new version
 * 4. Create migrations/v2-to-v3.ts
 */

// Re-export all schema versions
export type { InvoiceV1, LineItemV1 } from "./v1";
export type { InvoiceV2, LineItemV2 } from "./v2";
export type { InvoiceV3, LineItemV3 } from "./v3";

// Current version
export const CURRENT_SCHEMA_VERSION = 3;

// =============================================================================
// InvoiceFormState - The "live" type used throughout the app
// =============================================================================

import type { InvoiceV3, LineItemV3 } from "./v3";

/**
 * LineItem type used in the app (= current schema version)
 */
export type LineItem = LineItemV3;

/**
 * InvoiceFormState - The main invoice type used throughout the app
 *
 * This is derived from the current schema version (V3).
 * schemaVersion is optional at runtime but required when saving.
 */
export type InvoiceFormState = Omit<InvoiceV3, "schemaVersion"> & {
  schemaVersion?: number;
};

/**
 * Document type (shared across all versions)
 */
export type DocumentType = "invoice" | "quote";

/**
 * Page margin options (shared across all versions)
 */
export type PageMargin = "none" | "small" | "normal";
