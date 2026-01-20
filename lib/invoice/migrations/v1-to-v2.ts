/**
 * Migration from schema v1 to v2
 *
 * Changes:
 * - `fromCountry` (string) → `fromCountryCode` (CountryCode) + `showFromCountry` (boolean)
 * - `customerCountry` (string) → `customerCountryCode` (CountryCode) + `showCustomerCountry` (boolean)
 * - Added shipping address fields (all default to empty/false)
 * - Added registration ID fields (all default to empty/true)
 * - Added `schemaVersion: 2`
 */

import type { CountryCode } from "../countries";
import type { InvoiceV1, InvoiceV2 } from "../schemas";
import type { InvoiceLocale, NumberLocale } from "../translations";

/**
 * Maps country name strings to country codes.
 * Handles common variations and case-insensitivity.
 */
function countryNameToCode(countryName: string | undefined): CountryCode {
  if (!countryName) return "US";

  const normalized = countryName.toLowerCase().trim();

  const mapping: Record<string, CountryCode> = {
    // United States
    "united states": "US",
    "united states of america": "US",
    usa: "US",
    us: "US",
    "u.s.": "US",
    "u.s.a.": "US",

    // United Kingdom
    "united kingdom": "GB",
    uk: "GB",
    gb: "GB",
    "great britain": "GB",
    england: "GB",
    britain: "GB",

    // Australia
    australia: "AU",
    au: "AU",

    // France
    france: "FR",
    fr: "FR",

    // Germany
    germany: "DE",
    deutschland: "DE",
    de: "DE",

    // Switzerland
    switzerland: "CH",
    suisse: "CH",
    schweiz: "CH",
    svizzera: "CH",
    ch: "CH",

    // Spain
    spain: "ES",
    españa: "ES",
    espana: "ES",
    es: "ES",

    // Portugal
    portugal: "PT",
    pt: "PT",
  };

  return mapping[normalized] || "US";
}

/**
 * Migrates an invoice from v1 to v2 schema.
 */
export function migrateV1ToV2(v1: InvoiceV1): InvoiceV2 {
  // Determine if country was filled (to decide showCountry default)
  const hadFromCountry = Boolean(v1.fromCountry?.trim());
  const hadCustomerCountry = Boolean(v1.customerCountry?.trim());

  return {
    schemaVersion: 2,

    // Document type & template (unchanged)
    documentType: v1.documentType,
    templateId: v1.templateId,
    layoutId: v1.layoutId,
    styleId: v1.styleId,
    pageMargin: v1.pageMargin,

    // Locale & format (cast to proper types)
    locale: v1.locale as InvoiceLocale,
    numberLocale: v1.numberLocale as NumberLocale,
    pageSize: v1.pageSize,

    // Country codes - MIGRATED from strings
    fromCountryCode: countryNameToCode(v1.fromCountry),
    showFromCountry: hadFromCountry,
    customerCountryCode: countryNameToCode(v1.customerCountry),
    showCustomerCountry: hadCustomerCountry,

    // From details (unchanged, except country removed)
    fromName: v1.fromName,
    fromSubtitle: v1.fromSubtitle,
    fromAddress: v1.fromAddress,
    fromCity: v1.fromCity,
    fromEmail: v1.fromEmail,
    fromPhone: v1.fromPhone,
    fromTaxId: v1.fromTaxId,
    fromLogoUrl: v1.fromLogoUrl,
    showFromLogo: v1.showFromLogo,

    // NEW: Registration ID fields (default to empty, visible)
    fromRegistrationId: "",
    showFromRegistrationId: true,

    // Customer details (unchanged, except country removed)
    customerName: v1.customerName,
    customerSubtitle: v1.customerSubtitle,
    customerAddress: v1.customerAddress,
    customerCity: v1.customerCity,
    customerEmail: v1.customerEmail,
    customerPhone: v1.customerPhone,
    customerTaxId: v1.customerTaxId,
    customerLogoUrl: v1.customerLogoUrl,
    showCustomerLogo: v1.showCustomerLogo,

    // NEW: Customer registration ID fields
    customerRegistrationId: "",
    showCustomerRegistrationId: true,

    // NEW: Shipping address fields (default to disabled/empty)
    hasSeparateShippingAddress: false,
    shippingName: "",
    shippingSubtitle: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPhone: "",

    // Invoice metadata (unchanged)
    invoiceNumber: v1.invoiceNumber,
    issueDate: v1.issueDate,
    dueDate: v1.dueDate,

    // Line items (unchanged)
    lineItems: v1.lineItems,

    // Totals configuration (unchanged)
    currency: v1.currency,
    taxRate: v1.taxRate,
    includeTax: v1.includeTax,
    showTaxIfZero: v1.showTaxIfZero,
    discount: v1.discount,
    includeDiscount: v1.includeDiscount,

    // Payment & Notes (unchanged, handle optional secondary)
    paymentDetails: v1.paymentDetails,
    paymentDetailsSecondary: v1.paymentDetailsSecondary || "",
    notes: v1.notes,
  };
}
