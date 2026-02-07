"use client";

import {
  getIsHtmlMode,
  Image,
  Page,
  Text,
  View,
} from "@invoice-jm/react-pdf-html";
import { Text as PdfText } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { ReactNode } from "react";
import { calculateLineItemTotal } from "../../calculate";
import { getCountryConfig } from "../../countries";
import { formatCurrency } from "../../format-currency";
import { parseLexicalState } from "../../lexical-to-html";
import { lexicalToPdf } from "../../pdf/lexical-to-pdf";
import type { InvoiceStyle } from "../../styles";
import { getAdaptiveFontSize, type LayoutProps } from "../types";

// Layout constants - used consistently across all sections
const LAYOUT = {
  sectionPadding: 32,
  columnGap: 32,
  qtyColumnWidth: 60,
  topBarHeight: 56,
  sectionVerticalPadding: 24,
  rowPadding: 12,
  minRowHeight: 40,
  footerHeight: 32,
};

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
  if (!getIsHtmlMode()) return null;

  return (
    <>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Preview section click */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onStepClick?.(stepIndex);
        }}
        className="group/section absolute inset-0 z-10 cursor-pointer transition-colors hover:bg-neutral-100/40"
      >
        <div className="pointer-events-none absolute left-1/2 top-3 z-20 flex -translate-x-1/2 -translate-y-2.5 items-center gap-1 rounded-full bg-[#1A1A1A] py-1 pl-1 pr-2.5 opacity-0 shadow-lg transition-all duration-300 ease-out group-hover/section:translate-y-0 group-hover/section:opacity-100">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#494949] text-[10px] font-bold text-white">
            {stepIndex + 1}
          </span>
          <span className="whitespace-nowrap text-[10px] font-semibold text-white">
            {stepLabel}
          </span>
        </div>
      </div>

      {isActive && (
        <div className="pointer-events-none absolute inset-2 z-20">
          <div className="absolute -left-px top-0 h-2 w-2 animate-pulse border-l-2 border-t-2 border-[#0094FF]" />
          <div className="absolute -right-px top-0 h-2 w-2 animate-pulse border-r-2 border-t-2 border-[#0094FF]" />
          <div className="absolute -left-px bottom-0 h-2 w-2 animate-pulse border-b-2 border-l-2 border-[#0094FF]" />
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
 * Minimalist layout - clean, professional invoice design.
 * Features a top bar with document info, two-column from/to section,
 * and a clear line items table with totals.
 */
export function MinimalistLayout({
  invoice,
  totals,
  style,
  translations,
  documentTypeLabels,
  dateLocale,
  currentStep,
  onStepClick,
}: LayoutProps) {
  const { colors, spacing } = style;
  const styles = createStyles(style);

  const fromCountryConfig = getCountryConfig(invoice.fromCountryCode);
  const customerCountryConfig = getCountryConfig(invoice.customerCountryCode);

  const pageMarginSize =
    invoice.pageMargin === "none"
      ? 0
      : invoice.pageMargin === "small"
        ? spacing.page / 2
        : spacing.page;

  return (
    <Page
      size={invoice.pageSize}
      style={{
        fontFamily: style.fonts.body,
        backgroundColor: colors.background,
        display: "flex",
        flexDirection: "column",
        padding: pageMarginSize,
      }}
    >
      {/* Main content wrapper */}
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
          <View style={{ flex: 1, paddingHorizontal: LAYOUT.sectionPadding }}>
            <Text style={styles.label}>{documentTypeLabels.documentNo}</Text>
            <Text style={styles.value}>{invoice.invoiceNumber || "-"}</Text>
          </View>

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
                {formatDate(invoice.issueDate, dateLocale)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{documentTypeLabels.dateLabel}</Text>
              <Text style={styles.value}>
                {formatDate(invoice.dueDate, dateLocale)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              {invoice.purchaseOrderNumber ? (
                <>
                  <Text style={{ ...styles.label, textAlign: "right" }}>
                    {translations.purchaseOrderNumber}
                  </Text>
                  <Text style={{ ...styles.value, textAlign: "right" }}>
                    {invoice.purchaseOrderNumber}
                  </Text>
                </>
              ) : null}
            </View>
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

            <View style={{ marginBottom: 8 }}>
              <Text
                style={{
                  ...styles.heading,
                  fontSize: getAdaptiveFontSize(18, invoice.fromName),
                }}
              >
                {invoice.fromName || "-"}
              </Text>
              {invoice.fromSubtitle && (
                <Text style={{ ...styles.mutedText, opacity: 0.8 }}>
                  {invoice.fromSubtitle}
                </Text>
              )}
            </View>

            {invoice.fromEmail && (
              <Text style={styles.text}>{invoice.fromEmail}</Text>
            )}
            {invoice.fromAddress && (
              <Text style={styles.mutedText}>{invoice.fromAddress}</Text>
            )}
            {invoice.fromCity && (
              <Text style={styles.mutedText}>{invoice.fromCity}</Text>
            )}
            {invoice.showFromCountry && (
              <Text style={styles.mutedText}>{fromCountryConfig.name}</Text>
            )}
            {invoice.fromPhone && (
              <Text style={styles.mutedText}>{invoice.fromPhone}</Text>
            )}
            {invoice.fromTaxId && (
              <Text style={styles.mutedText}>
                {fromCountryConfig.taxId.label}
                {invoice.locale === "fr-FR" ? " : " : ": "}
                {invoice.fromTaxId}
              </Text>
            )}
            {invoice.showFromRegistrationId &&
              invoice.fromRegistrationId &&
              fromCountryConfig.registrationId.available && (
                <Text style={styles.mutedText}>
                  {fromCountryConfig.registrationId.label}
                  {invoice.locale === "fr-FR" ? " : " : ": "}
                  {invoice.fromRegistrationId}
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
            {/* Show "To" only when same address, otherwise show "Bill to" as header */}
            <Text style={{ ...styles.label, marginBottom: 8 }}>
              {invoice.hasSeparateShippingAddress
                ? translations.billing
                : translations.to}
            </Text>

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

            <View style={{ marginBottom: 8 }}>
              <Text
                style={{
                  ...styles.heading,
                  fontSize: getAdaptiveFontSize(18, invoice.customerName),
                }}
              >
                {invoice.customerName || "-"}
              </Text>
              {invoice.customerSubtitle && (
                <Text style={{ ...styles.mutedText, opacity: 0.8 }}>
                  {invoice.customerSubtitle}
                </Text>
              )}
            </View>

            {invoice.customerEmail && (
              <Text style={styles.text}>{invoice.customerEmail}</Text>
            )}

            {invoice.hasSeparateShippingAddress ? (
              <>
                {invoice.customerAddress && (
                  <Text style={styles.mutedText}>
                    {invoice.customerAddress}
                  </Text>
                )}
                {invoice.customerCity && (
                  <Text style={styles.mutedText}>{invoice.customerCity}</Text>
                )}
                {invoice.showCustomerCountry && (
                  <Text style={styles.mutedText}>
                    {customerCountryConfig.name}
                  </Text>
                )}
                {invoice.customerPhone && (
                  <Text style={styles.mutedText}>{invoice.customerPhone}</Text>
                )}
                {invoice.customerTaxId && (
                  <Text style={styles.mutedText}>
                    {customerCountryConfig.taxId.label}
                    {invoice.locale === "fr-FR" ? " : " : ": "}
                    {invoice.customerTaxId}
                  </Text>
                )}
                {invoice.showCustomerRegistrationId &&
                  invoice.customerRegistrationId &&
                  customerCountryConfig.registrationId.available && (
                    <Text style={styles.mutedText}>
                      {customerCountryConfig.registrationId.label}
                      {invoice.locale === "fr-FR" ? " : " : ": "}
                      {invoice.customerRegistrationId}
                    </Text>
                  )}

                <Text
                  style={{
                    ...styles.label,
                    marginTop: 12,
                    marginBottom: 4,
                  }}
                >
                  {translations.shipping}
                </Text>
                {invoice.shippingName && (
                  <Text style={styles.mutedText}>{invoice.shippingName}</Text>
                )}
                {invoice.shippingSubtitle && (
                  <Text style={styles.mutedText}>
                    {invoice.shippingSubtitle}
                  </Text>
                )}
                {invoice.shippingAddress && (
                  <Text style={styles.mutedText}>
                    {invoice.shippingAddress}
                  </Text>
                )}
                {invoice.shippingCity && (
                  <Text style={styles.mutedText}>{invoice.shippingCity}</Text>
                )}
                {invoice.showCustomerCountry && (
                  <Text style={styles.mutedText}>
                    {customerCountryConfig.name}
                  </Text>
                )}
                {invoice.shippingPhone && (
                  <Text style={styles.mutedText}>{invoice.shippingPhone}</Text>
                )}
              </>
            ) : (
              <>
                {invoice.customerAddress && (
                  <Text style={styles.mutedText}>
                    {invoice.customerAddress}
                  </Text>
                )}
                {invoice.customerCity && (
                  <Text style={styles.mutedText}>{invoice.customerCity}</Text>
                )}
                {invoice.showCustomerCountry && (
                  <Text style={styles.mutedText}>
                    {customerCountryConfig.name}
                  </Text>
                )}
                {invoice.customerPhone && (
                  <Text style={styles.mutedText}>{invoice.customerPhone}</Text>
                )}
                {invoice.customerTaxId && (
                  <Text style={styles.mutedText}>
                    {customerCountryConfig.taxId.label}
                    {invoice.locale === "fr-FR" ? " : " : ": "}
                    {invoice.customerTaxId}
                  </Text>
                )}
                {invoice.showCustomerRegistrationId &&
                  invoice.customerRegistrationId &&
                  customerCountryConfig.registrationId.available && (
                    <Text style={styles.mutedText}>
                      {customerCountryConfig.registrationId.label}
                      {invoice.locale === "fr-FR" ? " : " : ": "}
                      {invoice.customerRegistrationId}
                    </Text>
                  )}
              </>
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
            <View style={{ flex: 1, paddingHorizontal: LAYOUT.sectionPadding }}>
              <Text style={styles.label}>{translations.description}</Text>
            </View>
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
              <View
                style={{
                  flexDirection: "row",
                  paddingVertical: LAYOUT.rowPadding,
                  minHeight: LAYOUT.minRowHeight,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    paddingHorizontal: LAYOUT.sectionPadding,
                  }}
                >
                  {item.name ? (
                    lexicalToPdf(parseLexicalState(item.name), styles.itemText)
                  ) : (
                    <Text style={styles.itemText}>-</Text>
                  )}
                </View>
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
              <View
                style={{
                  marginHorizontal: LAYOUT.sectionPadding,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              />
            </View>
          ))}

          {/* Note + Totals row */}
          <View
            wrap={false}
            style={{ flexDirection: "row", paddingTop: LAYOUT.rowPadding }}
          >
            <View
              style={{
                flex: 1,
                paddingHorizontal: LAYOUT.sectionPadding,
              }}
            >
              <View
                style={{
                  minHeight: LAYOUT.minRowHeight,
                  justifyContent: "center",
                  paddingVertical: 8,
                }}
              >
                <Text style={styles.label}>{translations.note}</Text>
              </View>
              <Text style={{ ...styles.mutedText, fontSize: 8 }}>
                {invoice.notes || "-"}
              </Text>
            </View>

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
                <Text style={{ ...styles.number, flex: 1, textAlign: "right" }}>
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

      {/* Payment Method - Footer section (Step 3) */}
      {(invoice.paymentDetails || invoice.paymentDetailsSecondary) && (
        <>
          <View
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          />

          <Section
            stepIndex={3}
            stepLabel="Payment details"
            currentStep={currentStep}
            onStepClick={onStepClick}
            wrap={false}
            style={{
              flexDirection: "row",
              paddingVertical: LAYOUT.sectionVerticalPadding,
            }}
          >
            <View style={{ flex: 1, paddingHorizontal: LAYOUT.sectionPadding }}>
              <Text style={styles.label}>{translations.paymentDetails}</Text>
              <Text style={{ ...styles.text, marginTop: 4, fontSize: 9 }}>
                {invoice.paymentDetails}
              </Text>
            </View>
            {invoice.paymentDetailsSecondary && (
              <View
                style={{
                  flex: 1,
                  paddingLeft: LAYOUT.columnGap,
                  paddingRight: LAYOUT.sectionPadding,
                }}
              >
                <Text style={{ ...styles.label, opacity: 0 }}>&nbsp;</Text>
                <Text style={{ ...styles.text, marginTop: 4, fontSize: 9 }}>
                  {invoice.paymentDetailsSecondary}
                </Text>
              </View>
            )}
          </Section>
        </>
      )}

      {/* Page footer with page numbers */}
      <PageFooter colors={colors} />
    </Page>
  );
}
