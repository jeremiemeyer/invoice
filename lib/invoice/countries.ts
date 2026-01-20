/**
 * Country-specific ID configurations
 *
 * Tax ID labels (SIRET, ABN, VAT No.) are tied to the business's COUNTRY,
 * not the invoice language. A French company writing an invoice in English
 * should still show "SIRET" and "N° TVA".
 */

export type CountryCode = "US" | "GB" | "AU" | "FR" | "DE" | "CH" | "ES" | "PT";

export interface CountryIdConfig {
  code: CountryCode;
  name: string;
  flag: string; // for CircleFlag component
  taxId: {
    label: string;
    placeholder: string;
  };
  registrationId: {
    label: string;
    placeholder: string;
    available: boolean; // some countries don't have a standard registration ID
  };
}

export const COUNTRIES: CountryIdConfig[] = [
  {
    code: "US",
    name: "United States",
    flag: "us",
    taxId: { label: "EIN", placeholder: "12-3456789" },
    registrationId: {
      label: "State Reg. No.",
      placeholder: "123456789",
      available: true,
    },
  },
  {
    code: "GB",
    name: "United Kingdom",
    flag: "gb",
    taxId: { label: "VAT No.", placeholder: "GB123456789" },
    registrationId: {
      label: "Co. Reg. No.",
      placeholder: "12345678",
      available: true,
    },
  },
  {
    code: "AU",
    name: "Australia",
    flag: "au",
    taxId: { label: "ABN", placeholder: "12 345 678 901" },
    registrationId: {
      label: "ACN",
      placeholder: "123 456 789",
      available: true,
    },
  },
  {
    code: "FR",
    name: "France",
    flag: "fr",
    taxId: { label: "N° TVA", placeholder: "FR12345678901" },
    registrationId: {
      label: "N° SIRET",
      placeholder: "123 456 789 00012",
      available: true,
    },
  },
  {
    code: "DE",
    name: "Germany",
    flag: "de",
    taxId: { label: "USt-IdNr.", placeholder: "DE123456789" },
    registrationId: { label: "HRB", placeholder: "HRB 12345", available: true },
  },
  {
    code: "CH",
    name: "Switzerland",
    flag: "ch",
    taxId: { label: "MwSt-Nr.", placeholder: "CHE-123.456.789 MWST" },
    registrationId: {
      label: "UID",
      placeholder: "CHE-123.456.789",
      available: true,
    },
  },
  {
    code: "ES",
    name: "Spain",
    flag: "es",
    taxId: { label: "NIF", placeholder: "A12345678" },
    registrationId: {
      label: "Reg. Mercantil",
      placeholder: "Tomo 1234, Folio 56",
      available: true,
    },
  },
  {
    code: "PT",
    name: "Portugal",
    flag: "pt",
    taxId: { label: "NIF/NIPC", placeholder: "123456789" },
    registrationId: {
      label: "NIPC",
      placeholder: "123456789",
      available: false, // Same as NIF for companies, no separate registration ID in Portugal
    },
  },
];

/**
 * Get country configuration by country code
 */
export function getCountryConfig(code: CountryCode): CountryIdConfig {
  const country = COUNTRIES.find((c) => c.code === code);
  if (!country) {
    // Fallback to US if not found (US is guaranteed to exist in COUNTRIES array)
    const fallback = COUNTRIES.find((c) => c.code === "US");
    if (fallback) return fallback;
    return COUNTRIES[0];
  }
  return country;
}

/**
 * Derive country code from locale (for backward compatibility)
 * Maps locale like "fr-FR" to country code "FR"
 */
export function deriveCountryFromLocale(locale: string): CountryCode {
  const mapping: Record<string, CountryCode> = {
    "en-US": "US",
    "en-GB": "GB",
    "en-AU": "AU",
    "fr-FR": "FR",
    "de-DE": "DE",
    "de-CH": "CH",
    "es-ES": "ES",
    "pt-PT": "PT",
  };
  return mapping[locale] ?? "US";
}
