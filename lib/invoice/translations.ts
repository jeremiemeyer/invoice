import type { DocumentType } from "./types";

export type InvoiceLocale =
  | "en-US"
  | "en-GB"
  | "en-AU"
  | "fr-FR"
  | "de-DE"
  | "de-CH"
  | "es-ES"
  | "pt-PT";
export type NumberLocale = "en-US" | "fr-FR" | "de-DE" | "de-CH";
export type PageSize = "A4" | "LETTER";

// Preset combining all settings
export interface InvoicePreset {
  id: string;
  label: string;
  locale: InvoiceLocale;
  numberLocale: NumberLocale;
  currency: string;
  pageSize: PageSize;
  countryCode: string;
}

export const INVOICE_PRESETS: InvoicePreset[] = [
  {
    id: "us",
    label: "United States",
    locale: "en-US",
    numberLocale: "en-US",
    currency: "USD",
    pageSize: "LETTER",
    countryCode: "us",
  },
  {
    id: "gb",
    label: "United Kingdom",
    locale: "en-GB",
    numberLocale: "en-US",
    currency: "GBP",
    pageSize: "A4",
    countryCode: "gb",
  },
  {
    id: "au",
    label: "Australia",
    locale: "en-AU",
    numberLocale: "en-US",
    currency: "AUD",
    pageSize: "A4",
    countryCode: "au",
  },
  {
    id: "fr",
    label: "France",
    locale: "fr-FR",
    numberLocale: "fr-FR",
    currency: "EUR",
    pageSize: "A4",
    countryCode: "fr",
  },
  {
    id: "de",
    label: "Deutschland",
    locale: "de-DE",
    numberLocale: "de-DE",
    currency: "EUR",
    pageSize: "A4",
    countryCode: "de",
  },
  {
    id: "ch",
    label: "Schweiz",
    locale: "de-CH",
    numberLocale: "de-CH",
    currency: "CHF",
    pageSize: "A4",
    countryCode: "ch",
  },
  {
    id: "es",
    label: "España",
    locale: "es-ES",
    numberLocale: "de-DE",
    currency: "EUR",
    pageSize: "A4",
    countryCode: "es",
  },
  {
    id: "pt",
    label: "Portugal",
    locale: "pt-PT",
    numberLocale: "de-DE",
    currency: "EUR",
    pageSize: "A4",
    countryCode: "pt",
  },
];

export function getPresetFromSettings(
  locale: InvoiceLocale,
  numberLocale: NumberLocale,
  currency: string,
  pageSize: PageSize,
): InvoicePreset | null {
  return (
    INVOICE_PRESETS.find(
      (p) =>
        p.locale === locale &&
        p.numberLocale === numberLocale &&
        p.currency === currency &&
        p.pageSize === pageSize,
    ) || null
  );
}

// Currencies
export interface CurrencyOption {
  value: string;
  label: string;
  countryCode: string;
}

export const CURRENCIES: CurrencyOption[] = [
  { value: "USD", label: "US Dollar", countryCode: "us" },
  { value: "EUR", label: "Euro", countryCode: "eu" },
  { value: "GBP", label: "British Pound", countryCode: "gb" },
  { value: "CAD", label: "Canadian Dollar", countryCode: "ca" },
  { value: "AUD", label: "Australian Dollar", countryCode: "au" },
  { value: "JPY", label: "Japanese Yen", countryCode: "jp" },
  { value: "CHF", label: "Swiss Franc", countryCode: "ch" },
];

// Languages
export interface LanguageOption {
  value: InvoiceLocale;
  label: string;
  countryCode: string;
}

export const LANGUAGES: LanguageOption[] = [
  { value: "en-US", label: "English (US)", countryCode: "us" },
  { value: "en-GB", label: "English (UK)", countryCode: "gb" },
  { value: "en-AU", label: "English (AU)", countryCode: "au" },
  { value: "fr-FR", label: "Français", countryCode: "fr" },
  { value: "de-DE", label: "Deutsch", countryCode: "de" },
  { value: "de-CH", label: "Deutsch (CH)", countryCode: "ch" },
  { value: "es-ES", label: "Español", countryCode: "es" },
  { value: "pt-PT", label: "Português", countryCode: "pt" },
];

// Paper sizes
export interface PaperSizeOption {
  value: PageSize;
  label: string;
  dimensions: string;
}

