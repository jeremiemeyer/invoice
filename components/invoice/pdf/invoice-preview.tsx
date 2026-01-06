"use client";

import { PDFViewer } from "@react-pdf/renderer";
import type { InvoiceFormState, InvoiceTotals } from "@/lib/invoice/types";
import { PdfTemplate } from "./pdf-template";

interface InvoicePreviewProps {
  invoice: InvoiceFormState;
  totals: InvoiceTotals;
}

export function InvoicePreview({ invoice, totals }: InvoicePreviewProps) {
  return (
    <PDFViewer
      width="100%"
      height="100%"
      className="rounded-lg border-0"
      showToolbar={false}
    >
      <PdfTemplate invoice={invoice} totals={totals} />
    </PDFViewer>
  );
}
