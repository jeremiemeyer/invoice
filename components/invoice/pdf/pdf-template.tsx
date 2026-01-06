import { Document, Font, Image, Page, Text, View } from "@react-pdf/renderer";
import { calculateLineItemTotal } from "@/lib/invoice/calculate";
import { formatCurrency } from "@/lib/invoice/format-currency";
import { LexicalPdf } from "@/lib/invoice/lexical-pdf";
import { getLocaleConfig, getTranslations } from "@/lib/invoice/translations";
import type { InvoiceFormState, InvoiceTotals } from "@/lib/invoice/types";

// Register Inter font
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf",
      fontWeight: 500,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf",
      fontWeight: 700,
    },
  ],
});

interface PdfTemplateProps {
  invoice: InvoiceFormState;
  totals: InvoiceTotals;
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

// Colors matching the HTML preview
const colors = {
  gray400: "#9ca3af",
  gray600: "#4b5563",
  gray200: "#e5e7eb",
  // Border color - using gray-200 for slightly darker borders
  border: "#e5e7eb",
  black: "#000000",
};

export function PdfTemplate({ invoice, totals }: PdfTemplateProps) {
  const t = getTranslations(invoice.locale);
  const localeConfig = getLocaleConfig(invoice.locale);

  return (
    <Document>
      <Page
        size={invoice.pageSize}
        style={{
          backgroundColor: "#fff",
          color: colors.black,
          fontFamily: "Inter",
          fontWeight: 400,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Main content wrapper - grows to push payment to bottom */}
        <View style={{ flex: 1 }}>
          {/* Invoice Terms - Top bar */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 32,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ width: "50%" }}>
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: colors.gray400,
                  marginBottom: 2,
                }}
              >
                {t.invoiceNo}
              </Text>
              <Text style={{ fontSize: 10, fontWeight: 500 }}>
                {invoice.invoiceNumber || "-"}
              </Text>
            </View>
            <View
              style={{ width: "50%", flexDirection: "row", paddingLeft: 32 }}
            >
              <View style={{ minWidth: 60 }}>
                <Text
                  style={{
                    fontSize: 8,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: colors.gray400,
                    marginBottom: 2,
                  }}
                >
                  {t.issued}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: 500 }}>
                  {formatDate(invoice.issueDate, localeConfig.dateLocale)}
                </Text>
              </View>
              <View style={{ marginLeft: 24 }}>
                <Text
                  style={{
                    fontSize: 8,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: colors.gray400,
                    marginBottom: 2,
                  }}
                >
                  {t.dueDate}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: 500 }}>
                  {formatDate(invoice.dueDate, localeConfig.dateLocale)}
                </Text>
              </View>
            </View>
          </View>

          {/* From / To Row */}
          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            {/* From - Left */}
            <View
              style={{
                width: "50%",
                paddingVertical: 24,
                paddingHorizontal: 32,
                borderRightWidth: 1,
                borderRightColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: colors.gray400,
                  marginBottom: 10,
                }}
              >
                {t.from}
              </Text>
              {/* Avatar / Logo - only show if showFromLogo is true */}
              {invoice.showFromLogo &&
                (invoice.fromLogoUrl ? (
                  <Image
                    src={invoice.fromLogoUrl}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      marginBottom: 12,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.gray200,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: 500 }}>
                      {getInitial(invoice.fromName)}
                    </Text>
                  </View>
                ))}
              {/* Name */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  marginBottom: 4,
                  minHeight: 24,
                }}
              >
                {invoice.fromName || "-"}
              </Text>
              {/* Email */}
              {invoice.fromEmail && (
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: colors.gray600,
                    marginBottom: 12,
                  }}
                >
                  {invoice.fromEmail}
                </Text>
              )}
              {/* Address */}
              {invoice.fromAddress && (
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: colors.gray400,
                    marginBottom: 2,
                  }}
                >
                  {invoice.fromAddress}
                </Text>
              )}
              {(invoice.fromCity || invoice.fromCountry) && (
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: colors.gray400,
                    marginBottom: 2,
                  }}
                >
                  {[invoice.fromCity, invoice.fromCountry]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              )}
              {invoice.fromPhone && (
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: colors.gray400,
                    marginBottom: 2,
                  }}
                >
                  {invoice.fromPhone}
                </Text>
              )}
              {invoice.fromTaxId && (
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: colors.gray400,
                  }}
                >
                  {t.taxId}: {invoice.fromTaxId}
                </Text>
              )}
            </View>

            {/* To - Right */}
            <View
              style={{
                width: "50%",
                paddingVertical: 24,
                paddingHorizontal: 32,
              }}
            >
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  color: colors.gray400,
                  marginBottom: 10,
                }}
              >
                {t.to}
              </Text>
              {/* Avatar / Logo - only show if showCustomerLogo is true */}
              {invoice.showCustomerLogo &&
                (invoice.customerLogoUrl ? (
                  <Image
                    src={invoice.customerLogoUrl}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      marginBottom: 12,
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: colors.gray200,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: 500 }}>
                      {getInitial(invoice.customerName)}
                    </Text>
                  </View>
                ))}
              {/* Name */}
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  marginBottom: 4,
                  minHeight: 24,
                }}
              >
                {invoice.customerName || "-"}
              </Text>
              {/* Email */}
              {invoice.customerEmail && (
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: colors.gray600,
                    marginBottom: 12,
                  }}
                >
                  {invoice.customerEmail}
                </Text>
              )}
              {/* Address */}
              {invoice.customerAddress && (
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: colors.gray400,
                    marginBottom: 2,
                  }}
                >
                  {invoice.customerAddress}
                </Text>
              )}
              {(invoice.customerCity || invoice.customerCountry) && (
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: colors.gray400,
                    marginBottom: 2,
                  }}
                >
                  {[invoice.customerCity, invoice.customerCountry]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              )}
              {invoice.customerPhone && (
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: colors.gray400,
                    marginBottom: 2,
                  }}
                >
                  {invoice.customerPhone}
                </Text>
              )}
              {invoice.customerTaxId && (
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: colors.gray400,
                  }}
                >
                  {t.taxId}: {invoice.customerTaxId}
                </Text>
              )}
            </View>
          </View>

          {/* Invoice Details - Line items */}
          <View style={{ paddingHorizontal: 32, paddingVertical: 24 }}>
            {/* Header */}
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              <View style={{ width: "50%" }}>
                <Text
                  style={{
                    fontSize: 8,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: colors.gray400,
                  }}
                >
                  {t.description}
                </Text>
              </View>
              <View
                style={{ width: "50%", flexDirection: "row", paddingLeft: 32 }}
              >
                <Text
                  style={{
                    width: 60,
                    fontSize: 8,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: colors.gray400,
                  }}
                >
                  {t.qty}
                </Text>
                <Text
                  style={{
                    width: 70,
                    fontSize: 8,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: colors.gray400,
                  }}
                >
                  {t.price}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 8,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: colors.gray400,
                    textAlign: "right",
                  }}
                >
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
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  alignItems: "flex-start",
                }}
              >
                <View style={{ width: "50%" }}>
                  {item.name ? (
                    <LexicalPdf style={{ fontSize: 10, fontWeight: 500 }}>
                      {item.name}
                    </LexicalPdf>
                  ) : (
                    <Text style={{ fontSize: 10, fontWeight: 500 }}>-</Text>
                  )}
                </View>
                <View
                  style={{
                    width: "50%",
                    flexDirection: "row",
                    paddingLeft: 32,
                  }}
                >
                  <Text
                    style={{
                      width: 60,
                      fontSize: 10,
                      fontWeight: 500,
                      color: colors.gray600,
                    }}
                  >
                    {item.quantity}
                  </Text>
                  <Text
                    style={{
                      width: 70,
                      fontSize: 10,
                      fontWeight: 500,
                      color: colors.gray600,
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
                      flex: 1,
                      fontSize: 10,
                      fontWeight: 500,
                      color: colors.gray600,
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
              </View>
            ))}

            {/* Note + Totals */}
            <View
              style={{
                flexDirection: "row",
                borderTopWidth: 1,
                borderTopColor: colors.border,
                marginTop: 48,
                paddingTop: 16,
              }}
            >
              {/* Note */}
              <View style={{ width: "50%", paddingRight: 24 }}>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: colors.gray400,
                    marginBottom: 6,
                  }}
                >
                  {t.note}
                </Text>
                <Text
                  style={{
                    fontSize: 8,
                    fontWeight: 500,
                    color: colors.gray400,
                    lineHeight: 1.4,
                  }}
                >
                  {invoice.notes || "-"}
                </Text>
              </View>

              {/* Totals */}
              <View style={{ width: "50%", paddingLeft: 32 }}>
                {/* Subtotal */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    paddingBottom: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: colors.gray400,
                    }}
                  >
                    {t.subtotal}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: colors.gray600,
                    }}
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
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: colors.gray400,
                      }}
                    >
                      {t.discount}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: colors.gray600,
                      }}
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
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: colors.gray400,
                      }}
                    >
                      {t.tax} ({invoice.taxRate}%)
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: 500,
                        color: colors.gray600,
                      }}
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
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingVertical: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: 500,
                      color: colors.gray400,
                    }}
                  >
                    {t.total}
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: 500 }}>
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
        </View>

        {/* Payment Method - Bottom (outside flex wrapper to stay at page bottom) */}
        <View
          style={{
            padding: 32,
            paddingVertical: 24,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            marginTop: "auto",
          }}
        >
          <Text
            style={{
              fontSize: 8,
              fontWeight: 600,
              textTransform: "uppercase",
              color: colors.gray400,
              marginBottom: 10,
            }}
          >
            {t.paymentDetails}
          </Text>
          <Text
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: colors.gray600,
              lineHeight: 1.4,
            }}
          >
            {invoice.paymentDetails || "-"}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
