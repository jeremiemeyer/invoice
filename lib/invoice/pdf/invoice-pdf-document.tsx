/**
 * Unified Invoice PDF Document component.
 * Uses react-pdf-html for dual-rendering:
 * - When isHtml=true: renders as HTML (for preview)
 * - When isHtml=false: renders as PDF (for download)
 */

import {
  Document,
  getIsHtmlMode,
  Image,
  Page,
  Text,
  View,
} from "@rawwee/react-pdf-html";
import { Text as PdfText } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ReactNode } from "react";
import { calculateLineItemTotal } from "../calculate";
import { formatCurrency } from "../format-currency";
import { parseLexicalState } from "../lexical-to-html";
import { getStyle, type InvoiceStyle } from "../styles";
import {
  getDocumentTypeLabels,
  getLocaleConfig,
  getTranslations,
} from "../translations";
import type { InvoiceFormState, InvoiceTotals } from "../types";
import { lexicalToPdf } from "./lexical-to-pdf";

// Import font registration (side-effect)
import "./fonts";

export interface InvoicePdfDocumentProps {
  invoice: InvoiceFormState;
  totals: InvoiceTotals;
  layoutId?: string;
  styleId?: string;
  /** Current wizard step (for highlighting) */
  currentStep?: number;
  /** Callback when a section is clicked */
  onStepClick?: (step: number) => void;
  /** Current page number (1-indexed, for HTML preview) */
  pageNumber?: number;
  /** Total number of pages (for HTML preview) */
  totalPages?: number;
}

// Layout constants - used consistently across all sections
const LAYOUT = {
  // Horizontal padding for content sections
  sectionPadding: 32,
  // Gap between left and right columns (applied as paddingLeft on right column)
  columnGap: 32,
  // Fixed width for QTY column (aligns with Subtotal/Total labels)
  qtyColumnWidth: 60,
  // Top bar height
  topBarHeight: 56,
  // Vertical padding for sections
  sectionVerticalPadding: 24,
  // Line item row padding
  rowPadding: 12,
  // Minimum row height
  minRowHeight: 40,
  // Footer height (for page numbers when multi-page)
  footerHeight: 32,
};

// Export layout constants for use in preview calculations
export { LAYOUT };

// Helper functions
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

// Create styles based on style configuration
function createStyles(style: InvoiceStyle) {
  const { colors, fonts, fontStyle } = style;
  const labelFont = fontStyle.monoLabels ? fonts.mono : fonts.body;
  const numberFont = fontStyle.monoNumbers ? fonts.mono : fonts.body;

  return {
    label: {
      fontSize: 8,
      fontWeight: fontStyle.labelWeight,
      color: colors.muted,
      textTransform: "uppercase",
      fontFamily: labelFont,
      letterSpacing: fontStyle.monoLabels ? 0.5 : 0,
      lineHeight: 1.25,
    } as Style,
    text: {
      fontSize: 10,
      fontWeight: 400,
      color: colors.secondary,
      fontFamily: fonts.body,
      lineHeight: 1.25,
    } as Style,
    // For important values like invoice number (uses mono in mono style)
    value: {
      fontSize: 10,
      fontWeight: 400,
      color: colors.primary,
      fontFamily: numberFont,
      lineHeight: 1.25,
    } as Style,
    number: {
      fontSize: 10,
      fontWeight: 400,
      color: colors.secondary,
      fontFamily: numberFont,
      lineHeight: 1.25,
    } as Style,
    mutedText: {
      fontSize: 10,
      fontWeight: 400,
      color: colors.muted,
      fontFamily: fonts.body,
      lineHeight: 1.25,
    } as Style,
    heading: {
      fontSize: 18,
      fontWeight: 500,
      color: colors.primary,
      fontFamily: fonts.heading,
      lineHeight: 1.15,
    } as Style,
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.avatarBg,
      alignItems: "center",
      justifyContent: "center",
    } as Style,
    avatarText: {
      fontSize: 16,
      fontWeight: 500,
      color: colors.primary,
      fontFamily: fonts.heading,
    } as Style,
    // For line item descriptions (body font)
    itemText: {
      fontSize: 10,
      fontWeight: 400,
      color: colors.primary,
      fontFamily: fonts.body,
      lineHeight: 1.25,
    } as Style,
  };
}

/**
 * Interactive overlay for sections in HTML preview mode.
 * Renders hover background, corner brackets, and hover tooltip.
 */
