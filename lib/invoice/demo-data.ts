import type { InvoiceFormState } from "./types";

/**
 * Demo invoice data for preview mode.
 * Shows a realistic example of what an invoice looks like.
 */
export const demoInvoiceData: InvoiceFormState = {
  documentType: "invoice",
  templateId: "classic-mono",
  layoutId: "classic",
  styleId: "classic-mono",
  pageMargin: "none",
  locale: "en-US",
  numberLocale: "en-US",
  pageSize: "LETTER",
  fromName: "Acme Consulting LLC",
  fromSubtitle: "Product & Software Consulting",
  fromAddress: "123 Market Street",
  fromCity: "San Francisco, CA 94103",
  fromCountry: "United States",
  fromEmail: "billing@acmeconsulting.com",
  fromPhone: "+1 555-123-4567",
  fromTaxId: "US-TAX-123456",
  fromLogoUrl: "",
  showFromLogo: false,
  customerName: "Demo Client Corporation",
  customerSubtitle: "Finance Department",
  customerAddress: "456 Business Ave, Suite 900",
  customerCity: "New York, NY 10001",
  customerCountry: "United States",
  customerEmail: "accounts@democlient.com",
  customerPhone: "+1 555-987-6543",
  customerTaxId: "US-TAX-654321",
  customerLogoUrl: "",
  showCustomerLogo: false,
  invoiceNumber: "INV-2026-0001",
  issueDate: "2026-01-01",
  dueDate: "2026-01-31",
  lineItems: [
    {
      id: "demo-line-item-001",
      name: '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Professional Services — January 2026","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":1,"textStyle":""},{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Project planning and technical consultation","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","version":1,"value":1},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Feature implementation and integration","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","version":1,"value":2},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Code review, testing, and QA","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","version":1,"value":3},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Documentation and knowledge transfer","type":"text","version":1}],"direction":null,"format":"","indent":0,"type":"listitem","version":1,"value":4}],"direction":null,"format":"","indent":0,"type":"list","version":1,"listType":"bullet","start":1,"tag":"ul"}],"direction":null,"format":"","indent":0,"type":"root","version":1}}',
      quantity: 1,
      price: 1500,
    },
  ],
  currency: "USD",
  taxRate: 8.25,
  includeTax: false,
  showTaxIfZero: false,
  discount: 100,
  includeDiscount: true,
  paymentDetails:
    "Account Holder: Acme Consulting LLC\nBank: Example National Bank\nRouting Number: 123456789\nAccount Number: 000123456789",
  notes:
    "Thank you for your business. This invoice is for demonstration purposes only.",
};
