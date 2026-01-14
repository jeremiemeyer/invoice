import type { InvoiceStyle } from "../styles";
import type {
  DocumentTypeLabels,
  InvoiceTranslations,
  PageSize,
} from "../translations";
import type { InvoiceFormState, InvoiceTotals } from "../types";

/**
 * Props passed to layout components.
 * Layouts receive all data needed to render the invoice.
 */
export interface LayoutProps {
  /** Invoice form data */
  invoice: InvoiceFormState;
  /** Calculated totals */
  totals: InvoiceTotals;
  /** Style configuration */
  style: InvoiceStyle;
  /** Translated labels */
  translations: InvoiceTranslations;
  /** Document type specific labels */
  documentTypeLabels: DocumentTypeLabels;
  /** Date locale for formatting */
  dateLocale: string;
  /** Current wizard step (for highlighting in HTML preview) */
  currentStep?: number;
  /** Callback when a section is clicked (HTML preview only) */
  onStepClick?: (step: number) => void;
}

/**
 * Layout component type.
 * Layouts are React components that render the invoice structure
 * using React-PDF components from react-pdf-html.
 */
export type LayoutComponent = React.FC<LayoutProps>;

/**
 * Layout definition with metadata.
 */
export interface LayoutDefinition {
  /** Unique layout identifier */
  id: string;
  /** Display name shown in layout selector */
  name: string;
  /** Layout component */
  component: LayoutComponent;
}

/**
 * Page dimensions in points (72 DPI).
 */
export const PAGE_DIMENSIONS: Record<
  PageSize,
  { width: number; height: number }
> = {
  A4: { width: 595.28, height: 841.89 },
  LETTER: { width: 612, height: 792 },
};
