# Invoice Generator

A simple invoice generator inspired by [Midday](https://midday.ai) and [cryptoinvoice.new](https://cryptoinvoice.new).

## Features

- **Multi-step wizard** - Guided form to create invoices step by step
- **Rich text descriptions** - Full markdown support for line item descriptions using [Lexical](https://lexical.dev/) and [shadcn-editor](https://shadcn-editor.vercel.app/)
- **Client-side PDF generation** - Generate pixel-perfect PDFs directly in the browser using React-PDF with dual-rendering (same component for preview and PDF)
- **Markdown paste detection** - Paste markdown into line items and apply formatting with one click
- **Layouts & Styles** - Customizable invoice appearance (see Architecture below)
- **Presets & settings** - Configure currency, language, number format, and paper size
  - Currencies: USD, EUR, GBP, CAD, AUD, JPY, CHF
  - Languages: English, French
  - Number formats: US/UK (1,234.56), France (1 234,56), Germany (1.234,56), Switzerland (1'234.56)
  - Paper sizes: Letter, A4
- **Country-specific tax IDs** - Business country determines tax ID labels (e.g., French company shows "N° TVA" and "SIRET" even when invoice is in English)
- **Tax & discount support** - Flexible totals with optional tax rate and discounts
- **Local storage persistence** - Your invoice data is saved locally

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Lexical (rich text editor)
- React-PDF (client-side PDF generation)
- shadcn/ui components

## Architecture

### Dual-Rendering System

The app uses a local fork of `react-pdf-html` for dual-rendering:

```
React-PDF Components (View, Text, Page)
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
HTML Preview       PDF Download
(isHtml=true)      (isHtml=false)
```

Same components render as HTML divs for preview and native PDF for download.

### Layouts vs Styles

The invoice appearance is split into two concepts:

| Concept | Description | Location |
|---------|-------------|----------|
| **Layout** | Structure and positioning of elements (where things go) | `lib/invoice/layouts/` |
| **Style** | Visual tokens: colors, fonts, spacing (how things look) | `lib/invoice/styles/` |

**Available Layouts:**
- Classic (default)

**Available Styles:**
- Classic - Clean grayscale
- Classic Mono - Monospace labels and numbers
- Elegant - Serif headings with warm accents

### Key Files

| File | Description |
|------|-------------|
| `lib/invoice/pdf/invoice-pdf-document.tsx` | Main document component |
| `components/invoice/preview/pdf-preview.tsx` | HTML preview with multi-page carousel |
| `lib/invoice/layouts/` | Layout components (structure) |
| `lib/invoice/styles/` | Style configurations (colors, fonts) |

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start creating invoices.

## Known Limitations

See `TODO.md` for the current task list and `PAGE_BREAKS.md` for details on the multi-page synchronization challenge.

## License

MIT
