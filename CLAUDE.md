# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Invoice-JM is a Next.js 16 invoice generator application with rich text editing (Lexical) and PDF export capabilities. Users create invoices through a multi-step wizard with real-time HTML preview.

## Development Commands

```bash
pnpm dev        # Start dev server at http://localhost:3000
pnpm build      # Production build
pnpm start      # Run production server
pnpm lint       # Run ESLint + Biome
pnpm check      # TypeScript type checking (tsc --noEmit)
```

## Git Hooks (Husky)

- **pre-commit**: Runs `lint-staged` (Biome + ESLint on staged files)
- **pre-push**: Runs `pnpm check` and `pnpm build`

## Architecture

### State Management

The app uses a custom `useInvoice()` hook (`lib/invoice/use-invoice.ts`) that:
- Persists to localStorage (key: "invoice-draft")
- Provides actions: setField, addLineItem, updateLineItem, removeLineItem, reorderLineItems
- Computes totals (subtotal, tax, discount) via useMemo

Wizard step state persists separately (key: "invoice-wizard-step").

### Key Data Flow

```
InvoicePage
├── useInvoice() → state + actions
├── InvoiceWizard (left panel - form editing)
│   └── 5 steps: Company → Client → Details → Terms → Payment
└── InvoiceHtmlPreview (right panel - live preview)
```

### Core Types (lib/invoice/types.ts)

- `LineItem`: { id, name (Lexical JSON), quantity, price }
- `InvoiceFormState`: Full form state including locale, numberLocale, currency, lineItems, dates
- `InvoiceTotals`: { subTotal, tax, total }

### Localization

The app separates language from business country - a French company can write invoices in English while showing French tax ID labels.

**Language settings** (`lib/invoice/translations.ts`):
- `locale`: Text language (en-US, fr-FR) - controls labels like "Invoice", "Facture"
- `numberLocale`: Number formatting - controls decimal/thousand separators:
  - `en-US`: 1,234.56
  - `fr-FR`: 1 234,56
  - `de-DE`: 1.234,56
  - `de-CH`: 1'234.56 (also displays currency codes like "EUR" instead of "€")
- Currency formatting uses `Intl.NumberFormat` with the `numberLocale` parameter

**Country-specific IDs** (`lib/invoice/countries.ts`):
- `fromCountryCode`: Your business country - determines tax ID labels (e.g., "N° TVA", "SIRET" for France)
- `customerCountryCode`: Client's country - determines their tax ID labels
- Each country config includes: `taxId.label`, `taxId.placeholder`, `registrationId.label`, etc.
- Supported countries: US, GB, AU, FR, DE, CH, ES, PT

### Rich Text Editor

Line item names use Lexical editor:
- Plugins: `components/editor/plugins/`
- Themes: `components/editor/themes/`
- Conversion: `lexical-to-html.ts` for preview, `lexical-pdf.tsx` for PDF export

### Component Organization

- `components/ui/` - shadcn primitives (base-nova style, HugeIcons)
- `components/invoice/form/` - Invoice wizard and form sections
- `components/invoice/preview/` - HTML preview renderer
- `components/invoice/pdf/` - PDF template and generation

## Code Style

- Biome handles formatting (2-space indent, double quotes)
- ESLint with Next.js rules
- Path alias: `@/*` maps to project root
- Icons: HugeIcons primary, Lucide React fallback

## Styling

Tailwind CSS 4 with custom CSS variables in oklch color space (`app/globals.css`). Dark mode via `.dark` class. Custom shadow utilities: `.shadow-custom-{xs,sm,md,lg,xl,input}`.