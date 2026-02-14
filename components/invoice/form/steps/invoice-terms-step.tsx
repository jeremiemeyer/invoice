"use client";

import { InlineDatePicker } from "@/components/ui/date-picker";
import { InlineInput } from "@/components/ui/inline-input";
import { getTranslations } from "@/lib/invoice/translations";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";

interface InvoiceTermsStepProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
}

export function InvoiceTermsStep({ state, setField }: InvoiceTermsStepProps) {
  const t = getTranslations(state.locale);

  return (
    <div>
      <h2 className="pb-3 text-2xl font-semibold">Invoice terms</h2>

      <InlineInput
        label="Invoice number"
        value={state.invoiceNumber}
        onChange={(value) => setField("invoiceNumber", value)}
        placeholder="INV-001"
      />

      <InlineInput
        label={t.purchaseOrderNumber}
        value={state.purchaseOrderNumber}
        onChange={(value) => setField("purchaseOrderNumber", value)}
        placeholder=""
      />

      <InlineDatePicker
        label="Issue date"
        value={state.issueDate}
        onChange={(value) => setField("issueDate", value)}
        placeholder="Select date"
      />

      <InlineDatePicker
        label="Due date"
        value={state.dueDate}
        onChange={(value) => setField("dueDate", value)}
        placeholder="Select date"
        presets={[
          { label: "7 days", days: 7 },
          { label: "14 days", days: 14 },
          { label: "1 mo", months: 1 },
        ]}
        presetsRelativeTo={state.issueDate}
      />
    </div>
  );
}
