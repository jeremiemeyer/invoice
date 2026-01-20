/**
 * Migration Types
 *
 * Re-exports schema types and adds migration-specific utilities.
 */

// Re-export schema versions for migrations
export {
  CURRENT_SCHEMA_VERSION,
  type InvoiceV1,
  type InvoiceV2,
  type LineItemV1,
  type LineItemV2,
} from "../schemas";

/**
 * Type for any valid invoice schema (for detection)
 */
export type AnyInvoiceSchema = InvoiceV1 | InvoiceV2;

/**
 * Type guard to check if an invoice has a schema version
 */
export function hasSchemaVersion(
  data: unknown,
): data is { schemaVersion: number } {
  return (
    typeof data === "object" &&
    data !== null &&
    "schemaVersion" in data &&
    typeof (data as Record<string, unknown>).schemaVersion === "number"
  );
}

// Import types for the type guard
import type { InvoiceV1, InvoiceV2 } from "../schemas";
