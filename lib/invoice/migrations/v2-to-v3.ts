/**
 * Migration from schema v2 to v3
 *
 * Changes:
 * - Added `purchaseOrderNumber` (default: empty string)
 */

import type { InvoiceV2, InvoiceV3 } from "../schemas";

/**
 * Migrates an invoice from v2 to v3 schema.
 */
export function migrateV2ToV3(v2: InvoiceV2): InvoiceV3 {
  return {
    ...v2,
    schemaVersion: 3,
    purchaseOrderNumber: "",
  };
}
