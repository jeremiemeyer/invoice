/**
 * Schema V2 - Current invoice format (Jan 2026)
 *
 * FROZEN - Do not modify, create V3 instead
 *
 * Changes from V1:
 * - fromCountry/customerCountry strings → fromCountryCode/customerCountryCode
 * - Added showFromCountry, showCustomerCountry visibility toggles
 * - Added shipping address fields
 * - Added registration ID fields (SIRET, etc.)
 * - Added schemaVersion field
 */

import type { CountryCode } from "../countries";
import type { InvoiceLocale, NumberLocale, PageSize } from "../translations";

export interface LineItemV2 {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

export interface InvoiceV2 {
  schemaVersion: 2;

  // Document type & template
  documentType: "invoice" | "quote";
  templateId: string;
  layoutId: string;
  styleId: string;
  pageMargin: "none" | "small" | "normal";

  // Locale & format
  locale: InvoiceLocale;
  numberLocale: NumberLocale;
  pageSize: PageSize;

  // Country codes (V2: replaced country strings)
  fromCountryCode: CountryCode;
  showFromCountry: boolean;
  customerCountryCode: CountryCode;
  showCustomerCountry: boolean;

  // From details
  fromName: string;
  fromSubtitle: string;
  fromAddress: string;
  fromCity: string;
  fromEmail: string;
  fromPhone: string;
  fromTaxId: string;
  fromRegistrationId: string;
  showFromRegistrationId: boolean;
  fromLogoUrl: string;
  showFromLogo: boolean;

  // Customer details
  customerName: string;
  customerSubtitle: string;
  customerAddress: string;
  customerCity: string;
  customerEmail: string;
  customerPhone: string;
  customerTaxId: string;
  customerRegistrationId: string;
  showCustomerRegistrationId: boolean;
  customerLogoUrl: string;
  showCustomerLogo: boolean;

  // Shipping address (V2: new)
  hasSeparateShippingAddress: boolean;
  shippingName: string;
  shippingSubtitle: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPhone: string;

  // Invoice metadata
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;

  // Line items
  lineItems: LineItemV2[];

  // Totals configuration
  currency: string;
  taxRate: number;
  includeTax: boolean;
  showTaxIfZero: boolean;
  discount: number;
  includeDiscount: boolean;

  // Payment & Notes
  paymentDetails: string;
  paymentDetailsSecondary: string;
  notes: string;
}
