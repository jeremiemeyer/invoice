export type InvoiceLocale = "en-US" | "fr-FR";
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
    id: "fr",
    label: "France",
    locale: "fr-FR",
    numberLocale: "fr-FR",
    currency: "EUR",
    pageSize: "A4",
    countryCode: "fr",
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
  { value: "en-US", label: "English", countryCode: "us" },
  { value: "fr-FR", label: "Français", countryCode: "fr" },
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
  taxId: string;
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
    taxId: "Tax ID",
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
    taxId: "N° SIRET",
  },
};

export const localeConfig: Record<InvoiceLocale, { dateLocale: string }> = {
  "en-US": { dateLocale: "en-US" },
  "fr-FR": { dateLocale: "fr-FR" },
};

export const pageSizeConfig: Record<
  PageSize,
  { previewWidth: number; previewHeight: number }
> = {
  LETTER: {
    // Letter: 8.5 x 11 inches (ratio 1:1.294)
    previewWidth: 612,
    previewHeight: 792,
  },
  A4: {
    // A4: 210 x 297 mm (ratio 1:1.414)
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
