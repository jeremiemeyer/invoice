"use client";

import { Image, Page, Text, View } from "@rawwee/react-pdf-html";
import type { Style } from "@react-pdf/types";
import { calculateLineItemTotal } from "../../calculate";
import { formatCurrency } from "../../format-currency";
import { lexicalToPlainText, parseLexicalState } from "../../lexical-to-html";
import type { LayoutProps } from "../types";

// Helper to format dates
function formatDate(dateStr: string, locale: string): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "2-digit",
    year: "2-digit",
  });
}

// Get initial letter for avatar placeholder
function getInitial(name: string): string {
  return name?.charAt(0)?.toUpperCase() || "?";
}

/**
 * Classic layout - clean, professional invoice design.
 * This layout mirrors the original HTML invoice structure
 * using React-PDF components for WYSIWYG rendering.
 */
export function ClassicLayout({
  invoice,
  totals,
  style,
  translations: t,
  documentTypeLabels: docLabels,
  dateLocale,
}: LayoutProps) {
  const { colors, fonts, spacing } = style;

  // Common text styles
  const labelStyle: Style = {
    fontSize: 8,
    fontWeight: style.fontStyle.labelWeight,
    color: colors.muted,
    textTransform: "uppercase",
    fontFamily: fonts.body,
  };

  const textStyle: Style = {
    fontSize: 10,
    fontWeight: 400,
    color: colors.secondary,
    fontFamily: fonts.body,
  };

  const mutedTextStyle: Style = {
    fontSize: 10,
    fontWeight: 400,
    color: colors.muted,
    fontFamily: fonts.body,
  };

  const numberStyle: Style = {
    fontSize: 10,
    fontWeight: 400,
    color: colors.secondary,
    fontFamily: fonts.mono,
  };

  const headingStyle: Style = {
    fontSize: 18,
    fontWeight: 500,
    color: colors.primary,
    fontFamily: fonts.body,
  };

  // Avatar style
  const avatarStyle: Style = {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.avatarBg,
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <Page
      size={invoice.pageSize}
      style={{
        fontFamily: fonts.body,
        backgroundColor: colors.background,
        paddingBottom: spacing.page,
      }}
    >
      {/* Invoice Terms - Top bar */}
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          height: 56,
          paddingHorizontal: spacing.page,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* Invoice Number */}
        <View style={{ flex: 1 }}>
          <Text style={labelStyle}>{docLabels.documentNo}</Text>
          <Text style={{ ...numberStyle, fontWeight: 500 }}>
            {invoice.invoiceNumber || "-"}
          </Text>
        </View>

        {/* Dates */}
        <View style={{ flexDirection: "row", paddingLeft: 32 }}>
          <View style={{ minWidth: 60 }}>
            <Text style={labelStyle}>{t.issued}</Text>
            <Text style={textStyle}>
              {formatDate(invoice.issueDate, dateLocale)}
            </Text>
          </View>
          <View style={{ marginLeft: 24 }}>
            <Text style={labelStyle}>{docLabels.dateLabel}</Text>
            <Text style={textStyle}>
              {formatDate(invoice.dueDate, dateLocale)}
            </Text>
          </View>
        </View>
      </View>

      {/* From / To Grid */}
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {/* Your Company - Left */}
        <View
          style={{
            flex: 1,
            padding: spacing.page,
            paddingTop: 24,
            paddingBottom: 24,
            borderRightWidth: 1,
            borderRightColor: colors.border,
          }}
        >
          <Text style={{ ...labelStyle, marginBottom: 8 }}>{t.from}</Text>

          {/* Logo/Avatar */}
          {invoice.showFromLogo && (
            <View style={{ marginBottom: 8 }}>
              {invoice.fromLogoUrl ? (
                <Image
                  src={invoice.fromLogoUrl}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <View style={avatarStyle}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: colors.primary,
                    }}
                  >
                    {getInitial(invoice.fromName)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Company Name */}
          <View style={{ marginBottom: 8 }}>
            <Text style={headingStyle}>{invoice.fromName || "-"}</Text>
            {invoice.fromSubtitle && (
              <Text style={{ ...mutedTextStyle, opacity: 0.8 }}>
                {invoice.fromSubtitle}
              </Text>
            )}
          </View>

          {/* Contact Details */}
          {invoice.fromEmail && (
            <Text style={textStyle}>{invoice.fromEmail}</Text>
          )}
          {invoice.fromAddress && (
            <Text style={mutedTextStyle}>{invoice.fromAddress}</Text>
          )}
          {invoice.fromCity && (
            <Text style={mutedTextStyle}>{invoice.fromCity}</Text>
          )}
          {invoice.fromCountry && (
            <Text style={mutedTextStyle}>{invoice.fromCountry}</Text>
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

        {/* Your Client - Right */}
        <View
          style={{
            flex: 1,
            padding: spacing.page,
            paddingTop: 24,
            paddingBottom: 24,
          }}
        >
          <Text style={{ ...labelStyle, marginBottom: 8 }}>{t.to}</Text>

          {/* Logo/Avatar */}
          {invoice.showCustomerLogo && (
            <View style={{ marginBottom: 8 }}>
              {invoice.customerLogoUrl ? (
                <Image
                  src={invoice.customerLogoUrl}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    objectFit: "cover",
                  }}
                />
              ) : (
                <View style={avatarStyle}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: colors.primary,
                    }}
                  >
                    {getInitial(invoice.customerName)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Client Name */}
          <View style={{ marginBottom: 8 }}>
            <Text style={headingStyle}>{invoice.customerName || "-"}</Text>
            {invoice.customerSubtitle && (
              <Text style={{ ...mutedTextStyle, opacity: 0.8 }}>
                {invoice.customerSubtitle}
              </Text>
            )}
          </View>

          {/* Contact Details */}
          {invoice.customerEmail && (
            <Text style={textStyle}>{invoice.customerEmail}</Text>
          )}
          {invoice.customerAddress && (
            <Text style={mutedTextStyle}>{invoice.customerAddress}</Text>
          )}
          {invoice.customerCity && (
            <Text style={mutedTextStyle}>{invoice.customerCity}</Text>
          )}
          {invoice.customerCountry && (
            <Text style={mutedTextStyle}>{invoice.customerCountry}</Text>
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

      {/* Invoice Details - Line Items */}
      <View style={{ padding: spacing.page, paddingTop: 24, flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", marginBottom: 4 }}>
          <View style={{ flex: 1 }}>
            <Text style={labelStyle}>{t.description}</Text>
          </View>
          <View style={{ flexDirection: "row", paddingLeft: 16, width: 200 }}>
            <Text style={{ ...labelStyle, width: 50 }}>{t.qty}</Text>
            <Text style={{ ...labelStyle, flex: 1 }}>{t.price}</Text>
            <Text style={{ ...labelStyle, flex: 1, textAlign: "right" }}>
              {t.amount}
            </Text>
          </View>
        </View>

        {/* Line Items */}
        {invoice.lineItems.map((item, index) => (
          <View
            key={item.id || index}
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingVertical: 12,
              minHeight: 40,
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 10, fontWeight: 500, color: colors.primary }}
              >
                {item.name
                  ? lexicalToPlainText(parseLexicalState(item.name))
                  : "-"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", paddingLeft: 16, width: 200 }}>
              <Text style={{ ...numberStyle, width: 50 }}>{item.quantity}</Text>
              <Text style={{ ...numberStyle, flex: 1 }}>
                {formatCurrency(
                  item.price,
                  invoice.currency,
                  invoice.numberLocale,
                )}
              </Text>
              <Text style={{ ...numberStyle, flex: 1, textAlign: "right" }}>
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
        ))}

        {/* Note + Totals */}
        <View style={{ flexDirection: "row", paddingTop: 12 }}>
          {/* Note */}
          <View style={{ flex: 1, paddingRight: 24 }}>
            <View
              style={{
                minHeight: 40,
                justifyContent: "center",
                paddingVertical: 8,
              }}
            >
              <Text style={labelStyle}>{t.note}</Text>
            </View>
            <Text
              style={{
                fontSize: 8,
                fontWeight: 500,
                color: colors.muted,
              }}
            >
              {invoice.notes || "-"}
            </Text>
          </View>

          {/* Totals */}
          <View style={{ width: 200, paddingLeft: 32 }}>
            {/* Subtotal */}
            <View
              style={{
                flexDirection: "row",
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                minHeight: 40,
                alignItems: "center",
                paddingVertical: 8,
              }}
            >
              <Text style={{ ...textStyle, flex: 1, color: colors.muted }}>
                {t.subtotal}
              </Text>
              <Text style={{ ...numberStyle, textAlign: "right" }}>
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
                  minHeight: 40,
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <Text style={{ ...textStyle, flex: 1, color: colors.muted }}>
                  {t.discount}
                </Text>
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

            {/* Tax */}
            {(invoice.showTaxIfZero ||
              (invoice.includeTax && invoice.taxRate > 0)) && (
              <View
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  minHeight: 40,
                  alignItems: "center",
                  paddingVertical: 8,
                }}
              >
                <Text style={{ ...textStyle, flex: 1, color: colors.muted }}>
                  {t.tax} ({invoice.taxRate}%)
                </Text>
                <Text style={{ ...numberStyle, textAlign: "right" }}>
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
                minHeight: 40,
                alignItems: "center",
                paddingVertical: 8,
              }}
            >
              <Text style={{ ...textStyle, flex: 1, color: colors.muted }}>
                {t.total}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.accent,
                  fontFamily: fonts.mono,
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
      </View>

      {/* Payment Details - Bottom */}
      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: colors.border,
          padding: spacing.page,
          paddingTop: 24,
          paddingBottom: 24,
          flexDirection: "row",
        }}
      >
        <View style={{ flex: 1, paddingRight: 24 }}>
          <Text style={labelStyle}>{t.paymentDetails}</Text>
          <Text style={{ ...textStyle, marginTop: 4, fontSize: 9 }}>
            {invoice.paymentDetails || "-"}
          </Text>
        </View>
        {invoice.paymentDetailsSecondary && (
          <View style={{ width: 200, paddingLeft: 32 }}>
            <Text style={{ ...labelStyle, opacity: 0 }}>&nbsp;</Text>
            <Text style={{ ...textStyle, marginTop: 4, fontSize: 9 }}>
              {invoice.paymentDetailsSecondary}
            </Text>
          </View>
        )}
      </View>
    </Page>
  );
}
