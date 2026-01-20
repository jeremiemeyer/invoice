/**
 * Schema V1 - Original invoice format
 *
 * FROZEN - Do not modify
 *
 * Characteristics:
 * - Country as string (e.g., "France", "United States")
 * - No shipping address fields
 * - No registration ID fields
 * - No country visibility toggles
 * - No schemaVersion field
 */

export interface LineItemV1 {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

export interface InvoiceV1 {
  // No schemaVersion in V1

  // Document type & template
  documentType: "invoice" | "quote";
  templateId: string;
  layoutId: string;
  styleId: string;
  pageMargin: "none" | "small" | "normal";

  // Locale & format
  locale: string;
  numberLocale: string;
  pageSize: "A4" | "LETTER";

  // From details - V1: country as string
  fromName: string;
  fromSubtitle: string;
  fromAddress: string;
  fromCity: string;
  fromCountry: string;
  fromEmail: string;
  fromPhone: string;
  fromTaxId: string;
  fromLogoUrl: string;
  showFromLogo: boolean;

  // Customer details - V1: country as string
  customerName: string;
  customerSubtitle: string;
  customerAddress: string;
  customerCity: string;
  customerCountry: string;
  customerEmail: string;
  customerPhone: string;
  customerTaxId: string;
  customerLogoUrl: string;
  showCustomerLogo: boolean;

  // Invoice metadata
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;

  // Line items
  lineItems: LineItemV1[];

  // Totals configuration
  currency: string;
  taxRate: number;
  includeTax: boolean;
  showTaxIfZero: boolean;
  discount: number;
  includeDiscount: boolean;

  // Payment & Notes
  paymentDetails: string;
  paymentDetailsSecondary?: string;
  notes: string;
}
