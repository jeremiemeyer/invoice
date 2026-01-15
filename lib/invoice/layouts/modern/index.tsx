"use client";

import { Image, Page, Text, View } from "@rawwee/react-pdf-html";
import type { Style } from "@react-pdf/types";
import { calculateLineItemTotal } from "../../calculate";
import { getCountryConfig } from "../../countries";
import { formatCurrency } from "../../format-currency";
import { parseLexicalState } from "../../lexical-to-html";
import { lexicalToPdf } from "../../pdf/lexical-to-pdf";
import type { InvoiceLocale } from "../../translations";
import type { DocumentType } from "../../types";
import { Section } from "../interactive-section";
import type { LayoutProps } from "../types";

// Document title translations
const documentTitles: Record<InvoiceLocale, Record<DocumentType, string>> = {
  "en-US": {
    invoice: "Invoice",
    quote: "Quote",
  },
  "en-GB": {
    invoice: "Invoice",
    quote: "Quote",
  },
  "en-AU": {
    invoice: "Invoice",
    quote: "Quote",
  },
  "fr-FR": {
    invoice: "Facture",
    quote: "Devis",
  },
  "de-DE": {
    invoice: "Rechnung",
    quote: "Angebot",
  },
  "de-CH": {
    invoice: "Rechnung",
    quote: "Offerte",
  },
  "es-ES": {
    invoice: "Factura",
    quote: "Presupuesto",
  },
  "pt-PT": {
    invoice: "Fatura",
    quote: "Orçamento",
  },
};

// Helper to format dates
function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Get initial letter for avatar placeholder
function getInitial(name: string): string {
  return name?.charAt(0)?.toUpperCase() || "?";
}

/**
 * Modern layout - clean, spacious invoice design with large header.
 * Features a prominent document title, clear visual hierarchy,
 * and a distinctive totals block.
 */
