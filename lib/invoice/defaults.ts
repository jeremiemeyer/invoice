import { nanoid } from "nanoid";
import { DEFAULT_LAYOUT_ID } from "./layouts";
import { DEFAULT_TEMPLATE_ID } from "./templates";
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
    invoice: {
      "en-US": "INV",
      "en-GB": "INV",
      "en-AU": "INV",
      "fr-FR": "FA",
      "de-DE": "RE",
      "de-CH": "RE",
      "es-ES": "FAC",
      "pt-PT": "FT",
    },
    quote: {
      "en-US": "QUO",
      "en-GB": "QUO",
      "en-AU": "QUO",
      "fr-FR": "DEV",
      "de-DE": "ANG",
      "de-CH": "OFF",
      "es-ES": "PRE",
      "pt-PT": "ORC",
    },
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
  // Document type & template
  documentType: "invoice",
  templateId: DEFAULT_TEMPLATE_ID,
  layoutId: DEFAULT_LAYOUT_ID,
  styleId: "classic",
  pageMargin: "none",

  // Locale & format
  locale: "en-US",
  numberLocale: "en-US",
  pageSize: "LETTER",

  // Country codes for ID labels
  fromCountryCode: "US",
  customerCountryCode: "US",

  // From details
  fromName: "",
  fromSubtitle: "",
  fromAddress: "",
  fromCity: "",
  fromEmail: "",
  fromPhone: "",
  fromTaxId: "",
  fromRegistrationId: "",
  showFromRegistrationId: true,
  fromLogoUrl: "",
  showFromLogo: true,

  // Customer details
  customerName: "",
  customerSubtitle: "",
  customerAddress: "",
  customerCity: "",
  customerEmail: "",
  customerPhone: "",
  customerTaxId: "",
  customerRegistrationId: "",
  showCustomerRegistrationId: true,
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
  paymentDetailsSecondary: "",
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