function InteractiveOverlay({
  stepIndex,
  stepLabel,
  isActive,
  onStepClick,
}: {
  stepIndex: number;
  stepLabel: string;
  isActive: boolean;
  onStepClick?: (step: number) => void;
}) {
  // Only render in HTML mode
  if (!getIsHtmlMode()) return null;

  return (
    <>
      {/* Clickable overlay with hover background */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Preview section click */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onStepClick?.(stepIndex);
        }}
        className="group/section absolute inset-0 z-10 cursor-pointer transition-colors hover:bg-neutral-100/40"
      >
        {/* Hover tooltip */}
        <div className="pointer-events-none absolute left-1/2 top-3 z-20 flex -translate-x-1/2 -translate-y-2.5 items-center gap-1 rounded-full bg-[#1A1A1A] py-1 pl-1 pr-2.5 opacity-0 shadow-lg transition-all duration-300 ease-out group-hover/section:translate-y-0 group-hover/section:opacity-100">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#494949] text-[10px] font-bold text-white">
            {stepIndex + 1}
          </span>
          <span className="whitespace-nowrap text-[10px] font-semibold text-white">
            {stepLabel}
          </span>
        </div>
      </div>

      {/* Corner brackets for active section */}
      {isActive && (
        <div className="pointer-events-none absolute inset-2 z-20">
          {/* Top-left */}
          <div className="absolute -left-px top-0 h-2 w-2 animate-pulse border-l-2 border-t-2 border-[#0094FF]" />
          {/* Top-right */}
          <div className="absolute -right-px top-0 h-2 w-2 animate-pulse border-r-2 border-t-2 border-[#0094FF]" />
          {/* Bottom-left */}
          <div className="absolute -left-px bottom-0 h-2 w-2 animate-pulse border-b-2 border-l-2 border-[#0094FF]" />
          {/* Bottom-right */}
          <div className="absolute -right-px bottom-0 h-2 w-2 animate-pulse border-b-2 border-r-2 border-[#0094FF]" />
        </div>
      )}
    </>
  );
}

// Section wrapper component
function Section({
  children,
  stepIndex,
  stepLabel,
  currentStep,
  onStepClick,
  style,
  wrap,
}: {
  children: ReactNode;
  stepIndex: number;
  stepLabel: string;
  currentStep?: number;
  onStepClick?: (step: number) => void;
  style?: Style;
  wrap?: boolean;
}) {
  const isActive = stepIndex === currentStep;
  const isHtml = getIsHtmlMode();

  return (
    <View style={style} wrap={wrap}>
      {children}
      {/* Interactive overlay only in HTML mode and when onStepClick is provided */}
      {isHtml && onStepClick && (
        <InteractiveOverlay
          stepIndex={stepIndex}
          stepLabel={stepLabel}
          isActive={isActive}
          onStepClick={onStepClick}
        />
      )}
    </View>
  );
}

/**
 * Page footer with page numbers.
 * Uses React-PDF's render prop for dynamic page numbers (PDF mode).
 * In HTML preview mode, uses passed props for page info.
 * Only shown when there are multiple pages.
 */
function PageFooter({
  colors,
  pageNumber: htmlPageNumber,
  totalPages: htmlTotalPages,
}: {
  colors: InvoiceStyle["colors"];
  pageNumber?: number;
  totalPages?: number;
}) {
  const isHtml = getIsHtmlMode();

  // In HTML mode, show page numbers if we have the info and there's more than 1 page
  if (isHtml) {
    if (!htmlPageNumber || !htmlTotalPages || htmlTotalPages <= 1) {
      return null;
    }
    return (
      <Text
        style={{
          position: "absolute",
          bottom: 16,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 8,
          color: colors.muted,
          fontFamily: "Inter",
        }}
      >
        Page {htmlPageNumber} / {htmlTotalPages}
      </Text>
    );
  }

  // In PDF mode, use render prop for actual page numbers (only if > 1 page)
  return (
    <PdfText
      style={{
        position: "absolute",
        bottom: 16,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 8,
        color: colors.muted,
        fontFamily: "Inter",
      }}
      render={({ pageNumber, totalPages }) =>
        totalPages > 1 ? `Page ${pageNumber} / ${totalPages}` : ""
      }
      fixed
    />
  );
}

/**
 * Creates the invoice document using react-pdf-html components.
 */
