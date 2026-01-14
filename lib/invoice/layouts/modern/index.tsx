"use client";

import { Image, Page, Text, View } from "@rawwee/react-pdf-html";
import type { Style } from "@react-pdf/types";
import { calculateLineItemTotal } from "../../calculate";
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
  "fr-FR": {
    invoice: "Facture",
    quote: "Devis",
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
              alignItems: "baseline",
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
              alignItems: "baseline",
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
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
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

      {/* From / To Section */}
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
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
            paddingLeft: sectionPadding,
            paddingRight: 16,
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
              <Text style={headingStyle}>{invoice.fromName || "-"}</Text>
              {invoice.fromSubtitle && (
                <Text style={{ ...mutedTextStyle, marginBottom: 4 }}>
                  {invoice.fromSubtitle}
                </Text>
              )}
              {invoice.fromEmail && (
                <Text style={textStyle}>{invoice.fromEmail}</Text>
              )}
              {invoice.fromAddress && (
                <Text style={mutedTextStyle}>{invoice.fromAddress}</Text>
              )}
              {(invoice.fromCity || invoice.fromCountry) && (
                <Text style={mutedTextStyle}>
                  {[invoice.fromCity, invoice.fromCountry]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              )}
              {invoice.fromPhone && (
                <Text style={mutedTextStyle}>{invoice.fromPhone}</Text>
              )}
              {invoice.fromTaxId && (
                <Text style={mutedTextStyle}>
                  {t.taxId}: {invoice.fromTaxId}
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
            width: 220 + sectionPadding,
            paddingLeft: 0,
            paddingRight: sectionPadding,
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
              <Text style={headingStyle}>{invoice.customerName || "-"}</Text>
              {invoice.customerSubtitle && (
                <Text style={{ ...mutedTextStyle, marginBottom: 4 }}>
                  {invoice.customerSubtitle}
                </Text>
              )}
              {invoice.customerEmail && (
                <Text style={textStyle}>{invoice.customerEmail}</Text>
              )}
              {invoice.customerAddress && (
                <Text style={mutedTextStyle}>{invoice.customerAddress}</Text>
              )}
              {(invoice.customerCity || invoice.customerCountry) && (
                <Text style={mutedTextStyle}>
                  {[invoice.customerCity, invoice.customerCountry]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              )}
              {invoice.customerPhone && (
                <Text style={mutedTextStyle}>{invoice.customerPhone}</Text>
              )}
              {invoice.customerTaxId && (
                <Text style={mutedTextStyle}>
                  {t.taxId}: {invoice.customerTaxId}
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
          <Text
            style={{
              ...labelStyle,
              color: colors.primary,
              width: 50,
              textAlign: "center",
            }}
          >
            {t.qty}
          </Text>
          <Text
            style={{
              ...labelStyle,
              color: colors.primary,
              width: 80,
              textAlign: "right",
            }}
          >
            {t.price}
          </Text>
          <Text
            style={{
              ...labelStyle,
              color: colors.primary,
              width: 90,
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
              <Text style={{ ...numberStyle, width: 50, textAlign: "center" }}>
                {item.quantity}
              </Text>
              <Text style={{ ...numberStyle, width: 80, textAlign: "right" }}>
                {formatCurrency(
                  item.price,
                  invoice.currency,
                  invoice.numberLocale,
                )}
              </Text>
              <Text style={{ ...numberStyle, width: 90, textAlign: "right" }}>
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

          {/* Totals - right columns (50 + 80 + 90 = 220) */}
          {/* Qty column (50px) - empty spacer */}
          <View style={{ width: 50 }} />

          {/* Price column (80px) - Labels */}
          <View style={{ width: 80 }}>
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

          {/* Amount column (90px) - Values */}
          <View style={{ width: 90 }}>
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
      {invoice.paymentDetails && (
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
          }}
        >
          <Text style={{ ...labelStyle, marginBottom: 8 }}>
            {t.paymentDetails}
          </Text>
          <Text style={textStyle}>{invoice.paymentDetails}</Text>
        </Section>
      )}
    </Page>
  );
}