export const PAPER_SIZES: PaperSizeOption[] = [
  { value: "LETTER", label: "Letter", dimensions: "8.5 × 11 in" },
  { value: "A4", label: "A4", dimensions: "210 × 297 mm" },
];

// Number formats (decimal/thousand separators)
export interface NumberFormatOption {
  value: NumberLocale;
  label: string;
  example: string;
}

export const NUMBER_FORMATS: NumberFormatOption[] = [
  { value: "en-US", label: "1,234.56", example: "US/UK" },
  { value: "fr-FR", label: "1 234,56", example: "France" },
  { value: "de-DE", label: "1.234,56", example: "Germany" },
  { value: "de-CH", label: "1'234.56", example: "Switzerland" },
];

export interface InvoiceTranslations {
  invoiceNo: string;
  issued: string;
  dueDate: string;
  from: string;
  to: string;
  description: string;
  qty: string;
  price: string;
  amount: string;
  note: string;
  subtotal: string;
  discount: string;
  tax: string;
  total: string;
  paymentDetails: string;
  // Note: taxId and registrationId labels are now in countries.ts
  // They are country-specific (SIRET, ABN, etc.), not language-specific
}

export const translations: Record<InvoiceLocale, InvoiceTranslations> = {
  "en-US": {
    invoiceNo: "Invoice No",
    issued: "Issued",
    dueDate: "Due date",
    from: "From",
    to: "To",
    description: "Description",
    qty: "Qty",
    price: "Price",
    amount: "Amount",
    note: "Note",
    subtotal: "Subtotal",
    discount: "Discount",
    tax: "Tax",
    total: "Total",
    paymentDetails: "Payment Details",
  },
  "en-AU": {
    invoiceNo: "Invoice No",
    issued: "Issued",
    dueDate: "Due date",
    from: "From",
    to: "To",
    description: "Description",
    qty: "Qty",
    price: "Price",
    amount: "Amount",
    note: "Note",
    subtotal: "Subtotal",
    discount: "Discount",
    tax: "GST",
    total: "Total",
    paymentDetails: "Payment Details",
  },
  "fr-FR": {
    invoiceNo: "Facture N°",
    issued: "Date",
    dueDate: "Echéance",
    from: "De",
    to: "À",
    description: "Description",
    qty: "Qté",
    price: "Prix",
    amount: "Montant",
    note: "Note",
    subtotal: "Sous-total",
    discount: "Remise",
    tax: "TVA",
    total: "Total",
    paymentDetails: "Coordonnées bancaires",
  },
  "es-ES": {
    invoiceNo: "Factura N°",
    issued: "Fecha",
    dueDate: "Vencimiento",
    from: "De",
    to: "Para",
    description: "Descripción",
    qty: "Cant.",
    price: "Precio",
    amount: "Importe",
    note: "Nota",
    subtotal: "Subtotal",
    discount: "Descuento",
    tax: "IVA",
    total: "Total",
    paymentDetails: "Datos bancarios",
  },
  "en-GB": {
    invoiceNo: "Invoice No",
    issued: "Issued",
    dueDate: "Due date",
    from: "From",
    to: "To",
    description: "Description",
    qty: "Qty",
    price: "Price",
    amount: "Amount",
    note: "Note",
    subtotal: "Subtotal",
    discount: "Discount",
    tax: "VAT",
    total: "Total",
    paymentDetails: "Payment Details",
  },
  "de-DE": {
    invoiceNo: "Rechnung Nr.",
    issued: "Datum",
    dueDate: "Fällig am",
    from: "Von",
    to: "An",
    description: "Beschreibung",
    qty: "Menge",
    price: "Preis",
    amount: "Betrag",
    note: "Hinweis",
    subtotal: "Zwischensumme",
    discount: "Rabatt",
    tax: "MwSt.",
    total: "Gesamt",
    paymentDetails: "Bankverbindung",
  },
  "de-CH": {
    invoiceNo: "Rechnung Nr.",
    issued: "Datum",
    dueDate: "Fällig am",
    from: "Von",
    to: "An",
    description: "Beschreibung",
    qty: "Menge",
    price: "Preis",
    amount: "Betrag",
    note: "Hinweis",
    subtotal: "Zwischensumme",
    discount: "Rabatt",
    tax: "MwSt.",
    total: "Total",
    paymentDetails: "Bankverbindung",
  },
  "pt-PT": {
    invoiceNo: "Fatura N°",
    issued: "Data",
    dueDate: "Vencimento",
    from: "De",
    to: "Para",
    description: "Descrição",
    qty: "Qtd.",
    price: "Preço",
    amount: "Valor",
    note: "Nota",
    subtotal: "Subtotal",
    discount: "Desconto",
    tax: "IVA",
    total: "Total",
    paymentDetails: "Dados bancários",
  },
};

