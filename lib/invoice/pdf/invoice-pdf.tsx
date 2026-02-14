"use client";

import {
  Document,
  usePDFComponentsAreHTML,
} from "@jeremiemeyer/react-pdf-html";
import { useEffect } from "react";
import { getLayout } from "../layouts";
import { getStyle } from "../styles";
import {
  getDocumentTypeLabels,
  getLocaleConfig,
  getTranslations,
} from "../translations";
import type { InvoiceFormState, InvoiceTotals } from "../types";

// Import font registration (side-effect)
import "./fonts";

export interface InvoicePdfProps {
  /** Invoice form data */
  invoice: InvoiceFormState;
  /** Calculated totals */
  totals: InvoiceTotals;
  /** Layout ID (defaults to "classic") */
  layoutId?: string;
  /** Style ID (defaults to "classic") */
  styleId?: string;
  /** When true, renders as HTML for preview. When false, renders for PDF generation. */
  isHtml?: boolean;
}

/**
 * Main invoice PDF component.
 * Uses react-pdf-html for dual-rendering (HTML preview and PDF generation).
 */
export function InvoicePdf({
  invoice,
  totals,
  layoutId = "classic",
  styleId = "classic",
  isHtml = true,
}: InvoicePdfProps) {
  const { setHtml } = usePDFComponentsAreHTML();

  // Set the rendering mode
  useEffect(() => {
    setHtml(isHtml);
  }, [isHtml, setHtml]);

  // Get layout, style, and translations
  const layout = getLayout(layoutId);
  const style = getStyle(styleId);
  const translations = getTranslations(invoice.locale);
  const documentTypeLabels = getDocumentTypeLabels(
    invoice.locale,
    invoice.documentType,
  );
  const localeConfig = getLocaleConfig(invoice.locale);

  const LayoutComponent = layout.component;

  return (
    <Document>
      <LayoutComponent
        invoice={invoice}
        totals={totals}
        style={style}
        translations={translations}
        documentTypeLabels={documentTypeLabels}
        dateLocale={localeConfig.dateLocale}
      />
    </Document>
  );
}
