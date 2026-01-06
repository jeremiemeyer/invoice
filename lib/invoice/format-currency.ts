export function formatCurrency(
  amount: number,
  currency: string,
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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
