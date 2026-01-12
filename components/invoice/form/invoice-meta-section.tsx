"use client";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";

interface InvoiceMetaSectionProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
}

export function InvoiceMetaSection({
  state,
  setField,
}: InvoiceMetaSectionProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="invoiceNumber">Invoice Number</FieldLabel>
        <Input
          id="invoiceNumber"
          value={state.invoiceNumber}
          onChange={(e) => setField("invoiceNumber", e.target.value)}
          placeholder="INV-001"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="issueDate">Issue Date</FieldLabel>
          <Input
            id="issueDate"
            type="date"
            value={state.issueDate}
            onChange={(e) => setField("issueDate", e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="dueDate">Due Date</FieldLabel>
          <Input
            id="dueDate"
            type="date"
            value={state.dueDate}
            onChange={(e) => setField("dueDate", e.target.value)}
          />
        </Field>
      </div>
    </FieldGroup>
  );
}
