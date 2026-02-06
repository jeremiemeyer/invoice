/**
 * Invoice schema migration system.
 *
 * Handles automatic detection and migration of old invoice JSON files
 * to the current schema version.
 *
 * Usage:
 * ```ts
 * import { detectSchemaVersion, migrate, needsMigration } from './migrations';
 *
 * const data = JSON.parse(fileContent);
 * if (needsMigration(data)) {
 *   const migrated = migrate(data);
 *   // Use migrated data...
 * }
 * ```
 */

import {
  type AnyInvoiceSchema,
  CURRENT_SCHEMA_VERSION,
  hasSchemaVersion,
  type InvoiceV1,
  type InvoiceV2,
  type InvoiceV3,
} from "./types";
import { migrateV1ToV2 } from "./v1-to-v2";
import { migrateV2ToV3 } from "./v2-to-v3";

export type {
  AnyInvoiceSchema,
  InvoiceV1,
  InvoiceV2,
  InvoiceV3,
} from "./types";
export { CURRENT_SCHEMA_VERSION } from "./types";

/**
 * Detected schema version result
 */
export interface SchemaDetectionResult {
  version: number;
  confidence: "explicit" | "inferred";
  reason: string;
}

/**
 * Detects the schema version of an invoice JSON object.
 *
 * Detection strategy:
 * 1. If `schemaVersion` field exists, use it (explicit)
 * 2. Otherwise, infer from field presence:
 *    - Has `fromCountry` (string) but no `fromCountryCode` → v1
 *    - Has `fromCountryCode` → v2
 */
export function detectSchemaVersion(data: unknown): SchemaDetectionResult {
  if (!data || typeof data !== "object") {
    return {
      version: CURRENT_SCHEMA_VERSION,
      confidence: "inferred",
      reason: "Invalid data, assuming current version",
    };
  }

  const obj = data as Record<string, unknown>;

  // Check for explicit schema version
  if (hasSchemaVersion(data)) {
    return {
      version: data.schemaVersion,
      confidence: "explicit",
      reason: `Explicit schemaVersion: ${data.schemaVersion}`,
    };
  }

  // Infer version from field presence
  const hasFromCountry =
    "fromCountry" in obj && typeof obj.fromCountry === "string";
  const hasFromCountryCode = "fromCountryCode" in obj;

  // v1: has fromCountry (string), no fromCountryCode
  if (hasFromCountry && !hasFromCountryCode) {
    return {
      version: 1,
      confidence: "inferred",
      reason: "Has 'fromCountry' string field, missing 'fromCountryCode'",
    };
  }

  // v2: has fromCountryCode
  if (hasFromCountryCode) {
    return {
      version: 2,
      confidence: "inferred",
      reason: "Has 'fromCountryCode' field",
    };
  }

  // Default to current if we can't determine
  return {
    version: CURRENT_SCHEMA_VERSION,
    confidence: "inferred",
    reason: "Could not determine version, assuming current",
  };
}

/**
 * Checks if an invoice needs migration to the current schema.
 */
export function needsMigration(data: unknown): boolean {
  const { version } = detectSchemaVersion(data);
  return version < CURRENT_SCHEMA_VERSION;
}

/**
 * Migration result with metadata
 */
export interface MigrationResult {
  /** Migrated data - compatible with InvoiceFormState after merge with defaults */
  data: InvoiceV3;
  fromVersion: number;
  toVersion: number;
  migrationPath: string[];
}

/**
 * Migrates an invoice to the current schema version.
 *
 * Applies migrations sequentially: v1 → v2 → v3 → ...
 * Each migration only handles one version jump.
 */
export function migrate(data: unknown): MigrationResult {
  const detection = detectSchemaVersion(data);
  let currentVersion = detection.version;
  let currentData = data as AnyInvoiceSchema;
  const migrationPath: string[] = [];

  // Apply migrations sequentially
  while (currentVersion < CURRENT_SCHEMA_VERSION) {
    const fromVersion = currentVersion;
    const toVersion = currentVersion + 1;

    switch (currentVersion) {
      case 1:
        currentData = migrateV1ToV2(currentData as InvoiceV1);
        break;

      case 2:
        currentData = migrateV2ToV3(currentData as InvoiceV2);
        break;

      default:
        throw new Error(`No migration path from v${currentVersion}`);
    }

    migrationPath.push(`v${fromVersion} → v${toVersion}`);
    currentVersion = toVersion;
  }

  return {
    data: currentData as InvoiceV3,
    fromVersion: detection.version,
    toVersion: CURRENT_SCHEMA_VERSION,
    migrationPath,
  };
}

/**
 * Validates that an object has all required fields for the current schema.
 * Returns an array of missing field names, or empty array if valid.
 */
export function validateCurrentSchema(data: unknown): string[] {
  if (!data || typeof data !== "object") {
    return ["(invalid data)"];
  }

  const obj = data as Record<string, unknown>;
  // Core required fields that should exist in any valid invoice
  const requiredFields = [
    "documentType",
    "layoutId",
    "styleId",
    "locale",
    "numberLocale",
    "fromName",
    "customerName",
    "lineItems",
    "currency",
  ] as const;

  return requiredFields.filter((field) => !(field in obj));
}

/**
 * Gets a human-readable summary of what will change during migration.
 */
export function getMigrationSummary(data: unknown): string[] {
  const detection = detectSchemaVersion(data);
  const changes: string[] = [];

  if (detection.version === 1) {
    const v1 = data as InvoiceV1;
    changes.push(
      `Convert country names to codes:`,
      `  • fromCountry: "${v1.fromCountry || "(empty)"}" → fromCountryCode`,
      `  • customerCountry: "${v1.customerCountry || "(empty)"}" → customerCountryCode`,
      `Add new fields with defaults:`,
      `  • Shipping address fields (disabled by default)`,
      `  • Registration ID fields (empty by default)`,
      `  • Country visibility toggles`,
    );
  }

  if (detection.version <= 2) {
    changes.push(
      `Add new fields with defaults:`,
      `  • Purchase order number (empty by default)`,
    );
  }

  if (changes.length === 0) {
    changes.push("No migration needed - already at current schema version.");
  }

  return changes;
}
