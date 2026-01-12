"use client";

import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";

interface CustomerSectionProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
}

export function CustomerSection({ state, setField }: CustomerSectionProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="customerName">Name / Company</FieldLabel>
        <Input
          id="customerName"
          value={state.customerName}
          onChange={(e) => setField("customerName", e.target.value)}
          placeholder="Customer name or company"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="customerSubtitle">Subtitle</FieldLabel>
        <Input
          id="customerSubtitle"
          value={state.customerSubtitle}
          onChange={(e) => setField("customerSubtitle", e.target.value)}
          placeholder="Department or project"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="customerAddress">Address</FieldLabel>
        <Input
          id="customerAddress"
          value={state.customerAddress}
          onChange={(e) => setField("customerAddress", e.target.value)}
          placeholder="Street address"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="customerCity">City</FieldLabel>
          <Input
            id="customerCity"
            value={state.customerCity}
            onChange={(e) => setField("customerCity", e.target.value)}
            placeholder="City"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="customerCountry">Country</FieldLabel>
          <Input
            id="customerCountry"
            value={state.customerCountry}
            onChange={(e) => setField("customerCountry", e.target.value)}
            placeholder="Country"
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="customerEmail">Email</FieldLabel>
        <Input
          id="customerEmail"
          type="email"
          value={state.customerEmail}
          onChange={(e) => setField("customerEmail", e.target.value)}
          placeholder="customer@example.com"
        />
      </Field>
    </FieldGroup>
  );
}
