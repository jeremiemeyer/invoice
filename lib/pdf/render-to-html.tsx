import { InvoiceDocument } from "@/components/invoice/preview/invoice-document";
import type { InvoiceFormState, InvoiceTotals } from "@/lib/invoice/types";

/**
 * Renders the invoice to static HTML using the shared InvoiceDocument component.
 * This provides a single source of truth for the invoice layout.
 * Uses dynamic import to avoid Next.js bundler restrictions on react-dom/server.
 */
export async function renderInvoiceToHtml(
  invoice: InvoiceFormState,
  totals: InvoiceTotals,
): Promise<string> {
  const { renderToStaticMarkup } = await import("react-dom/server");

  return renderToStaticMarkup(
    <div className="invoice-document flex h-full w-full flex-col overflow-hidden bg-white">
      <InvoiceDocument invoice={invoice} totals={totals} />
    </div>,
  );
}
