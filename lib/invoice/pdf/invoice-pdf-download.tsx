/**
 * Invoice PDF component for download (non-hook version).
 * This component renders using native React-PDF components for PDF generation.
 * Styling matches the HTML preview exactly for WYSIWYG output.
 */

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { calculateLineItemTotal } from "../calculate";
import { getCountryConfig } from "../countries";
import { formatCurrency } from "../format-currency";
import { lexicalToPlainText, parseLexicalState } from "../lexical-to-html";
import {
  getDocumentTypeLabels,
  getLocaleConfig,
  getTranslations,
} from "../translations";
import type { InvoiceFormState, InvoiceTotals } from "../types";

// Import font registration (side-effect)
import "./fonts";

export interface InvoicePdfDownloadProps {
  invoice: InvoiceFormState;
  totals: InvoiceTotals;
  layoutId?: string;
  styleId?: string;
}

// Color palette matching the HTML template (classic style)
const COLORS = {
  primary: "#111827", // gray-900 - main text
  secondary: "#4b5563", // gray-600 - secondary text
  muted: "#9ca3af", // gray-400 - labels
  border: "#e5e7eb", // gray-200 - borders
  avatarBg: "#e5e7eb", // gray-200 - avatar background
  background: "#ffffff",
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

/**
 * Creates the PDF document using native React-PDF components.
 * Styling matches invoice-document.tsx exactly.
 */
export function InvoicePdfForDownload({
  invoice,
  totals,
}: InvoicePdfDownloadProps) {
  const translations = getTranslations(invoice.locale);
  const documentTypeLabels = getDocumentTypeLabels(
    invoice.locale,
    invoice.documentType,
  );
  const localeConfig = getLocaleConfig(invoice.locale);

  // Country-specific ID labels
  const fromCountryConfig = getCountryConfig(invoice.fromCountryCode);
  const customerCountryConfig = getCountryConfig(invoice.customerCountryCode);

  // Styles matching the HTML template exactly
  // HTML uses px, React-PDF uses pt (at 72 DPI)
  // The preview renders at 1:1 scale, so we use the same values
  const styles = StyleSheet.create({
    page: {
      fontFamily: "Inter",
      backgroundColor: COLORS.background,
    },
    // Top bar - h-14 = 56px, px-8 = 32px
    topBar: {
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      height: 56,
      paddingHorizontal: 32,
      flexDirection: "row",
      alignItems: "center",
    },
    // Labels - text-[8px], uppercase, font-semibold
    label: {
      fontSize: 8,
      fontWeight: 600,
      color: COLORS.muted,
      textTransform: "uppercase",
    },
    // Body text - text-[10px], font-medium
    text: {
      fontSize: 10,
      fontWeight: 500,
      color: COLORS.secondary,
    },
    mutedText: {
      fontSize: 10,
      fontWeight: 500,
      color: COLORS.muted,
    },
    // Heading - text-lg = 18px
    heading: {
      fontSize: 18,
      fontWeight: 500,
      color: COLORS.primary,
      lineHeight: 1.2,
    },
    // Avatar - 36x36
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS.avatarBg,
      alignItems: "center",
      justifyContent: "center",
    },
    // From/To grid
    fromToGrid: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    // Section - px-8 py-6 = 32px 24px
    section: {
      flex: 1,
      paddingHorizontal: 32,
      paddingVertical: 24,
    },
    sectionLeft: {
      borderRightWidth: 1,
      borderRightColor: COLORS.border,
    },
    // Line items container - px-8 py-6
    lineItemsContainer: {
      paddingHorizontal: 32,
      paddingVertical: 24,
      flex: 1,
    },
    // Line item row - min-h-[40px], py-3 = 12px
    lineItem: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      paddingVertical: 12,
      minHeight: 40,
    },
    // Payment section - px-8 py-6
    paymentSection: {
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      paddingHorizontal: 32,
      paddingVertical: 24,
    },
    // Total row - min-h-[40px], py-2 = 8px
    totalRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      minHeight: 40,
      alignItems: "center",
      paddingVertical: 8,
    },
    totalRowLast: {
      flexDirection: "row",
      minHeight: 40,
      alignItems: "center",
      paddingVertical: 8,
    },
  });

  return (
    <Document>
      <Page size={invoice.pageSize} style={styles.page}>
        {/* Invoice Terms - Top bar (Step 4) */}
        <View style={styles.topBar}>
          {/* Invoice Number - left side */}
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{documentTypeLabels.documentNo}</Text>
            <Text
              style={{ fontSize: 10, fontWeight: 500, color: COLORS.primary }}
            >
              {invoice.invoiceNumber || "-"}
            </Text>
          </View>

          {/* Dates - right side with pl-8 = 32px */}
          <View style={{ flexDirection: "row", paddingLeft: 32 }}>
            <View style={{ minWidth: 60 }}>
              <Text style={styles.label}>{translations.issued}</Text>
              <Text style={styles.text}>
                {formatDate(invoice.issueDate, localeConfig.dateLocale)}
              </Text>
            </View>
            <View style={{ marginLeft: 24 }}>
              <Text style={styles.label}>{documentTypeLabels.dateLabel}</Text>
              <Text style={styles.text}>
                {formatDate(invoice.dueDate, localeConfig.dateLocale)}
              </Text>
            </View>
          </View>
        </View>

        {/* From / To Grid */}
        <View style={styles.fromToGrid}>
          {/* Your Company - Left (Step 0) */}
          <View style={[styles.section, styles.sectionLeft]}>
            <Text style={[styles.label, { marginBottom: 8 }]}>
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
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLORS.primary,
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
              <Text style={styles.heading}>{invoice.fromName || "-"}</Text>
              {invoice.fromSubtitle && (
                <Text style={[styles.mutedText, { opacity: 0.8 }]}>
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
            <Text style={styles.mutedText}>{fromCountryConfig.name}</Text>
            {invoice.fromPhone && (
              <Text style={styles.mutedText}>{invoice.fromPhone}</Text>
            )}
            {invoice.fromTaxId && (
              <Text style={styles.mutedText}>
                {fromCountryConfig.taxId.label}: {invoice.fromTaxId}
              </Text>
            )}
          </View>

          {/* Your Client - Right (Step 1) */}
          <View style={styles.section}>
            <Text style={[styles.label, { marginBottom: 8 }]}>
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
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 500,
                        color: COLORS.primary,
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
              <Text style={styles.heading}>{invoice.customerName || "-"}</Text>
              {invoice.customerSubtitle && (
                <Text style={[styles.mutedText, { opacity: 0.8 }]}>
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
            <Text style={styles.mutedText}>{customerCountryConfig.name}</Text>
            {invoice.customerPhone && (
              <Text style={styles.mutedText}>{invoice.customerPhone}</Text>
            )}
            {invoice.customerTaxId && (
              <Text style={styles.mutedText}>
                {customerCountryConfig.taxId.label}: {invoice.customerTaxId}
              </Text>
            )}
          </View>
        </View>

        {/* Invoice Details - Line items (Step 2) */}
        <View style={styles.lineItemsContainer}>
          {/* Header - grid-cols-2 */}
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>{translations.description}</Text>
            </View>
            {/* Right side with pl-8 and grid: 60px 1fr 1fr */}
            <View style={{ flexDirection: "row", paddingLeft: 32, flex: 1 }}>
              <Text style={[styles.label, { width: 60 }]}>
                {translations.qty}
              </Text>
              <Text style={[styles.label, { flex: 1 }]}>
                {translations.price}
              </Text>
              <Text style={[styles.label, { flex: 1, textAlign: "right" }]}>
                {translations.amount}
              </Text>
            </View>
          </View>

          {/* Line Items */}
          {invoice.lineItems.map((item, index) => (
            <View key={item.id || index} style={styles.lineItem}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: COLORS.primary,
                  }}
                >
                  {item.name
                    ? lexicalToPlainText(parseLexicalState(item.name))
                    : "-"}
                </Text>
              </View>
              <View style={{ flexDirection: "row", paddingLeft: 32, flex: 1 }}>
                <Text style={[styles.text, { width: 60 }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.text, { flex: 1 }]}>
                  {formatCurrency(
                    item.price,
                    invoice.currency,
                    invoice.numberLocale,
                  )}
                </Text>
                <Text style={[styles.text, { flex: 1, textAlign: "right" }]}>
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

          {/* Note + Totals - grid-cols-2 py-3 */}
          <View style={{ flexDirection: "row", paddingVertical: 12 }}>
            {/* Note - pr-6 = 24px */}
            <View style={{ flex: 1, paddingRight: 24 }}>
              <View
                style={{
                  minHeight: 40,
                  justifyContent: "center",
                  paddingVertical: 8,
                }}
              >
                <Text style={styles.label}>{translations.note}</Text>
              </View>
              <Text
                style={{ fontSize: 8, fontWeight: 500, color: COLORS.muted }}
              >
                {invoice.notes || "-"}
              </Text>
            </View>

            {/* Totals - pl-8 = 32px */}
            <View style={{ flex: 1, paddingLeft: 32 }}>
              {/* Subtotal */}
              <View style={styles.totalRow}>
                <Text style={[styles.text, { color: COLORS.muted }]}>
                  {translations.subtotal}
                </Text>
                <Text style={[styles.text, { flex: 1, textAlign: "right" }]}>
                  {formatCurrency(
                    totals.subTotal,
                    invoice.currency,
                    invoice.numberLocale,
                  )}
                </Text>
              </View>

              {/* Discount */}
              {invoice.includeDiscount && invoice.discount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={[styles.text, { color: COLORS.muted }]}>
                    {translations.discount}
                  </Text>
                  <Text style={[styles.text, { flex: 1, textAlign: "right" }]}>
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
                <View style={styles.totalRow}>
                  <Text style={[styles.text, { color: COLORS.muted }]}>
                    {translations.tax} ({invoice.taxRate}%)
                  </Text>
                  <Text style={[styles.text, { flex: 1, textAlign: "right" }]}>
                    {formatCurrency(
                      totals.tax,
                      invoice.currency,
                      invoice.numberLocale,
                    )}
                  </Text>
                </View>
              )}

              {/* Total - text-sm = 14px */}
              <View style={styles.totalRowLast}>
                <Text style={[styles.text, { color: COLORS.muted }]}>
                  {translations.total}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: COLORS.primary,
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
        </View>

        {/* Payment Method - Bottom (Step 3) */}
        <View style={styles.paymentSection}>
          <Text style={styles.label}>{translations.paymentDetails}</Text>
          <Text style={[styles.text, { marginTop: 4 }]}>
            {invoice.paymentDetails || "-"}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
