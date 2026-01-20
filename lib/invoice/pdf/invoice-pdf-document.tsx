/**
 * Unified Invoice PDF Document component.
 * Uses react-pdf-html for dual-rendering:
 * - When isHtml=true: renders as HTML (for preview)
 * - When isHtml=false: renders as PDF (for download)
 */

import { Document } from "@invoice-jm/react-pdf-html";
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

/**
 * Creates the invoice document using react-pdf-html components.
 * Always uses the layout component from layouts/ directory.
 */
export function InvoicePdfDocument({
  invoice,
  totals,
  layoutId = "classic",
  styleId = "classic",
  currentStep,
  onStepClick,
}: InvoicePdfDocumentProps) {
  const translations = getTranslations(invoice.locale);
  const documentTypeLabels = getDocumentTypeLabels(
    invoice.locale,
    invoice.documentType,
  );
  const localeConfig = getLocaleConfig(invoice.locale);

  // Get style configuration
  const style = getStyle(styleId);

  // Get layout component
  const layout = getLayout(layoutId);
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
        currentStep={currentStep}
        onStepClick={onStepClick}
      />
    </Document>
  );
}