export function ModernLayout({
  invoice,
  totals,
  style,
  translations: t,
  documentTypeLabels: docLabels,
  dateLocale,
  currentStep,
  onStepClick,
}: LayoutProps) {
  const { colors, fonts, spacing } = style;

  // Country-specific ID labels
  const fromCountryConfig = getCountryConfig(invoice.fromCountryCode);
  const customerCountryConfig = getCountryConfig(invoice.customerCountryCode);

  // Common text styles
  const labelStyle: Style = {
    fontSize: 9,
    fontWeight: style.fontStyle.labelWeight,
    color: colors.muted,
    textTransform: "uppercase",
    fontFamily: style.fontStyle.monoLabels ? fonts.mono : fonts.body,
    letterSpacing: 0.5,
  };

  const textStyle: Style = {
    fontSize: 10,
    fontWeight: 400,
    color: colors.secondary,
    fontFamily: fonts.body,
    lineHeight: 1.4,
  };

  const mutedTextStyle: Style = {
    fontSize: 9,
    fontWeight: 400,
    color: colors.muted,
    fontFamily: fonts.body,
    lineHeight: 1.4,
  };

  const numberStyle: Style = {
    fontSize: 10,
    fontWeight: 400,
    color: colors.secondary,
    fontFamily: style.fontStyle.monoNumbers ? fonts.mono : fonts.body,
  };

  const headingStyle: Style = {
    fontSize: 14,
    fontWeight: 600,
    color: colors.primary,
    fontFamily: fonts.heading,
  };

  // Avatar style
  const avatarStyle: Style = {
    width: 32,
    height: 32,
    borderRadius: 4,
    backgroundColor: colors.avatarBg,
    alignItems: "center",
    justifyContent: "center",
  };

  // Consistent horizontal padding for all sections
  const sectionPadding = spacing.page;
  // Column widths for the line items table
  const QTY_WIDTH = 50;
  const PRICE_WIDTH = 80;
  const AMOUNT_WIDTH = 90;
  const COLUMN_GAP = 24;
  const RIGHT_COLUMNS_WIDTH =
    QTY_WIDTH + PRICE_WIDTH + AMOUNT_WIDTH + COLUMN_GAP;
  // Page margin adds outer padding around all content
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
        fontFamily: fonts.body,
        backgroundColor: colors.background,
        padding: pageMarginSize,
      }}
    >
      {/* Header - Large title with document info (Step 4: Invoice terms) */}
      <Section
        stepIndex={4}
        stepLabel="Invoice terms"
        currentStep={currentStep}
        onStepClick={onStepClick}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingTop: sectionPadding,
          paddingHorizontal: sectionPadding,
          paddingBottom: 20,
          borderBottomWidth: 2,
          borderBottomColor: colors.primary,
        }}
      >
        {/* Document Title */}
        <View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: colors.primary,
              fontFamily: fonts.heading,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {documentTitles[invoice.locale as InvoiceLocale]?.[
              invoice.documentType
            ] || documentTitles["en-US"][invoice.documentType]}
          </Text>
        </View>

        {/* Document Info Block */}
        <View style={{ alignItems: "flex-end" }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Text style={{ ...labelStyle, marginRight: 8 }}>
              {docLabels.documentNo}
            </Text>
            <Text
              style={{
                ...numberStyle,
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {invoice.invoiceNumber || "-"}
            </Text>
          </View>
          {/* Dates with fixed label width for alignment */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <Text
              style={{
                ...mutedTextStyle,
                width: 70,
                textAlign: "right",
                marginRight: 8,
              }}
            >
              {t.issued}:
            </Text>
            <Text style={mutedTextStyle}>
              {formatDate(invoice.issueDate, dateLocale)}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                ...mutedTextStyle,
                width: 70,
                textAlign: "right",
                marginRight: 8,
              }}
            >
              {docLabels.dateLabel}:
            </Text>
            <Text style={mutedTextStyle}>
              {formatDate(invoice.dueDate, dateLocale)}
            </Text>
          </View>
        </View>
      </Section>

      {/* From / To Section - uses same paddingHorizontal as table for alignment */}
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: sectionPadding,
        }}
      >
        {/* From - left column (Step 0: Your company) */}
        <Section
          stepIndex={0}
          stepLabel="Your company"
          currentStep={currentStep}
          onStepClick={onStepClick}
          style={{
            flex: 1,
            marginLeft: -sectionPadding,
            paddingLeft: sectionPadding,
            paddingVertical: 24,
          }}
        >
          <Text style={{ ...labelStyle, marginBottom: 12 }}>{t.from}</Text>

          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            {/* Logo/Avatar */}
            {invoice.showFromLogo && (
              <View style={{ marginRight: 12 }}>
                {invoice.fromLogoUrl ? (
                  <Image
                    src={invoice.fromLogoUrl}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 4,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <View style={avatarStyle}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: colors.primary,
                      }}
                    >
                      {getInitial(invoice.fromName)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Details */}
            <View style={{ flex: 1 }}>
              {/* Name section */}
              <View style={{ marginBottom: 8 }}>
                <Text style={headingStyle}>{invoice.fromName || "-"}</Text>
                {invoice.fromSubtitle && (
                  <Text style={{ ...mutedTextStyle, opacity: 0.8 }}>
                    {invoice.fromSubtitle}
                  </Text>
                )}
              </View>
              {/* Contact details */}
              {invoice.fromEmail && (
                <Text style={textStyle}>{invoice.fromEmail}</Text>
              )}
              {invoice.fromAddress && (
                <Text style={mutedTextStyle}>{invoice.fromAddress}</Text>
              )}
              {invoice.fromCity && (
                <Text style={mutedTextStyle}>{invoice.fromCity}</Text>
              )}
              <Text style={mutedTextStyle}>{fromCountryConfig.name}</Text>
              {invoice.fromPhone && (
                <Text style={mutedTextStyle}>{invoice.fromPhone}</Text>
              )}
              {invoice.fromTaxId && (
                <Text style={mutedTextStyle}>
                  {fromCountryConfig.taxId.label}: {invoice.fromTaxId}
                </Text>
              )}
              {invoice.showFromRegistrationId &&
                invoice.fromRegistrationId &&
                fromCountryConfig.registrationId.available && (
                  <Text style={mutedTextStyle}>
                    {fromCountryConfig.registrationId.label}:{" "}
                    {invoice.fromRegistrationId}
                  </Text>
                )}
            </View>
          </View>
        </Section>

        {/* To - right column (Step 1: Your client) - aligned with Qty/Price/Amount columns */}
        <Section
          stepIndex={1}
          stepLabel="Your client"
          currentStep={currentStep}
          onStepClick={onStepClick}
          style={{
            width: RIGHT_COLUMNS_WIDTH + sectionPadding,
            marginRight: -sectionPadding,
            paddingRight: sectionPadding,
            paddingLeft: COLUMN_GAP,
            paddingVertical: 24,
          }}
        >
          <Text style={{ ...labelStyle, marginBottom: 12 }}>{t.to}</Text>

          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            {/* Logo/Avatar */}
            {invoice.showCustomerLogo && (
              <View style={{ marginRight: 12 }}>
                {invoice.customerLogoUrl ? (
                  <Image
                    src={invoice.customerLogoUrl}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 4,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <View style={avatarStyle}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: colors.primary,
                      }}
                    >
                      {getInitial(invoice.customerName)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Details */}
            <View style={{ flex: 1 }}>
              {/* Name section */}
              <View style={{ marginBottom: 8 }}>
                <Text style={headingStyle}>{invoice.customerName || "-"}</Text>
                {invoice.customerSubtitle && (
                  <Text style={{ ...mutedTextStyle, opacity: 0.8 }}>
                    {invoice.customerSubtitle}
                  </Text>
                )}
              </View>
              {/* Contact details */}
              {invoice.customerEmail && (
                <Text style={textStyle}>{invoice.customerEmail}</Text>
              )}
              {invoice.customerAddress && (
                <Text style={mutedTextStyle}>{invoice.customerAddress}</Text>
              )}
              {invoice.customerCity && (
                <Text style={mutedTextStyle}>{invoice.customerCity}</Text>
              )}
              <Text style={mutedTextStyle}>{customerCountryConfig.name}</Text>
              {invoice.customerPhone && (
                <Text style={mutedTextStyle}>{invoice.customerPhone}</Text>
              )}
              {invoice.customerTaxId && (
                <Text style={mutedTextStyle}>
                  {customerCountryConfig.taxId.label}: {invoice.customerTaxId}
                </Text>
              )}
              {invoice.showCustomerRegistrationId &&
                invoice.customerRegistrationId &&
                customerCountryConfig.registrationId.available && (
                  <Text style={mutedTextStyle}>
                    {customerCountryConfig.registrationId.label}:{" "}
                    {invoice.customerRegistrationId}
                  </Text>
                )}
            </View>
          </View>
        </Section>
      </View>

      {/* Line Items Table (Step 2: Invoice details) */}
      <Section
        stepIndex={2}
        stepLabel="Invoice details"
        currentStep={currentStep}
        onStepClick={onStepClick}
        style={{ flex: 1 }}
      >
        {/* Table Header */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: colors.avatarBg,
            paddingVertical: 10,
            paddingHorizontal: sectionPadding,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ ...labelStyle, color: colors.primary }}>
              {t.description}
            </Text>
          </View>
          <View style={{ width: COLUMN_GAP }} />
          <Text
            style={{
              ...labelStyle,
              color: colors.primary,
              width: QTY_WIDTH,
              textAlign: "left",
            }}
          >
            {t.qty}
          </Text>
          <Text
            style={{
              ...labelStyle,
              color: colors.primary,
              width: PRICE_WIDTH,
              textAlign: "right",
            }}
          >
            {t.price}
          </Text>
          <Text
            style={{
              ...labelStyle,
              color: colors.primary,
              width: AMOUNT_WIDTH,
              textAlign: "right",
            }}
          >
            {t.amount}
          </Text>
        </View>

        {/* Line Items */}
        {invoice.lineItems.map((item, index) => {
          const itemTextStyle: Style = {
            fontSize: 10,
            fontWeight: 400,
            color: colors.primary,
            fontFamily: fonts.body,
            lineHeight: 1.25,
          };

          return (
            <View
              key={item.id || index}
              style={{
                flexDirection: "row",
                paddingVertical: 12,
                paddingHorizontal: sectionPadding,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                alignItems: "flex-start",
              }}
            >
              <View style={{ flex: 1 }}>
                {item.name ? (
                  lexicalToPdf(parseLexicalState(item.name), itemTextStyle)
                ) : (
                  <Text style={itemTextStyle}>-</Text>
                )}
              </View>
              <View style={{ width: COLUMN_GAP }} />
              <Text
                style={{
                  ...numberStyle,
                  width: QTY_WIDTH,
                  textAlign: "left",
                }}
              >
                {item.quantity}
              </Text>
              <Text
                style={{
                  ...numberStyle,
                  width: PRICE_WIDTH,
                  textAlign: "right",
                }}
              >
                {formatCurrency(
                  item.price,
                  invoice.currency,
                  invoice.numberLocale,
                )}
              </Text>
              <Text
                style={{
                  ...numberStyle,
                  width: AMOUNT_WIDTH,
                  textAlign: "right",
                }}
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
          );
        })}

        {/* Note + Totals Row */}
        <View
          style={{
            flexDirection: "row",
            paddingTop: 12,
            paddingHorizontal: sectionPadding,
            alignItems: "flex-start",
          }}
        >
          {/* Note - left column */}
          <View style={{ flex: 1 }}>
            {/* Label row aligned with Subtotal */}
            <View style={{ height: 24, justifyContent: "center" }}>
              <Text style={labelStyle}>{t.note}</Text>
            </View>
            <Text
              style={{
                fontSize: 9,
                color: colors.muted,
                fontFamily: fonts.body,
                lineHeight: 1.4,
              }}
            >
              {invoice.notes || "-"}
            </Text>
          </View>

          {/* Totals - right columns */}
          {/* Qty column - empty spacer */}
          <View style={{ width: COLUMN_GAP }} />
          <View style={{ width: QTY_WIDTH }} />

          {/* Price column - Labels */}
          <View style={{ width: PRICE_WIDTH }}>
            {/* Subtotal label */}
            <View style={{ height: 24, justifyContent: "center" }}>
              <Text style={{ ...textStyle, color: colors.muted }}>
                {t.subtotal}
              </Text>
            </View>

            {/* Discount label */}
            {invoice.includeDiscount && invoice.discount > 0 && (
              <View style={{ height: 24, justifyContent: "center" }}>
                <Text style={{ ...textStyle, color: colors.muted }}>
                  {t.discount}
                </Text>
              </View>
            )}

            {/* Tax label */}
            {(invoice.showTaxIfZero ||
              (invoice.includeTax && invoice.taxRate > 0)) && (
              <View style={{ height: 24, justifyContent: "center" }}>
                <Text style={{ ...textStyle, color: colors.muted }}>
                  {t.tax} ({invoice.taxRate}%)
                </Text>
              </View>
            )}

            {/* Total label */}
            <View
              style={{
                height: 32,
                justifyContent: "center",
                borderTopWidth: 1,
                borderTopColor: colors.border,
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: colors.primary,
                  fontFamily: fonts.body,
                  textTransform: "uppercase",
                }}
              >
                {t.total}
              </Text>
            </View>
          </View>

          {/* Amount column - Values */}
          <View style={{ width: AMOUNT_WIDTH }}>
            {/* Subtotal value */}
            <View style={{ height: 24, justifyContent: "center" }}>
              <Text style={{ ...numberStyle, textAlign: "right" }}>
                {formatCurrency(
                  totals.subTotal,
                  invoice.currency,
                  invoice.numberLocale,
                )}
              </Text>
            </View>

            {/* Discount value */}
            {invoice.includeDiscount && invoice.discount > 0 && (
              <View style={{ height: 24, justifyContent: "center" }}>
                <Text style={{ ...numberStyle, textAlign: "right" }}>
                  -
                  {formatCurrency(
                    invoice.discount,
                    invoice.currency,
                    invoice.numberLocale,
                  )}
                </Text>
              </View>
            )}

            {/* Tax value */}
            {(invoice.showTaxIfZero ||
              (invoice.includeTax && invoice.taxRate > 0)) && (
              <View style={{ height: 24, justifyContent: "center" }}>
                <Text style={{ ...numberStyle, textAlign: "right" }}>
                  {formatCurrency(
                    totals.tax,
                    invoice.currency,
                    invoice.numberLocale,
                  )}
                </Text>
              </View>
            )}

            {/* Total value */}
            <View
              style={{
                height: 32,
                justifyContent: "center",
                borderTopWidth: 1,
                borderTopColor: colors.border,
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: colors.accent,
                  fontFamily: style.fontStyle.monoNumbers
                    ? fonts.mono
                    : fonts.heading,
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

      {/* Payment Details Footer (Step 3: Payment details) */}
      {(invoice.paymentDetails || invoice.paymentDetailsSecondary) && (
        <Section
          stepIndex={3}
          stepLabel="Payment details"
          currentStep={currentStep}
          onStepClick={onStepClick}
          style={{
            paddingTop: 20,
            paddingHorizontal: sectionPadding,
            paddingBottom: sectionPadding,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            flexDirection: "row",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ ...labelStyle, marginBottom: 8 }}>
              {t.paymentDetails}
            </Text>
            <Text style={{ ...textStyle, fontSize: 9 }}>
              {invoice.paymentDetails || "-"}
            </Text>
          </View>
          {invoice.paymentDetailsSecondary && (
            <View style={{ flex: 1, paddingLeft: 24 }}>
              <Text style={{ ...labelStyle, marginBottom: 8, opacity: 0 }}>
                &nbsp;
              </Text>
              <Text style={{ ...textStyle, fontSize: 9 }}>
                {invoice.paymentDetailsSecondary}
              </Text>
            </View>
          )}
        </Section>
      )}
    </Page>
  );
}
