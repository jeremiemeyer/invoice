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
 * Compact layout - dense, efficient invoice design.
 * Features a horizontal header with company info and invoice details,
 * optimized for fitting more content on a single page.
 */
export function CompactLayout({
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

  // Common text styles - slightly smaller for compact layout
  const labelStyle: Style = {
    fontSize: 7,
    fontWeight: style.fontStyle.labelWeight,
    color: colors.muted,
    textTransform: "uppercase",
    fontFamily: style.fontStyle.monoLabels ? fonts.mono : fonts.body,
    letterSpacing: 0.3,
    lineHeight: 1.2,
  };

  const textStyle: Style = {
    fontSize: 9,
    fontWeight: 400,
    color: colors.secondary,
    fontFamily: fonts.body,
    lineHeight: 1.3,
  };

  const mutedTextStyle: Style = {
    fontSize: 8,
    fontWeight: 400,
    color: colors.muted,
    fontFamily: fonts.body,
    lineHeight: 1.3,
  };

  const numberStyle: Style = {
    fontSize: 9,
    fontWeight: 400,
    color: colors.secondary,
    fontFamily: style.fontStyle.monoNumbers ? fonts.mono : fonts.body,
    lineHeight: 1.2,
  };

  const headingStyle: Style = {
    fontSize: 12,
    fontWeight: 600,
    color: colors.primary,
    fontFamily: fonts.heading,
    lineHeight: 1.2,
  };

  // Avatar style - smaller for compact
  const avatarStyle: Style = {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.avatarBg,
    alignItems: "center",
    justifyContent: "center",
  };

  const itemTextStyle: Style = {
    fontSize: 9,
    fontWeight: 400,
    color: colors.primary,
    fontFamily: fonts.body,
    lineHeight: 1.25,
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
      {/* Header Row - Company + Invoice Info */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {/* Left - Company Info (Step 0: Your company) */}
        <Section
          stepIndex={0}
          stepLabel="Your company"
          currentStep={currentStep}
          onStepClick={onStepClick}
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            flex: 1,
            paddingTop: sectionPadding - 8,
            paddingLeft: sectionPadding,
            paddingBottom: 16,
          }}
        >
          {/* Logo/Avatar */}
          {invoice.showFromLogo && (
            <View style={{ marginRight: 10 }}>
              {invoice.fromLogoUrl ? (
                <Image
                  src={invoice.fromLogoUrl}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <View style={avatarStyle}>
                  <Text
                    style={{
                      fontSize: 12,
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

          {/* Company Details */}
          <View style={{ flex: 1 }}>
            <Text style={{ ...headingStyle, marginBottom: 2 }}>
              {invoice.fromName || "-"}
            </Text>
            {invoice.fromSubtitle && (
              <Text style={mutedTextStyle}>{invoice.fromSubtitle}</Text>
            )}
            {invoice.fromEmail && (
              <Text style={textStyle}>{invoice.fromEmail}</Text>
            )}
            <Text style={mutedTextStyle}>
              {[invoice.fromAddress, invoice.fromCity, invoice.fromCountry]
                .filter(Boolean)
                .join(", ")}
            </Text>
            {invoice.fromTaxId && (
              <Text style={mutedTextStyle}>
                {t.taxId}: {invoice.fromTaxId}
              </Text>
            )}
          </View>
        </Section>

        {/* Right - Invoice Info (Step 4: Invoice terms) */}
        <Section
          stepIndex={4}
          stepLabel="Invoice terms"
          currentStep={currentStep}
          onStepClick={onStepClick}
          style={{
            alignItems: "flex-end",
            minWidth: 160,
            paddingTop: sectionPadding - 8,
            paddingRight: sectionPadding,
            paddingBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: colors.primary,
              fontFamily: fonts.heading,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              marginBottom: 4,
            }}
          >
            {documentTitles[invoice.locale as InvoiceLocale]?.[
              invoice.documentType
            ] || documentTitles["en-US"][invoice.documentType]}
          </Text>
          <Text
            style={{
              ...numberStyle,
              fontSize: 11,
              fontWeight: 600,
              color: colors.primary,
              marginBottom: 6,
            }}
          >
            {invoice.invoiceNumber || "-"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={{ ...labelStyle, marginRight: 4 }}>{t.issued}</Text>
            <Text style={mutedTextStyle}>
              {formatDate(invoice.issueDate, dateLocale)}
            </Text>
            <Text style={{ ...mutedTextStyle, marginHorizontal: 6 }}>→</Text>
            <Text style={{ ...labelStyle, marginRight: 4 }}>
              {docLabels.dateLabel}
            </Text>
            <Text style={mutedTextStyle}>
              {formatDate(invoice.dueDate, dateLocale)}
            </Text>
          </View>
        </Section>
      </View>

      {/* Bill To Section (Step 1: Your client) */}
      <Section
        stepIndex={1}
        stepLabel="Your client"
        currentStep={currentStep}
        onStepClick={onStepClick}
        style={{
          paddingVertical: 16,
          paddingHorizontal: sectionPadding,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ ...labelStyle, marginBottom: 6 }}>{t.to}</Text>
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          {/* Logo/Avatar */}
          {invoice.showCustomerLogo && (
            <View style={{ marginRight: 10 }}>
              {invoice.customerLogoUrl ? (
                <Image
                  src={invoice.customerLogoUrl}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <View style={avatarStyle}>
                  <Text
                    style={{
                      fontSize: 12,
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

          {/* Client Details */}
          <View style={{ flex: 1 }}>
            <Text style={{ ...headingStyle, marginBottom: 2 }}>
              {invoice.customerName || "-"}
            </Text>
            {invoice.customerSubtitle && (
              <Text style={mutedTextStyle}>{invoice.customerSubtitle}</Text>
            )}
            {invoice.customerEmail && (
              <Text style={textStyle}>{invoice.customerEmail}</Text>
            )}
            <Text style={mutedTextStyle}>
              {[
                invoice.customerAddress,
                invoice.customerCity,
                invoice.customerCountry,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
            {invoice.customerTaxId && (
              <Text style={mutedTextStyle}>
                {t.taxId}: {invoice.customerTaxId}
              </Text>
            )}
          </View>
        </View>
      </Section>

      {/* Line Items Table (Step 2: Invoice details) */}
      <Section
        stepIndex={2}
        stepLabel="Invoice details"
        currentStep={currentStep}
        onStepClick={onStepClick}
        style={{ flex: 1, paddingHorizontal: sectionPadding, paddingTop: 16 }}
      >
        {/* Table Header */}
        <View
          style={{
            flexDirection: "row",
            paddingBottom: 6,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            marginBottom: 4,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>{t.description}</Text>
          </View>
          <Text style={{ ...labelStyle, width: 40, textAlign: "center" }}>
            {t.qty}
          </Text>
          <Text style={{ ...labelStyle, width: 70, textAlign: "right" }}>
            {t.price}
          </Text>
          <Text style={{ ...labelStyle, width: 80, textAlign: "right" }}>
            {t.amount}
          </Text>
        </View>

        {/* Line Items */}
        {invoice.lineItems.map((item, index) => (
          <View
            key={item.id || index}
            style={{
              flexDirection: "row",
              paddingVertical: 8,
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
            <Text style={{ ...numberStyle, width: 40, textAlign: "center" }}>
              {item.quantity}
            </Text>
            <Text style={{ ...numberStyle, width: 70, textAlign: "right" }}>
              {formatCurrency(
                item.price,
                invoice.currency,
                invoice.numberLocale,
              )}
            </Text>
            <Text style={{ ...numberStyle, width: 80, textAlign: "right" }}>
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
        ))}

        {/* Note + Totals Row */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 12,
            alignItems: "flex-start",
          }}
        >
          {/* Note - Left side */}
          <View style={{ flex: 1, paddingRight: 16 }}>
            {/* Label row - same height as Subtotal row */}
            <View
              style={{
                height: 22,
                justifyContent: "center",
              }}
            >
              <Text style={labelStyle}>{t.note}</Text>
            </View>
            {/* Note content below */}
            <Text style={mutedTextStyle}>{invoice.notes || "-"}</Text>
          </View>

          {/* Totals - Right side */}
          <View style={{ width: 180 }}>
            {/* Subtotal - first row */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                height: 22,
                alignItems: "center",
              }}
            >
              <Text style={mutedTextStyle}>{t.subtotal}</Text>
              <Text style={numberStyle}>
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
                  justifyContent: "space-between",
                  height: 22,
                  alignItems: "center",
                }}
              >
                <Text style={mutedTextStyle}>{t.discount}</Text>
                <Text style={numberStyle}>
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
                  justifyContent: "space-between",
                  height: 22,
                  alignItems: "center",
                }}
              >
                <Text style={mutedTextStyle}>
                  {t.tax} ({invoice.taxRate}%)
                </Text>
                <Text style={numberStyle}>
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
                justifyContent: "space-between",
                paddingTop: 8,
                marginTop: 4,
                borderTopWidth: 2,
                borderTopColor: colors.primary,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: colors.primary,
                  fontFamily: fonts.body,
                  textTransform: "uppercase",
                }}
              >
                {t.total}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: colors.primary,
                  fontFamily: style.fontStyle.monoNumbers
                    ? fonts.mono
                    : fonts.heading,
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
            paddingTop: 12,
            paddingHorizontal: sectionPadding,
            paddingBottom: sectionPadding,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text style={{ ...labelStyle, marginBottom: 4 }}>
            {t.paymentDetails}
          </Text>
          <Text style={textStyle}>{invoice.paymentDetails}</Text>
        </Section>
      )}
    </Page>
  );
}
