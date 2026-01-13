import { pdf } from "@react-pdf/renderer";
import { setIsHtmlMode } from "@rawwee/react-pdf-html";
import { saveAs } from "file-saver";
import type { InvoiceFormState, InvoiceTotals } from "../types";

// Import font registration (side-effect)
import "./fonts";

export interface GeneratePdfOptions {
  /** Invoice form data */
  invoice: InvoiceFormState;
  /** Calculated totals */
  totals: InvoiceTotals;
  /** Layout ID (defaults to "classic") */
  layoutId?: string;
  /** Style ID (defaults to "classic") */
  styleId?: string;
}

/**
 * Generate a PDF blob from the invoice data.
 * Uses the same component as the preview but in PDF mode.
 */
export async function generatePdfBlob(
  options: GeneratePdfOptions
): Promise<Blob> {
  const { invoice, totals, layoutId = "classic", styleId = "classic" } = options;

  // Set to PDF mode (not HTML)
  setIsHtmlMode(false);

  // Dynamically import to avoid SSR issues
  const { InvoicePdfDocument } = await import("./invoice-pdf-document");

  const element = InvoicePdfDocument({
    invoice,
    totals,
    layoutId,
    styleId,
  });

  const blob = await pdf(element).toBlob();

  // Reset to HTML mode for preview
  setIsHtmlMode(true);

  return blob;
}

/**
 * Generate and download a PDF from the invoice data.
 * Downloads the file with the invoice number as filename.
 */
export async function downloadInvoicePdf(
  options: GeneratePdfOptions
): Promise<void> {
  const { invoice } = options;
  const blob = await generatePdfBlob(options);

  const filename = invoice.invoiceNumber
    ? `${invoice.invoiceNumber}.pdf`
    : "invoice.pdf";

  saveAs(blob, filename);
}
