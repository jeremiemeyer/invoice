import { nanoid } from "nanoid";
import type { InvoiceLocale } from "./translations";
import type { DocumentType, InvoiceFormState, LineItem } from "./types";

export function createLineItem(): LineItem {
  return {
    id: nanoid(),
    name: "",
    quantity: 1,
    price: 0,
  };
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getDueDate(daysFromNow = 30): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
}

function getDocumentPrefix(
  documentType: DocumentType,
  locale: InvoiceLocale,
): string {
  const prefixes = {
    invoice: { "en-US": "INV", "fr-FR": "FA" },
    quote: { "en-US": "QUO", "fr-FR": "DEV" },
  };
  return prefixes[documentType][locale];
}

export function generateDocumentNumber(
  documentType: DocumentType,
  locale: InvoiceLocale,
): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  const prefix = getDocumentPrefix(documentType, locale);
  return `${prefix}-${year}-${random}`;
}

export const defaultInvoiceState: InvoiceFormState = {
  // Document type
  documentType: "invoice",

  // Locale & format
  locale: "en-US",
  numberLocale: "en-US",
  pageSize: "LETTER",

  // From details
  fromName: "",
  fromAddress: "",
  fromCity: "",
  fromCountry: "",
  fromEmail: "",
  fromPhone: "",
  fromTaxId: "",
  fromLogoUrl: "",
  showFromLogo: true,

  // Customer details
  customerName: "",
  customerAddress: "",
  customerCity: "",
  customerCountry: "",
  customerEmail: "",
  customerPhone: "",
  customerTaxId: "",
  customerLogoUrl: "",
  showCustomerLogo: true,

  invoiceNumber: "",
  issueDate: "",
  dueDate: "",

  // Line items - empty for SSR stability, populated by useInvoice after hydration
  lineItems: [],

  // Totals configuration
  currency: "USD",
  taxRate: 0,
  includeTax: false,
  showTaxIfZero: false,
  discount: 0,
  includeDiscount: false,

  // Payment & Notes
  paymentDetails: "",
  notes: "",
};

export function getDefaultState(): InvoiceFormState {
  return {
    ...defaultInvoiceState,
    invoiceNumber: generateDocumentNumber(
      defaultInvoiceState.documentType,
      defaultInvoiceState.locale,
    ),
    issueDate: getToday(),
    dueDate: getDueDate(30),
    lineItems: [createLineItem()],
  };
}
