import chromium from "@sparticuz/chromium-min";
import { type NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import type { InvoiceFormState, InvoiceTotals } from "@/lib/invoice/types";
import { wrapWithDocument } from "@/lib/pdf/html-wrapper";
import { renderInvoiceToHtml } from "@/lib/pdf/render-to-html";

// Vercel serverless function config
export const maxDuration = 60;

// Remote chromium binary for Vercel deployment
// Must match the @sparticuz/chromium-min version - check https://github.com/Sparticuz/chromium/releases
const CHROMIUM_REMOTE_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v131.0.0/chromium-v131.0.0-pack.tar";

interface GeneratePdfRequest {
  invoice: InvoiceFormState;
  totals: InvoiceTotals;
}

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePdfRequest = await request.json();
    const { invoice, totals } = body;

    if (!invoice || !totals) {
      return NextResponse.json(
        { error: "Missing invoice or totals data" },
        { status: 400 },
      );
    }

    // Render the invoice to static HTML using the same component as the preview
    const invoiceHtml = await renderInvoiceToHtml(invoice, totals);

    // Wrap with full HTML document
    const fullHtml = wrapWithDocument(invoiceHtml, invoice.pageSize);

    // Launch browser
    const isProduction = process.env.NODE_ENV === "production";
    const browser = await puppeteer.launch({
      args: isProduction ? chromium.args : ["--no-sandbox"],
      executablePath: isProduction
        ? await chromium.executablePath(CHROMIUM_REMOTE_URL)
        : process.platform === "darwin"
          ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
          : process.platform === "win32"
            ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
            : "/usr/bin/google-chrome",
      headless: true,
    });

    try {
      const page = await browser.newPage();

      // Set viewport to match scaled page size (96 DPI)
      const scale = 96 / 72;
      const viewportSize =
        invoice.pageSize === "A4"
          ? { width: Math.round(595 * scale), height: Math.round(842 * scale) }
          : { width: Math.round(612 * scale), height: Math.round(792 * scale) };

      await page.setViewport(viewportSize);

      // Load the HTML content
      await page.setContent(fullHtml, {
        waitUntil: "networkidle0",
      });

      // Wait for fonts to load
      await page.evaluateHandle(() => document.fonts.ready);

      // Generate PDF - no scaling needed, HTML is pre-scaled
      const pdf = await page.pdf({
        format: invoice.pageSize === "A4" ? "A4" : "Letter",
        printBackground: true,
        margin: {
          top: "0",
          right: "0",
          bottom: "0",
          left: "0",
        },
      });

      // Generate filename
      const invoiceNumber = invoice.invoiceNumber || "invoice";
      const filename = `${invoiceNumber}.pdf`;

      // Convert Buffer to Uint8Array for NextResponse
      const pdfBuffer = new Uint8Array(pdf);

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "no-cache",
        },
      });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}