export function InvoicePdfDocument({
  invoice,
  totals,
  styleId = "classic",
  currentStep,
  onStepClick,
  pageNumber,
  totalPages,
}: InvoicePdfDocumentProps) {
  const translations = getTranslations(invoice.locale);
  const documentTypeLabels = getDocumentTypeLabels(
    invoice.locale,
    invoice.documentType,
  );
  const localeConfig = getLocaleConfig(invoice.locale);

  // Get style and create styles
  const style = getStyle(styleId);
  const colors = style.colors;
  const styles = createStyles(style);

  return (
    <Document>
      <Page
        size={invoice.pageSize}
        style={{
          fontFamily: style.fonts.body,
          backgroundColor: colors.background,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Main content wrapper - flex to push footer down */}
        <View style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Invoice Terms - Top bar (Step 4) */}
          <Section
            stepIndex={4}
            stepLabel="Invoice terms"
            currentStep={currentStep}
            onStepClick={onStepClick}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              height: LAYOUT.topBarHeight,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {/* Left column: Invoice Number */}
            <View style={{ flex: 1, paddingHorizontal: LAYOUT.sectionPadding }}>
              <Text style={styles.label}>{documentTypeLabels.documentNo}</Text>
              <Text style={styles.value}>{invoice.invoiceNumber || "-"}</Text>
            </View>

            {/* Right column: Dates - aligned with To section */}
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                paddingLeft: LAYOUT.columnGap,
                paddingRight: LAYOUT.sectionPadding,
              }}
            >
              <View style={{ width: LAYOUT.qtyColumnWidth }}>
                <Text style={styles.label}>{translations.issued}</Text>
                <Text style={styles.value}>
                  {formatDate(invoice.issueDate, localeConfig.dateLocale)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{documentTypeLabels.dateLabel}</Text>
                <Text style={styles.value}>
                  {formatDate(invoice.dueDate, localeConfig.dateLocale)}
                </Text>
              </View>
              <View style={{ flex: 1 }} />
            </View>
          </Section>

          {/* From / To Grid */}
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            {/* Your Company - Left (Step 0) */}
            <Section
              stepIndex={0}
              stepLabel="Your company"
              currentStep={currentStep}
              onStepClick={onStepClick}
              style={{
                flex: 1,
                paddingHorizontal: LAYOUT.sectionPadding,
                paddingVertical: LAYOUT.sectionVerticalPadding,
                borderRightWidth: 1,
                borderRightColor: colors.border,
              }}
            >
              <Text style={{ ...styles.label, marginBottom: 8 }}>
                {translations.from}
              </Text>

              {/* Logo/Avatar */}
              {invoice.showFromLogo && (
                <View style={{ marginBottom: 8 }}>
                  {invoice.fromLogoUrl ? (
                    <Image
                      src={invoice.fromLogoUrl}
                      style={{ width: 36, height: 36, borderRadius: 18 }}
                    />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {getInitial(invoice.fromName)}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Company Name */}
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.heading}>{invoice.fromName || "-"}</Text>
                {invoice.fromSubtitle && (
                  <Text style={{ ...styles.mutedText, opacity: 0.8 }}>
                    {invoice.fromSubtitle}
                  </Text>
                )}
              </View>

              {/* Contact Details */}
              {invoice.fromEmail && (
                <Text style={styles.text}>{invoice.fromEmail}</Text>
              )}
              {invoice.fromAddress && (
                <Text style={styles.mutedText}>{invoice.fromAddress}</Text>
              )}
              {invoice.fromCity && (
                <Text style={styles.mutedText}>{invoice.fromCity}</Text>
              )}
              {invoice.fromCountry && (
                <Text style={styles.mutedText}>{invoice.fromCountry}</Text>
              )}
              {invoice.fromPhone && (
                <Text style={styles.mutedText}>{invoice.fromPhone}</Text>
              )}
              {invoice.fromTaxId && (
                <Text style={styles.mutedText}>
                  {translations.taxId}: {invoice.fromTaxId}
                </Text>
              )}
            </Section>

            {/* Your Client - Right (Step 1) */}
            <Section
              stepIndex={1}
              stepLabel="Your client"
              currentStep={currentStep}
              onStepClick={onStepClick}
              style={{
                flex: 1,
                paddingLeft: LAYOUT.columnGap,
                paddingRight: LAYOUT.sectionPadding,
                paddingVertical: LAYOUT.sectionVerticalPadding,
              }}
            >
              <Text style={{ ...styles.label, marginBottom: 8 }}>
                {translations.to}
              </Text>

              {/* Logo/Avatar */}
              {invoice.showCustomerLogo && (
                <View style={{ marginBottom: 8 }}>
                  {invoice.customerLogoUrl ? (
                    <Image
                      src={invoice.customerLogoUrl}
                      style={{ width: 36, height: 36, borderRadius: 18 }}
                    />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {getInitial(invoice.customerName)}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Client Name */}
              <View style={{ marginBottom: 8 }}>
                <Text style={styles.heading}>
                  {invoice.customerName || "-"}
                </Text>
                {invoice.customerSubtitle && (
                  <Text style={{ ...styles.mutedText, opacity: 0.8 }}>
                    {invoice.customerSubtitle}
                  </Text>
                )}
              </View>

              {/* Contact Details */}
              {invoice.customerEmail && (
                <Text style={styles.text}>{invoice.customerEmail}</Text>
              )}
              {invoice.customerAddress && (
                <Text style={styles.mutedText}>{invoice.customerAddress}</Text>
              )}
              {invoice.customerCity && (
                <Text style={styles.mutedText}>{invoice.customerCity}</Text>
              )}
              {invoice.customerCountry && (
                <Text style={styles.mutedText}>{invoice.customerCountry}</Text>
              )}
              {invoice.customerPhone && (
                <Text style={styles.mutedText}>{invoice.customerPhone}</Text>
              )}
              {invoice.customerTaxId && (
                <Text style={styles.mutedText}>
                  {translations.taxId}: {invoice.customerTaxId}
                </Text>
              )}
            </Section>
          </View>

          {/* Invoice Details - Line items (Step 2) */}
          <Section
            stepIndex={2}
            stepLabel="Invoice details"
            currentStep={currentStep}
            onStepClick={onStepClick}
            style={{ flex: 1 }}
          >
            {/* Header row */}
            <View
              style={{
                flexDirection: "row",
                paddingTop: LAYOUT.sectionVerticalPadding,
                paddingBottom: 4,
              }}
            >
              {/* Left: Description label */}
              <View
                style={{ flex: 1, paddingHorizontal: LAYOUT.sectionPadding }}
              >
                <Text style={styles.label}>{translations.description}</Text>
              </View>
              {/* Right: Qty, Price, Amount labels */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  paddingLeft: LAYOUT.columnGap,
                  paddingRight: LAYOUT.sectionPadding,
                }}
              >
                <Text style={{ ...styles.label, width: LAYOUT.qtyColumnWidth }}>
                  {translations.qty}
                </Text>
                <Text style={{ ...styles.label, flex: 1 }}>
                  {translations.price}
                </Text>
                <Text style={{ ...styles.label, flex: 1, textAlign: "right" }}>
                  {translations.amount}
                </Text>
              </View>
            </View>

            {/* Line Items */}
            {invoice.lineItems.map((item, index) => (
              <View key={item.id || index} wrap={false}>
                {/* Item row - wrap={false} prevents this item from being split across pages */}
                <View
                  style={{
                    flexDirection: "row",
                    paddingVertical: LAYOUT.rowPadding,
                    minHeight: LAYOUT.minRowHeight,
                  }}
                >
                  {/* Left: Item description */}
                  <View
                    style={{
                      flex: 1,
                      paddingHorizontal: LAYOUT.sectionPadding,
                    }}
                  >
                    {item.name ? (
                      lexicalToPdf(
                        parseLexicalState(item.name),
                        styles.itemText,
                      )
                    ) : (
                      <Text style={styles.itemText}>-</Text>
                    )}
                  </View>
                  {/* Right: Qty, Price, Amount values */}
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      paddingLeft: LAYOUT.columnGap,
                      paddingRight: LAYOUT.sectionPadding,
                    }}
                  >
                    <Text
                      style={{ ...styles.number, width: LAYOUT.qtyColumnWidth }}
                    >
                      {item.quantity}
                    </Text>
                    <Text style={{ ...styles.number, flex: 1 }}>
                      {formatCurrency(
                        item.price,
                        invoice.currency,
                        invoice.numberLocale,
                      )}
                    </Text>
                    <Text
                      style={{ ...styles.number, flex: 1, textAlign: "right" }}
                    >
                      {formatCurrency(
                        calculateLineItemTotal({
                          price: item.price,
                          quantity: item.quantity,
                        }),
                        invoice.currency,
                        invoice.numberLocale,
                      )}
                    </Text>
                  </View>
                </View>
                {/* Separator with margins */}
                <View
                  style={{
                    marginHorizontal: LAYOUT.sectionPadding,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                />
              </View>
            ))}

            {/* Note + Totals row - wrap={false} keeps totals together on same page */}
            <View
              wrap={false}
              style={{ flexDirection: "row", paddingTop: LAYOUT.rowPadding }}
            >
              {/* Left: Note - same structure as Subtotal row for vertical alignment */}
              <View
                style={{ flex: 1, paddingHorizontal: LAYOUT.sectionPadding }}
              >
                {/* Label row - matches Subtotal row height */}
                <View
                  style={{
                    minHeight: LAYOUT.minRowHeight,
                    justifyContent: "center",
                    paddingVertical: 8,
                  }}
                >
                  <Text style={styles.label}>{translations.note}</Text>
                </View>
                {/* Note content */}
                <Text
                  style={{
                    ...styles.mutedText,
                    fontSize: 8,
                  }}
                >
                  {invoice.notes || "-"}
                </Text>
              </View>

              {/* Right: Totals - uses same column structure */}
              <View
                style={{
                  flex: 1,
                  paddingLeft: LAYOUT.columnGap,
                  paddingRight: LAYOUT.sectionPadding,
                }}
              >
                {/* Subtotal */}
                <View
                  style={{
                    flexDirection: "row",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    minHeight: LAYOUT.minRowHeight,
                    alignItems: "center",
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      ...styles.text,
                      color: colors.muted,
                      width: LAYOUT.qtyColumnWidth,
                    }}
                  >
                    {translations.subtotal}
                  </Text>
                  <Text style={{ ...styles.number, flex: 1 }} />
                  <Text
                    style={{ ...styles.number, flex: 1, textAlign: "right" }}
                  >
                    {formatCurrency(
                      totals.subTotal,
                      invoice.currency,
                      invoice.numberLocale,
                    )}
                  </Text>
                </View>

                {/* Discount */}
                {invoice.includeDiscount && invoice.discount > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      minHeight: LAYOUT.minRowHeight,
                      alignItems: "center",
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        ...styles.text,
                        color: colors.muted,
                        width: LAYOUT.qtyColumnWidth,
                      }}
                    >
                      {translations.discount}
                    </Text>
                    <Text style={{ ...styles.number, flex: 1 }} />
                    <Text
                      style={{ ...styles.number, flex: 1, textAlign: "right" }}
                    >
                      -
                      {formatCurrency(
                        invoice.discount,
                        invoice.currency,
                        invoice.numberLocale,
                      )}
                    </Text>
                  </View>
                )}

                {/* Tax */}
                {(invoice.showTaxIfZero ||
                  (invoice.includeTax && invoice.taxRate > 0)) && (
                  <View
                    style={{
                      flexDirection: "row",
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      minHeight: LAYOUT.minRowHeight,
                      alignItems: "center",
                      paddingVertical: 8,
                    }}
                  >
                    <Text
                      style={{
                        ...styles.text,
                        color: colors.muted,
                        width: LAYOUT.qtyColumnWidth,
                      }}
                    >
                      {translations.tax} ({invoice.taxRate}%)
                    </Text>
                    <Text style={{ ...styles.number, flex: 1 }} />
                    <Text
                      style={{ ...styles.number, flex: 1, textAlign: "right" }}
                    >
                      {formatCurrency(
                        totals.tax,
                        invoice.currency,
                        invoice.numberLocale,
                      )}
                    </Text>
                  </View>
                )}

                {/* Total */}
                <View
                  style={{
                    flexDirection: "row",
                    minHeight: LAYOUT.minRowHeight,
                    alignItems: "center",
                    paddingVertical: 8,
                  }}
                >
                  <Text
                    style={{
                      ...styles.text,
                      color: colors.muted,
                      width: LAYOUT.qtyColumnWidth,
                    }}
                  >
                    {translations.total}
                  </Text>
                  <Text style={{ ...styles.number, flex: 1 }} />
                  <Text
                    style={{
                      ...styles.number,
                      fontSize: 14,
                      fontWeight: 500,
                      color: colors.primary,
                      flex: 1,
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(
                      totals.total,
                      invoice.currency,
                      invoice.numberLocale,
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </Section>
        </View>

        {/* Separator before Payment details - full width */}
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        />

        {/* Payment Method - Footer section (Step 3) - stays at bottom of page */}
        <Section
          stepIndex={3}
          stepLabel="Payment details"
          currentStep={currentStep}
          onStepClick={onStepClick}
          wrap={false}
          style={{
            paddingHorizontal: LAYOUT.sectionPadding,
            paddingVertical: LAYOUT.sectionVerticalPadding,
          }}
        >
          <Text style={styles.label}>{translations.paymentDetails}</Text>
          <Text style={{ ...styles.text, marginTop: 4 }}>
            {invoice.paymentDetails || "-"}
          </Text>
        </Section>

        {/* Page footer with page numbers */}
        <PageFooter
          colors={colors}
          pageNumber={pageNumber}
          totalPages={totalPages}
        />
      </Page>
    </Document>
  );
}
