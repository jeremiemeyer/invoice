# Invoice Generator

A simple, client-side invoice generator inspired by [Midday](https://midday.ai) and [cryptoinvoice.new](https://cryptoinvoice.new).

## Features

- **Multi-step wizard** - Guided form to create invoices step by step
- **Rich text descriptions** - Full markdown support for line item descriptions using [Lexical](https://lexical.dev/) and [shadcn-editor](https://shadcn-editor.vercel.app/)
- **Client-side PDF rendering** - Generate clean PDFs directly in the browser with [@react-pdf/renderer](https://react-pdf.org/)
- **Presets & settings** - Configure currency, language, number format, and paper size
  - Currencies: USD, EUR, GBP, CAD, AUD, JPY, CHF
  - Languages: English, French
  - Number formats: US/UK (1,234.56), France (1 234,56), Germany (1.234,56), Switzerland (1'234.56)
  - Paper sizes: Letter, A4
- **Tax & discount support** - Flexible totals with optional tax rate and discounts
- **Local storage persistence** - Your invoice data is saved locally

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Lexical (rich text editor)
- @react-pdf/renderer (PDF generation)
- shadcn/ui components

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start creating invoices.

## License

MIT
