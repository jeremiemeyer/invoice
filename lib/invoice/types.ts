/**
 * Invoice Types
 *
 * Schema types (InvoiceFormState, LineItem, etc.) are defined in ./schemas/
 * This file re-exports them and adds runtime-specific types.
 */

// Re-export schema types
export {
  CURRENT_SCHEMA_VERSION,
  type DocumentType,
  type InvoiceFormState,
  type InvoiceV1,
  type InvoiceV2,
  type InvoiceV3,
  type LineItem,
  type PageMargin,
} from "./schemas";

// =============================================================================
// Runtime-specific types (not part of schema versioning)
// =============================================================================

export type InvoiceAction =
  | {
      type: "SET_FIELD";
      field: keyof import("./schemas").InvoiceFormState;
      value: unknown;
    }
  | { type: "ADD_LINE_ITEM" }
  | {
      type: "UPDATE_LINE_ITEM";
      id: string;
      field: keyof import("./schemas").LineItem;
      value: unknown;
    }
  | { type: "REMOVE_LINE_ITEM"; id: string }
  | { type: "RESET" };

export interface InvoiceTotals {
  subTotal: number;
  tax: number;
  total: number;
}