export const localeConfig: Record<InvoiceLocale, { dateLocale: string }> = {
  "en-US": { dateLocale: "en-US" },
  "en-GB": { dateLocale: "en-GB" },
  "en-AU": { dateLocale: "en-AU" },
  "fr-FR": { dateLocale: "fr-FR" },
  "de-DE": { dateLocale: "de-DE" },
  "de-CH": { dateLocale: "de-CH" },
  "es-ES": { dateLocale: "es-ES" },
  "pt-PT": { dateLocale: "pt-PT" },
};

export const pageSizeConfig: Record<
  PageSize,
  { previewWidth: number; previewHeight: number }
> = {
  LETTER: {
    // Letter: 8.5 x 11 inches in PDF points
    previewWidth: 612,
    previewHeight: 792,
  },
  A4: {
    // A4: 210 x 297 mm in PDF points
    previewWidth: 595,
    previewHeight: 842,
  },
};

export function getTranslations(locale: InvoiceLocale): InvoiceTranslations {
  return translations[locale];
}

export function getLocaleConfig(locale: InvoiceLocale) {
  return localeConfig[locale];
}

export function getPageSizeConfig(pageSize: PageSize) {
  return pageSizeConfig[pageSize];
}

// Document type specific labels
export interface DocumentTypeLabels {
  documentNo: string;
  dateLabel: string;
  newDocument: string;
}

export const documentTypeLabels: Record<
  InvoiceLocale,
  Record<DocumentType, DocumentTypeLabels>
> = {
  "en-US": {
    invoice: {
      documentNo: "Invoice No",
      dateLabel: "Due date",
      newDocument: "New Invoice",
    },
    quote: {
      documentNo: "Quote No",
      dateLabel: "Valid until",
      newDocument: "New Quote",
    },
  },
  "en-AU": {
    invoice: {
      documentNo: "Invoice No",
      dateLabel: "Due date",
      newDocument: "New Invoice",
    },
    quote: {
      documentNo: "Quote No",
      dateLabel: "Valid until",
      newDocument: "New Quote",
    },
  },
  "fr-FR": {
    invoice: {
      documentNo: "Facture N°",
      dateLabel: "Echéance",
      newDocument: "Nouvelle Facture",
    },
    quote: {
      documentNo: "Devis N°",
      dateLabel: "Validité",
      newDocument: "Nouveau Devis",
    },
  },
  "es-ES": {
    invoice: {
      documentNo: "Factura N°",
      dateLabel: "Vencimiento",
      newDocument: "Nueva Factura",
    },
    quote: {
      documentNo: "Presupuesto N°",
      dateLabel: "Válido hasta",
      newDocument: "Nuevo Presupuesto",
    },
  },
  "en-GB": {
    invoice: {
      documentNo: "Invoice No",
      dateLabel: "Due date",
      newDocument: "New Invoice",
    },
    quote: {
      documentNo: "Quote No",
      dateLabel: "Valid until",
      newDocument: "New Quote",
    },
  },
  "de-DE": {
    invoice: {
      documentNo: "Rechnung Nr.",
      dateLabel: "Fällig am",
      newDocument: "Neue Rechnung",
    },
    quote: {
      documentNo: "Angebot Nr.",
      dateLabel: "Gültig bis",
      newDocument: "Neues Angebot",
    },
  },
  "de-CH": {
    invoice: {
      documentNo: "Rechnung Nr.",
      dateLabel: "Fällig am",
      newDocument: "Neue Rechnung",
    },
    quote: {
      documentNo: "Offerte Nr.",
      dateLabel: "Gültig bis",
      newDocument: "Neue Offerte",
    },
  },
  "pt-PT": {
    invoice: {
      documentNo: "Fatura N°",
      dateLabel: "Vencimento",
      newDocument: "Nova Fatura",
    },
    quote: {
      documentNo: "Orçamento N°",
      dateLabel: "Válido até",
      newDocument: "Novo Orçamento",
    },
  },
};

export function getDocumentTypeLabels(
  locale: InvoiceLocale,
  documentType: DocumentType,
): DocumentTypeLabels {
  return documentTypeLabels[locale][documentType];
}
