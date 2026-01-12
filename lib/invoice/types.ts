import type { InvoiceLocale, NumberLocale, PageSize } from "./translations";

export type DocumentType = "invoice" | "quote";

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

  // Locale & format
  locale: InvoiceLocale;
  numberLocale: NumberLocale;
  pageSize: PageSize;

  // From details
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

  // Customer details
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
