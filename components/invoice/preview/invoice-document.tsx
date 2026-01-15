/**
 * Server-compatible invoice document renderer.
 * This component contains the pure layout without any client-side interactivity.
 * Used for PDF generation and can be wrapped by InvoiceHtmlPreview for interactive preview.
 */
import { calculateLineItemTotal } from "@/lib/invoice/calculate";
import { getCountryConfig } from "@/lib/invoice/countries";
import { formatCurrency } from "@/lib/invoice/format-currency";
import {
  lexicalToHtml,
  parseLexicalState,
} from "@/lib/invoice/lexical-to-html";
import { getTemplate } from "@/lib/invoice/templates";
import {
  getDocumentTypeLabels,
  getLocaleConfig,
  getTranslations,
} from "@/lib/invoice/translations";
import type { InvoiceFormState, InvoiceTotals } from "@/lib/invoice/types";
import { cn } from "@/lib/utils";

export interface InvoiceDocumentProps {
  invoice: InvoiceFormState;
  totals: InvoiceTotals;
  /** Optional wrapper for each section - used by InvoiceHtmlPreview for interactivity */
  renderSection?: (
    children: React.ReactNode,
    props: { stepIndex: number; stepLabel: string; className?: string },
  ) => React.ReactNode;
}

function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "2-digit",
    year: "2-digit",
  });
}

function getInitial(name: string): string {
  return name?.charAt(0)?.toUpperCase() || "?";
}

// Default section wrapper - just renders children with className
const Section = ({
  children,
  stepIndex,
  stepLabel,
  className,
  renderSection,
}: {
  children: React.ReactNode;
  stepIndex: number;
  stepLabel: string;
  className?: string;
  renderSection?: (
    children: React.ReactNode,
    props: { stepIndex: number; stepLabel: string; className?: string },
  ) => React.ReactNode;
}) => {
  if (renderSection) {
    return <>{renderSection(children, { stepIndex, stepLabel, className })}</>;
  }
  return <div className={className}>{children}</div>;
};

