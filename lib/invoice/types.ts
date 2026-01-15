import type { CountryCode } from "./countries";
import type { InvoiceLocale, NumberLocale, PageSize } from "./translations";

export type DocumentType = "invoice" | "quote";
export type PageMargin = "none" | "small" | "normal";

export interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

export interface InvoiceFormState {
  // Document type & template
  documentType: DocumentType;
  templateId: string;
  /** Layout ID for PDF structure (classic, modern) */
  layoutId: string;
  /** Style ID for PDF styling (classic, classic-mono, elegant) */
  styleId: string;
  /** Page margin size (padding around content) */
  pageMargin: PageMargin;

  // Locale & format
  locale: InvoiceLocale;
  numberLocale: NumberLocale;
  pageSize: PageSize;

  // Country codes for ID labels (determines Tax ID, Registration ID labels)
  /** Your business country - determines ID labels like "N° TVA", "SIRET" */
  fromCountryCode: CountryCode;
  /** Client's country - determines their ID labels */
  customerCountryCode: CountryCode;

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

  // Invoice metadata
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;

  // Line items
  lineItems: LineItem[];

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

export type InvoiceAction =
  | { type: "SET_FIELD"; field: keyof InvoiceFormState; value: unknown }
  | { type: "ADD_LINE_ITEM" }
  | {
      type: "UPDATE_LINE_ITEM";
      id: string;
      field: keyof LineItem;
      value: unknown;
    }
  | { type: "REMOVE_LINE_ITEM"; id: string }
  | { type: "RESET" };

export interface InvoiceTotals {
  subTotal: number;
  tax: number;
  total: number;
}
