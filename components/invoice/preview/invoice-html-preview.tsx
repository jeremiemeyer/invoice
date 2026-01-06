"use client";

import { PencilEdit01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { CircleFlag } from "react-circle-flags";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { calculateLineItemTotal } from "@/lib/invoice/calculate";
import { formatCurrency } from "@/lib/invoice/format-currency";
import {
  lexicalToHtml,
  parseLexicalState,
} from "@/lib/invoice/lexical-to-html";
import {
  CURRENCIES,
  getLocaleConfig,
  getPageSizeConfig,
  getPresetFromSettings,
  getTranslations,
  INVOICE_PRESETS,
  type InvoiceLocale,
  LANGUAGES,
  PAPER_SIZES,
  type PageSize,
} from "@/lib/invoice/translations";
import type { InvoiceFormState, InvoiceTotals } from "@/lib/invoice/types";
import { cn } from "@/lib/utils";

// Reusable dropdown trigger classes
const dropdownTriggerClasses = cn(
  buttonVariants({ variant: "outline", size: "default" }),
  "w-full justify-start",
);

interface InvoiceHtmlPreviewProps {
  invoice: InvoiceFormState;
  totals: InvoiceTotals;
  currentStep: number;
  onStepClick: (step: number) => void;
  onLocaleChange: (locale: InvoiceLocale) => void;
  onCurrencyChange: (currency: string) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
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

interface PreviewSectionProps {
  stepIndex: number;
  stepLabel: string;
  currentStep: number;
  onStepClick: (step: number) => void;
  children: React.ReactNode;
  className?: string;
}

function PreviewSection({
  stepIndex,
  stepLabel,
  currentStep,
  onStepClick,
  children,
  className,
}: PreviewSectionProps) {
  const isActive = stepIndex === currentStep;

  return (
    <div
      onClick={() => onStepClick(stepIndex)}
      data-active={isActive}
      className={cn(
        "group relative w-full cursor-pointer transition-all duration-300",
        "hover:data-[active=false]:bg-black/[0.02]",
        className,
      )}
      role="button"
    >
      {/* Corner brackets for active section */}
      {isActive && (
        <div className="pointer-events-none absolute inset-[8px]">
          <div className="relative h-full w-full">
            {/* Top-left */}
            <div className="absolute -left-[1px] top-0 h-2 w-2 animate-pulse">
              <div className="h-full w-full border-l-2 border-t-2 border-[#0094FF]" />
            </div>
            {/* Top-right */}
            <div className="absolute -right-[1px] top-0 h-2 w-2 animate-pulse">
              <div className="h-full w-full border-r-2 border-t-2 border-[#0094FF]" />
            </div>
            {/* Bottom-left */}
            <div className="absolute -left-[1px] bottom-0 h-2 w-2 animate-pulse">
              <div className="h-full w-full border-b-2 border-l-2 border-[#0094FF]" />
            </div>
            {/* Bottom-right */}
            <div className="absolute -right-[1px] bottom-0 h-2 w-2 animate-pulse">
              <div className="h-full w-full border-b-2 border-r-2 border-[#0094FF]" />
            </div>
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      <div className="pointer-events-none absolute left-1/2 top-3 z-50 flex -translate-x-1/2 -translate-y-2.5 items-center space-x-1 rounded-full bg-[#1A1A1A] py-1 pl-1 pr-2.5 opacity-0 shadow-lg transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#494949] text-[10px] font-bold text-white">
          {stepIndex + 1}
        </span>
        <span className="text-[10px] font-semibold text-white">
          {stepLabel}
        </span>
      </div>

      {children}
    </div>
  );
}

export function InvoiceHtmlPreview({
  invoice,
  totals,
  currentStep,
  onStepClick,
  onLocaleChange,
  onCurrencyChange,
  onPageSizeChange,
}: InvoiceHtmlPreviewProps) {
  const t = getTranslations(invoice.locale);
  const localeConfig = getLocaleConfig(invoice.locale);
  const pageSizeConfig = getPageSizeConfig(invoice.pageSize);
  const currentPreset = getPresetFromSettings(
    invoice.locale,
    invoice.currency,
    invoice.pageSize,
  );
  const currentCurrency = CURRENCIES.find((c) => c.value === invoice.currency);
  const currentLanguage = LANGUAGES.find((l) => l.value === invoice.locale);
  const currentPaperSize = PAPER_SIZES.find(
    (p) => p.value === invoice.pageSize,
  );

  return (
    <div className="relative flex h-full items-center justify-center overflow-auto bg-muted/30 p-6">
      {/* Floating controls */}
      <div className="absolute top-4 right-4 z-10 flex w-52 flex-col gap-3">
        {/* Invoice Preset */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">
            Invoice Preset
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger className={dropdownTriggerClasses}>
              {currentPreset ? (
                <>
                  <CircleFlag
                    countryCode={currentPreset.countryCode}
                    height={16}
                    width={16}
                  />
                  <span>{currentPreset.label}</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={1} />
                  <span className="text-muted-foreground">Custom</span>
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup
                value={currentPreset?.id ?? "custom"}
                onValueChange={(presetId) => {
                  const preset = INVOICE_PRESETS.find((p) => p.id === presetId);
                  if (preset) {
                    onLocaleChange(preset.locale);
                    onCurrencyChange(preset.currency);
                    onPageSizeChange(preset.pageSize);
                  }
                }}
              >
                {INVOICE_PRESETS.map((preset) => (
                  <DropdownMenuRadioItem key={preset.id} value={preset.id}>
                    <CircleFlag
                      countryCode={preset.countryCode}
                      height={16}
                      width={16}
                    />
                    <span>{preset.label}</span>
                  </DropdownMenuRadioItem>
                ))}
                {!currentPreset && (
                  <DropdownMenuRadioItem value="custom" disabled>
                    <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
                    <span className="text-muted-foreground">Custom</span>
                  </DropdownMenuRadioItem>
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Currency */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Currency</Label>
          <DropdownMenu>
            <DropdownMenuTrigger className={dropdownTriggerClasses}>
              {currentCurrency && (
                <CircleFlag
                  countryCode={currentCurrency.countryCode}
                  height={16}
                  width={16}
                />
              )}
              <span>{invoice.currency}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup
                value={invoice.currency}
                onValueChange={onCurrencyChange}
              >
                {CURRENCIES.map((currency) => (
                  <DropdownMenuRadioItem
                    key={currency.value}
                    value={currency.value}
                  >
                    <CircleFlag
                      countryCode={currency.countryCode}
                      height={16}
                      width={16}
                    />
                    <span>{currency.value}</span>
                    <span className="text-muted-foreground">
                      {currency.label}
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Language */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Language</Label>
          <DropdownMenu>
            <DropdownMenuTrigger className={dropdownTriggerClasses}>
              {currentLanguage && (
                <CircleFlag
                  countryCode={currentLanguage.countryCode}
                  height={16}
                  width={16}
                />
              )}
              <span>{currentLanguage?.label ?? invoice.locale}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup
                value={invoice.locale}
                onValueChange={(value) =>
                  onLocaleChange(value as InvoiceLocale)
                }
              >
                {LANGUAGES.map((lang) => (
                  <DropdownMenuRadioItem key={lang.value} value={lang.value}>
                    <CircleFlag
                      countryCode={lang.countryCode}
                      height={16}
                      width={16}
                    />
                    <span>{lang.label}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Paper Size */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Paper Size</Label>
          <DropdownMenu>
            <DropdownMenuTrigger className={dropdownTriggerClasses}>
              <span>{currentPaperSize?.label ?? invoice.pageSize}</span>
              <span className="text-muted-foreground text-xs">
                {currentPaperSize?.dimensions}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuRadioGroup
                value={invoice.pageSize}
                onValueChange={(value) => onPageSizeChange(value as PageSize)}
              >
                {PAPER_SIZES.map((size) => (
                  <DropdownMenuRadioItem key={size.value} value={size.value}>
                    <span>{size.label}</span>
                    <span className="text-muted-foreground text-xs">
                      {size.dimensions}
                    </span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Invoice container - no rounded corners (it's paper) */}
      <div
        className="relative flex flex-col overflow-hidden bg-white shadow-[0_0_0_1px_rgba(0,25,59,.05),0_1px_1px_0_rgba(0,25,59,.04),0_3px_3px_0_rgba(0,25,59,.03),0_6px_4px_0_rgba(0,25,59,.02),0_11px_4px_0_rgba(0,25,59,.01),0_32px_24px_-12px_rgba(0,0,59,.06)]"
        style={{
          width: `${pageSizeConfig.previewWidth}px`,
          height: `${pageSizeConfig.previewHeight}px`,
        }}
      >
        {/* Invoice Terms - Top bar (Step 4) */}
        <PreviewSection
          stepIndex={4}
          stepLabel="Invoice terms"
          currentStep={currentStep}
          onStepClick={onStepClick}
          className="border-b border-gray-200"
        >
          <div className="grid h-14 grid-cols-2 items-center px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase text-gray-400">
                {t.invoiceNo}
              </p>
              <p className="text-xs font-medium">
                {invoice.invoiceNumber || "-"}
              </p>
            </div>
            <div className="flex pl-8">
              <div className="min-w-[60px]">
                <p className="pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {t.issued}
                </p>
                <p className="text-xs font-medium">
                  {formatDate(invoice.issueDate, localeConfig.dateLocale)}
                </p>
              </div>
              <div className="ml-6">
                <p className="pb-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {t.dueDate}
                </p>
                <p className="text-xs font-medium">
                  {formatDate(invoice.dueDate, localeConfig.dateLocale)}
                </p>
              </div>
            </div>
          </div>
        </PreviewSection>

        {/* From / To Grid */}
        <div className="relative grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200">
          {/* Your Company - Left (Step 0) */}
          <PreviewSection
            stepIndex={0}
            stepLabel="Your company"
            currentStep={currentStep}
            onStepClick={onStepClick}
            className="flex flex-col"
          >
            <div className="p-8 py-6">
              <p className="pb-2.5 text-[10px] font-semibold uppercase text-gray-400">
                {t.from}
              </p>
              {invoice.showFromLogo && (
                <div className="mb-3 flex w-fit flex-1">
                  {invoice.fromLogoUrl ? (
                    <img
                      src={invoice.fromLogoUrl}
                      alt={invoice.fromName}
                      className="h-[45px] w-[45px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[45px] w-[45px] items-center justify-center rounded-full bg-gray-200 text-xl font-medium">
                      {getInitial(invoice.fromName)}
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col">
                <p className="mb-1 min-h-[32px] truncate text-2xl font-medium">
                  {invoice.fromName || "-"}
                </p>
                {invoice.fromEmail && (
                  <p className="mb-3 truncate text-xs font-medium text-gray-600">
                    {invoice.fromEmail}
                  </p>
                )}
                {invoice.fromAddress && (
                  <p className="mb-1 truncate text-xs font-medium text-gray-400">
                    {invoice.fromAddress}
                  </p>
                )}
                {(invoice.fromCity || invoice.fromCountry) && (
                  <p className="mb-0.5 truncate text-xs font-medium text-gray-400">
                    {[invoice.fromCity, invoice.fromCountry]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {invoice.fromPhone && (
                  <p className="mb-1 truncate text-xs font-medium text-gray-400">
                    {invoice.fromPhone}
                  </p>
                )}
                {invoice.fromTaxId && (
                  <p className="truncate text-xs font-medium text-gray-400">
                    {t.taxId}: {invoice.fromTaxId}
                  </p>
                )}
              </div>
            </div>
          </PreviewSection>

          {/* Your Client - Right (Step 1) */}
          <PreviewSection
            stepIndex={1}
            stepLabel="Your client"
            currentStep={currentStep}
            onStepClick={onStepClick}
            className="flex flex-col"
          >
            <div className="p-8 py-6">
              <p className="pb-2.5 text-[10px] font-semibold uppercase text-gray-400">
                {t.to}
              </p>
              {invoice.showCustomerLogo && (
                <div className="mb-3 flex w-fit flex-1">
                  {invoice.customerLogoUrl ? (
                    <img
                      src={invoice.customerLogoUrl}
                      alt={invoice.customerName}
                      className="h-[45px] w-[45px] rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-[45px] w-[45px] items-center justify-center rounded-full bg-gray-200 text-xl font-medium">
                      {getInitial(invoice.customerName)}
                    </div>
                  )}
                </div>
              )}
              <div className="flex flex-col">
                <p className="mb-1 min-h-[32px] truncate text-2xl font-medium">
                  {invoice.customerName || "-"}
                </p>
                {invoice.customerEmail && (
                  <p className="mb-3 truncate text-xs font-medium text-gray-600">
                    {invoice.customerEmail}
                  </p>
                )}
                {invoice.customerAddress && (
                  <p className="mb-1 truncate text-xs font-medium text-gray-400">
                    {invoice.customerAddress}
                  </p>
                )}
                {(invoice.customerCity || invoice.customerCountry) && (
                  <p className="mb-0.5 truncate text-xs font-medium text-gray-400">
                    {[invoice.customerCity, invoice.customerCountry]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
                {invoice.customerPhone && (
                  <p className="mb-1 truncate text-xs font-medium text-gray-400">
                    {invoice.customerPhone}
                  </p>
                )}
                {invoice.customerTaxId && (
                  <p className="truncate text-xs font-medium text-gray-400">
                    {t.taxId}: {invoice.customerTaxId}
                  </p>
                )}
              </div>
            </div>
          </PreviewSection>
        </div>

        {/* Invoice Details - Line items (Step 2) - grows to push Payment to bottom */}
        <PreviewSection
          stepIndex={2}
          stepLabel="Invoice details"
          currentStep={currentStep}
          onStepClick={onStepClick}
          className="flex-1"
        >
          <div className="p-8 py-6">
            {/* Header */}
            <div className="grid grid-cols-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              <div>{t.description}</div>
              <div
                className="grid pl-8"
                style={{ gridTemplateColumns: "60px 70px 1fr" }}
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
                className="grid min-h-[49px] grid-cols-2 border-b border-gray-200 py-4 text-xs"
              >
                <div className="font-medium">
                  {item.name ? (
                    <div
                      className="line-item-content [&_p]:mb-1 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_.list-container]:my-1 [&_.list-item]:mb-0.5 [&_.list-marker]:text-gray-500 [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[10px] [&_code]:font-mono"
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
                  style={{ gridTemplateColumns: "60px 70px 1fr" }}
                >
                  <p className="truncate font-medium text-gray-600">
                    {item.quantity}
                  </p>
                  <p className="truncate font-medium text-gray-600">
                    {formatCurrency(item.price, invoice.currency)}
                  </p>
                  <p className="truncate text-right font-medium text-gray-600">
                    {formatCurrency(
                      calculateLineItemTotal({
                        price: item.price,
                        quantity: item.quantity,
                      }),
                      invoice.currency,
                    )}
                  </p>
                </div>
              </div>
            ))}

            {/* Note + Totals */}
            <div className="mt-12 grid grid-cols-2 border-t border-gray-200 pt-4">
              {/* Note */}
              <div className="pr-6">
                <p className="text-xs font-medium text-gray-400">{t.note}</p>
                <p className="mt-1.5 whitespace-pre-wrap text-[10px] font-medium text-gray-400">
                  {invoice.notes || "-"}
                </p>
              </div>

              {/* Totals */}
              <div className="pl-8">
                {/* Subtotal */}
                <div className="flex items-start justify-between border-b border-gray-200 pb-3">
                  <div className="text-xs font-medium text-gray-400">
                    {t.subtotal}
                  </div>
                  <p className="text-right text-xs font-medium text-gray-600">
                    {formatCurrency(totals.subTotal, invoice.currency)}
                  </p>
                </div>

                {/* Discount */}
                {invoice.includeDiscount && invoice.discount > 0 && (
                  <div className="flex min-h-[49px] items-center justify-between border-b border-gray-200 py-3">
                    <div className="text-xs font-medium text-gray-400">
                      {t.discount}
                    </div>
                    <p className="text-right text-xs font-medium text-gray-600">
                      -{formatCurrency(invoice.discount, invoice.currency)}
                    </p>
                  </div>
                )}

                {/* Tax */}
                {(invoice.showTaxIfZero ||
                  (invoice.includeTax && invoice.taxRate > 0)) && (
                  <div className="flex min-h-[49px] items-center justify-between border-b border-gray-200 py-3">
                    <div className="text-xs font-medium text-gray-400">
                      {t.tax} ({invoice.taxRate}%)
                    </div>
                    <p className="text-right text-xs font-medium text-gray-600">
                      {formatCurrency(totals.tax, invoice.currency)}
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="flex min-h-[49px] items-center justify-between py-3">
                  <div className="text-xs font-medium text-gray-400">
                    {t.total}
                  </div>
                  <p className="text-right font-medium">
                    {formatCurrency(totals.total, invoice.currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PreviewSection>

        {/* Payment Method - Bottom (Step 3) */}
        <PreviewSection
          stepIndex={3}
          stepLabel="Payment details"
          currentStep={currentStep}
          onStepClick={onStepClick}
          className="border-t border-gray-200"
        >
          <div className="p-8 py-6">
            <p className="pb-2.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              {t.paymentDetails}
            </p>
            <p className="whitespace-pre-wrap text-xs font-medium text-gray-600">
              {invoice.paymentDetails || "-"}
            </p>
          </div>
        </PreviewSection>
      </div>
    </div>
  );
}