export function InvoiceDocument({
  invoice,
  totals,
  renderSection,
}: InvoiceDocumentProps) {
  const t = getTranslations(invoice.locale);
  const docLabels = getDocumentTypeLabels(invoice.locale, invoice.documentType);
  const localeConfig = getLocaleConfig(invoice.locale);
  const template = getTemplate(invoice.templateId);

  // Country-specific ID labels (independent from invoice language)
  const fromCountryConfig = getCountryConfig(invoice.fromCountryCode);
  const customerCountryConfig = getCountryConfig(invoice.customerCountryCode);

  // Template-aware class helpers
  const labelClass = template.colors.label;
  const textClass = template.colors.text;
  const borderClass = template.colors.border;
  const avatarBgClass = template.colors.avatarBg;
  const numberClass = cn("tabular-nums", template.fonts.numbers);
  const labelFontClass = template.fonts.labels;
  const labelWeightClass = template.fonts.labelWeight || "font-semibold";

  return (
    <>
      {/* Invoice Terms - Top bar (Step 4) */}
      <Section
        stepIndex={4}
        stepLabel="Invoice terms"
        className={cn("border-b", borderClass)}
        renderSection={renderSection}
      >
        <div className="grid h-14 grid-cols-2 items-center px-8">
          <div>
            <p
              className={cn(
                "text-[8px] uppercase",
                labelWeightClass,
                labelClass,
                labelFontClass,
              )}
            >
              {docLabels.documentNo}
            </p>
            <p className={cn("text-[10px] font-medium", numberClass)}>
              {invoice.invoiceNumber || "-"}
            </p>
          </div>
          <div className="flex pl-8">
            <div className="min-w-[60px]">
              <p
                className={cn(
                  "text-[8px] uppercase",
                  labelWeightClass,
                  labelClass,
                  labelFontClass,
                )}
              >
                {t.issued}
              </p>
              <p className={cn("text-[10px] font-medium", labelFontClass)}>
                {formatDate(invoice.issueDate, localeConfig.dateLocale)}
              </p>
            </div>
            <div className="ml-6">
              <p
                className={cn(
                  "text-[8px] uppercase",
                  labelWeightClass,
                  labelClass,
                  labelFontClass,
                )}
              >
                {docLabels.dateLabel}
              </p>
              <p className={cn("text-[10px] font-medium", labelFontClass)}>
                {formatDate(invoice.dueDate, localeConfig.dateLocale)}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* From / To Grid */}
      <div
        className={cn(
          "relative grid grid-cols-2 divide-x divide-gray-200 border-b",
          borderClass,
        )}
      >
        {/* Your Company - Left (Step 0) */}
        <Section
          stepIndex={0}
          stepLabel="Your company"
          className="flex flex-col"
          renderSection={renderSection}
        >
          <div className="px-8 py-6">
            <p
              className={cn(
                "pb-2 text-[8px] uppercase",
                labelWeightClass,
                labelClass,
                labelFontClass,
              )}
            >
              {t.from}
            </p>
            {invoice.showFromLogo && (
              <div className="mb-2 flex w-fit flex-1">
                {invoice.fromLogoUrl ? (
                  // biome-ignore lint/performance/noImgElement: Using img for base64/external URLs
                  <img
                    src={invoice.fromLogoUrl}
                    alt={invoice.fromName}
                    className="h-[36px] w-[36px] rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "flex h-[36px] w-[36px] items-center justify-center rounded-full text-base font-medium",
                      avatarBgClass,
                    )}
                  >
                    {getInitial(invoice.fromName)}
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col">
              <div className="mb-2">
                <p className="truncate text-lg font-medium leading-tight">
                  {invoice.fromName || "-"}
                </p>
                {invoice.fromSubtitle && (
                  <p
                    className={cn(
                      "truncate text-[10px] font-medium opacity-80",
                      labelClass,
                    )}
                  >
                    {invoice.fromSubtitle}
                  </p>
                )}
              </div>
              {invoice.fromEmail && (
                <p
                  className={cn("truncate text-[10px] font-medium", textClass)}
                >
                  {invoice.fromEmail}
                </p>
              )}
              {invoice.fromAddress && (
                <p
                  className={cn("truncate text-[10px] font-medium", labelClass)}
                >
                  {invoice.fromAddress}
                </p>
              )}
              {invoice.fromCity && (
                <p
                  className={cn("truncate text-[10px] font-medium", labelClass)}
                >
                  {invoice.fromCity}
                </p>
              )}
              <p className={cn("truncate text-[10px] font-medium", labelClass)}>
                {fromCountryConfig.name}
              </p>
              {invoice.fromPhone && (
                <p
                  className={cn("truncate text-[10px] font-medium", labelClass)}
                >
                  {invoice.fromPhone}
                </p>
              )}
              {invoice.fromTaxId && (
                <p
                  className={cn("truncate text-[10px] font-medium", labelClass)}
                >
                  {fromCountryConfig.taxId.label}: {invoice.fromTaxId}
                </p>
              )}
              {invoice.showFromRegistrationId &&
                invoice.fromRegistrationId &&
                fromCountryConfig.registrationId.available && (
                  <p
                    className={cn(
                      "truncate text-[10px] font-medium",
                      labelClass,
                    )}
                  >
                    {fromCountryConfig.registrationId.label}:{" "}
                    {invoice.fromRegistrationId}
                  </p>
                )}
            </div>
          </div>
        </Section>

        {/* Your Client - Right (Step 1) */}
        <Section
          stepIndex={1}
          stepLabel="Your client"
          className="flex flex-col"
          renderSection={renderSection}
        >
          <div className="px-8 py-6">
            <p
              className={cn(
                "pb-2 text-[8px] uppercase",
                labelWeightClass,
                labelClass,
                labelFontClass,
              )}
            >
              {t.to}
            </p>
            {invoice.showCustomerLogo && (
              <div className="mb-2 flex w-fit flex-1">
                {invoice.customerLogoUrl ? (
                  // biome-ignore lint/performance/noImgElement: Using img for base64/external URLs
                  <img
                    src={invoice.customerLogoUrl}
                    alt={invoice.customerName}
                    className="h-[36px] w-[36px] rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "flex h-[36px] w-[36px] items-center justify-center rounded-full text-base font-medium",
                      avatarBgClass,
                    )}
                  >
                    {getInitial(invoice.customerName)}
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-col">
              <div className="mb-2">
                <p className="truncate text-lg font-medium leading-tight">
                  {invoice.customerName || "-"}
                </p>
                {invoice.customerSubtitle && (
                  <p
                    className={cn(
                      "truncate text-[10px] font-medium opacity-80",
                      labelClass,
                    )}
                  >
                    {invoice.customerSubtitle}
                  </p>
                )}
              </div>
              {invoice.customerEmail && (
                <p
                  className={cn("truncate text-[10px] font-medium", textClass)}
                >
                  {invoice.customerEmail}
                </p>
              )}
              {invoice.customerAddress && (
                <p
                  className={cn("truncate text-[10px] font-medium", labelClass)}
                >
                  {invoice.customerAddress}
                </p>
              )}
              {invoice.customerCity && (
                <p
                  className={cn("truncate text-[10px] font-medium", labelClass)}
                >
                  {invoice.customerCity}
                </p>
              )}
              <p className={cn("truncate text-[10px] font-medium", labelClass)}>
                {customerCountryConfig.name}
              </p>
              {invoice.customerPhone && (
                <p
                  className={cn("truncate text-[10px] font-medium", labelClass)}
                >
                  {invoice.customerPhone}
                </p>
              )}
              {invoice.customerTaxId && (
                <p
                  className={cn("truncate text-[10px] font-medium", labelClass)}
                >
                  {customerCountryConfig.taxId.label}: {invoice.customerTaxId}
                </p>
              )}
              {invoice.showCustomerRegistrationId &&
                invoice.customerRegistrationId &&
                customerCountryConfig.registrationId.available && (
                  <p
                    className={cn(
                      "truncate text-[10px] font-medium",
                      labelClass,
                    )}
                  >
                    {customerCountryConfig.registrationId.label}:{" "}
                    {invoice.customerRegistrationId}
                  </p>
                )}
            </div>
          </div>
        </Section>
      </div>

      {/* Invoice Details - Line items (Step 2) */}
      <Section
        stepIndex={2}
        stepLabel="Invoice details"
        className="flex-1"
        renderSection={renderSection}
      >
        <div className="px-8 py-6">
          {/* Header */}
          <div
            className={cn(
              "grid grid-cols-2 text-[8px] uppercase",
              labelWeightClass,
              labelClass,
              labelFontClass,
            )}
          >
            <div>{t.description}</div>
            <div
              className="grid pl-8"
              style={{ gridTemplateColumns: "60px 1fr 1fr" }}
            >
              <div>{t.qty}</div>
              <div>{t.price}</div>
              <div className="text-right">{t.amount}</div>
            </div>
          </div>

          {/* Line Items */}
          {invoice.lineItems.map((item, index) => (
            <div
              key={item.id || index}
              className={cn(
                "grid min-h-[40px] grid-cols-2 border-b py-3 text-[10px]",
                borderClass,
              )}
            >
              <div className="font-medium">
                {item.name ? (
                  <div
                    className="line-item-content [&_p]:mb-0.5 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_.list-container]:my-0.5 [&_.list-item]:mb-0.5 [&_.list-marker]:text-gray-500 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[8px] [&_code]:font-mono"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: Content is sanitized via lexicalToHtml escaping
                    dangerouslySetInnerHTML={{
                      __html: lexicalToHtml(parseLexicalState(item.name)),
                    }}
                  />
                ) : (
                  "-"
                )}
              </div>
              <div
                className="grid pl-8"
                style={{ gridTemplateColumns: "60px 1fr 1fr" }}
              >
                <p
                  className={cn("truncate font-medium", textClass, numberClass)}
                >
                  {item.quantity}
                </p>
                <p
                  className={cn(
                    "font-medium whitespace-nowrap",
                    textClass,
                    numberClass,
                  )}
                >
                  {formatCurrency(
                    item.price,
                    invoice.currency,
                    invoice.numberLocale,
                  )}
                </p>
                <p
                  className={cn(
                    "text-right font-medium whitespace-nowrap",
                    textClass,
                    numberClass,
                  )}
                >
                  {formatCurrency(
                    calculateLineItemTotal({
                      price: item.price,
                      quantity: item.quantity,
                    }),
                    invoice.currency,
                    invoice.numberLocale,
                  )}
                </p>
              </div>
            </div>
          ))}

          {/* Note + Totals */}
          <div className="grid grid-cols-2 py-3">
            {/* Note */}
            <div className="pr-6">
              <div className="flex min-h-[40px] items-center py-2">
                <p
                  className={cn(
                    "text-[10px]",
                    labelWeightClass,
                    labelClass,
                    labelFontClass,
                  )}
                >
                  {t.note}
                </p>
              </div>
              <p
                className={cn(
                  "whitespace-pre-wrap text-[8px] font-medium",
                  labelClass,
                )}
              >
                {invoice.notes || "-"}
              </p>
            </div>

            {/* Totals */}
            <div className="pl-8">
              {/* Subtotal */}
              <div
                className={cn(
                  "grid min-h-[40px] grid-cols-3 items-center border-b py-2",
                  borderClass,
                )}
              >
                <div
                  className={cn(
                    "text-[10px] font-medium",
                    labelClass,
                    labelFontClass,
                  )}
                >
                  {t.subtotal}
                </div>
                <p
                  className={cn(
                    "col-span-2 text-right text-[10px] font-medium",
                    textClass,
                    numberClass,
                  )}
                >
                  {formatCurrency(
                    totals.subTotal,
                    invoice.currency,
                    invoice.numberLocale,
                  )}
                </p>
              </div>

              {/* Discount */}
              {invoice.includeDiscount && invoice.discount > 0 && (
                <div
                  className={cn(
                    "grid min-h-[40px] grid-cols-3 items-center border-b py-2",
                    borderClass,
                  )}
                >
                  <div
                    className={cn(
                      "text-[10px] font-medium",
                      labelClass,
                      labelFontClass,
                    )}
                  >
                    {t.discount}
                  </div>
                  <p
                    className={cn(
                      "col-span-2 text-right text-[10px] font-medium",
                      textClass,
                      numberClass,
                    )}
                  >
                    -
                    {formatCurrency(
                      invoice.discount,
                      invoice.currency,
                      invoice.numberLocale,
                    )}
                  </p>
                </div>
              )}

              {/* Tax */}
              {(invoice.showTaxIfZero ||
                (invoice.includeTax && invoice.taxRate > 0)) && (
                <div
                  className={cn(
                    "grid min-h-[40px] grid-cols-3 items-center border-b py-2",
                    borderClass,
                  )}
                >
                  <div
                    className={cn(
                      "text-[10px] font-medium",
                      labelClass,
                      labelFontClass,
                    )}
                  >
                    {t.tax} ({invoice.taxRate}%)
                  </div>
                  <p
                    className={cn(
                      "col-span-2 text-right text-[10px] font-medium",
                      textClass,
                      numberClass,
                    )}
                  >
                    {formatCurrency(
                      totals.tax,
                      invoice.currency,
                      invoice.numberLocale,
                    )}
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="grid min-h-[40px] grid-cols-3 items-center py-2">
                <div
                  className={cn(
                    "text-[10px] font-medium",
                    labelClass,
                    labelFontClass,
                  )}
                >
                  {t.total}
                </div>
                <p
                  className={cn(
                    "col-span-2 text-right text-sm font-medium",
                    template.colors.accent || "",
                    numberClass,
                  )}
                >
                  {formatCurrency(
                    totals.total,
                    invoice.currency,
                    invoice.numberLocale,
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Payment Method - Bottom (Step 3) */}
      <Section
        stepIndex={3}
        stepLabel="Payment details"
        className={cn("border-t", borderClass)}
        renderSection={renderSection}
      >
        <div className="grid grid-cols-2 px-8 py-6">
          <div className="pr-6">
            <p
              className={cn(
                "text-[8px] uppercase",
                labelWeightClass,
                labelClass,
                labelFontClass,
              )}
            >
              {t.paymentDetails}
            </p>
            <p
              className={cn(
                "mt-1 whitespace-pre-wrap text-[9px] font-medium",
                textClass,
              )}
            >
              {invoice.paymentDetails || "-"}
            </p>
          </div>
          {invoice.paymentDetailsSecondary && (
            <div className="pl-8">
              <p
                className={cn(
                  "text-[8px] uppercase",
                  labelWeightClass,
                  labelClass,
                  labelFontClass,
                )}
              >
                &nbsp;
              </p>
              <p
                className={cn(
                  "mt-1 whitespace-pre-wrap text-[9px] font-medium",
                  textClass,
                )}
              >
                {invoice.paymentDetailsSecondary}
              </p>
            </div>
          )}
        </div>
      </Section>
    </>
  );
}
