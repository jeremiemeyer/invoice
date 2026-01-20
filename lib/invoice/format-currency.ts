export function formatCurrency(
  amount: number,
  currency: string,
  locale = "en-US",
): string {
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  // Normalize narrow no-break space (U+202F) to regular no-break space (U+00A0)
  // French locale uses U+202F as thousands separator, which is not supported
  // by react-pdf fonts. U+00A0 is more widely supported and keeps the non-breaking behavior.
  return formatted.replace(/\u202F/g, "\u00A0");
}

export function formatCurrencyForPdf(
  amount: number,
  currency: string,
  locale = "en-US",
): string {
  // Handle negative amounts specially for PDF (react-pdf has issues with minus signs)
  const isNegative = amount < 0;
  const absoluteAmount = Math.abs(amount);
  const formatted = formatCurrency(absoluteAmount, currency, locale);
  return isNegative ? `(${formatted})` : formatted;
}
