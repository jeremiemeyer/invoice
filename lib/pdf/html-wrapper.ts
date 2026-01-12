import type { PageSize } from "@/lib/invoice/translations";

// Scale factor: CSS 96 DPI / PDF 72 DPI
const SCALE = 96 / 72;

// Helper to scale a value and round to 1 decimal
const s = (px: number) => Math.round(px * SCALE * 10) / 10;

// Page sizes scaled for 96 DPI
const PAGE_SIZES = {
  A4: { width: Math.round(595 * SCALE), height: Math.round(842 * SCALE) },
  LETTER: { width: Math.round(612 * SCALE), height: Math.round(792 * SCALE) },
};

/**
 * Wraps invoice HTML content with a full HTML document
 * including fonts, styles, and proper page sizing for PDF generation
 */
export function wrapWithDocument(
  invoiceHtml: string,
  pageSize: PageSize,
): string {
  const size = PAGE_SIZES[pageSize];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=${size.width}, height=${size.height}">
  <title>Invoice</title>

  <!-- Inter font from Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet">

  <style>
    /* Reset and base styles */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      width: ${size.width}px;
      height: ${size.height}px;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.4;
      color: #000;
      background: #fff;
    }

    /* Invoice document typography */
    .invoice-document {
      font-family: 'Inter', system-ui, sans-serif;
      font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.4;
    }

    /* Tabular figures for numbers */
    .tabular-nums {
      font-variant-numeric: tabular-nums lining-nums;
    }

    /* Flexbox utilities */
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-1 { flex: 1 1 0%; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }

    /* Grid utilities */
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .col-span-2 { grid-column: span 2 / span 2; }

    /* Spacing utilities - all values scaled by 96/72 */
    .p-6 { padding: ${s(24)}px; }
    .p-8 { padding: ${s(32)}px; }
    .px-6 { padding-left: ${s(24)}px; padding-right: ${s(24)}px; }
    .px-8 { padding-left: ${s(32)}px; padding-right: ${s(32)}px; }
    .py-2 { padding-top: ${s(8)}px; padding-bottom: ${s(8)}px; }
    .py-3 { padding-top: ${s(12)}px; padding-bottom: ${s(12)}px; }
    .py-4 { padding-top: ${s(16)}px; padding-bottom: ${s(16)}px; }
    .py-6 { padding-top: ${s(24)}px; padding-bottom: ${s(24)}px; }
    .pl-6 { padding-left: ${s(24)}px; }
    .pl-8 { padding-left: ${s(32)}px; }
    .pr-4 { padding-right: ${s(16)}px; }
    .pr-6 { padding-right: ${s(24)}px; }
    .pb-0\\.5 { padding-bottom: ${s(2)}px; }
    .pb-2 { padding-bottom: ${s(8)}px; }
    .pb-2\\.5 { padding-bottom: ${s(10)}px; }
    .pb-3 { padding-bottom: ${s(12)}px; }
    .pt-3 { padding-top: ${s(12)}px; }
    .pt-4 { padding-top: ${s(16)}px; }
    .mb-0\\.5 { margin-bottom: ${s(2)}px; }
    .mb-1 { margin-bottom: ${s(4)}px; }
    .mb-2 { margin-bottom: ${s(8)}px; }
    .mb-3 { margin-bottom: ${s(12)}px; }
    .ml-4 { margin-left: ${s(16)}px; }
    .ml-6 { margin-left: ${s(24)}px; }
    .mt-1 { margin-top: ${s(4)}px; }
    .mt-1\\.5 { margin-top: ${s(6)}px; }
    .mt-9 { margin-top: ${s(36)}px; }
    .mt-12 { margin-top: ${s(48)}px; }

    /* Size utilities - scaled */
    .h-full { height: 100%; }
    .w-full { width: 100%; }
    .h-14 { height: ${s(56)}px; }
    .h-\\[36px\\] { height: ${s(36)}px; }
    .h-\\[42px\\] { height: ${s(42)}px; }
    .h-\\[34px\\] { height: ${s(34)}px; }
    .h-\\[45px\\] { height: ${s(45)}px; }
    .w-\\[36px\\] { width: ${s(36)}px; }
    .w-\\[34px\\] { width: ${s(34)}px; }
    .w-\\[45px\\] { width: ${s(45)}px; }
    .w-fit { width: fit-content; }
    .min-h-\\[24px\\] { min-height: ${s(24)}px; }
    .min-h-\\[32px\\] { min-height: ${s(32)}px; }
    .min-h-\\[37px\\] { min-height: ${s(37)}px; }
    .min-h-\\[40px\\] { min-height: ${s(40)}px; }
    .min-h-\\[49px\\] { min-height: ${s(49)}px; }
    .min-w-\\[45px\\] { min-width: ${s(45)}px; }
    .min-w-\\[60px\\] { min-width: ${s(60)}px; }

    /* Typography - scaled */
    .text-\\[8px\\] { font-size: ${s(8)}px; }
    .text-\\[10px\\] { font-size: ${s(10)}px; }
    .text-xs { font-size: ${s(12)}px; line-height: 1.333; }
    .text-sm { font-size: ${s(14)}px; line-height: 1.43; }
    .text-base { font-size: ${s(16)}px; line-height: 1.5; }
    .text-lg { font-size: ${s(18)}px; line-height: 1.556; }
    .text-xl { font-size: ${s(20)}px; line-height: 1.4; }
    .text-2xl { font-size: ${s(24)}px; line-height: 1.333; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .font-mono { font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace; }
    .uppercase { text-transform: uppercase; }
    .tracking-wider { letter-spacing: 0.05em; }
    .text-right { text-align: right; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .whitespace-nowrap { white-space: nowrap; }
    .whitespace-pre-wrap { white-space: pre-wrap; }

    /* Colors */
    .text-gray-400 { color: #9ca3af; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-600 { color: #4b5563; }
    .bg-white { background-color: #fff; }
    .bg-gray-100 { background-color: #f3f4f6; }
    .bg-gray-200 { background-color: #e5e7eb; }

    /* Borders - NOT scaled, stay at 1px for crisp lines */
    .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
    .border-t { border-top-width: 1px; border-top-style: solid; }
    .border-gray-200 { border-color: #e5e7eb; }
    .divide-x > * + * { border-left-width: 1px; border-left-style: solid; border-color: #e5e7eb; }
    .divide-gray-200 > * + * { border-color: #e5e7eb; }
    .rounded { border-radius: ${s(4)}px; }
    .rounded-full { border-radius: 9999px; }

    /* Layout */
    .relative { position: relative; }
    .overflow-hidden { overflow: hidden; }
    .object-cover { object-fit: cover; }

    /* Line item content styles - scaled */
    .line-item-content p { margin-bottom: ${s(2)}px; }
    .line-item-content p:last-child { margin-bottom: 0; }
    .line-item-content strong { font-weight: 600; }
    .line-item-content em { font-style: italic; }
    .line-item-content .list-container { margin-top: ${s(2)}px; margin-bottom: ${s(2)}px; }
    .line-item-content .list-item { margin-bottom: ${s(2)}px; }
    .line-item-content .list-marker { color: #6b7280; }
    .line-item-content code {
      background-color: #f3f4f6;
      padding: ${s(2)}px ${s(4)}px;
      border-radius: ${s(4)}px;
      font-size: ${s(8)}px;
      font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    }

    /* Print styles */
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      @page {
        size: ${pageSize === "A4" ? "210mm 297mm" : "8.5in 11in"};
        margin: 0;
      }
    }
  </style>
</head>
<body>
  ${invoiceHtml}
</body>
</html>`;
}
