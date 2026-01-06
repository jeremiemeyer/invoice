"use client";

import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";

interface FromDetailsSectionProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
}

export function FromDetailsSection({ state, setField }: FromDetailsSectionProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="fromName">Name / Company</FieldLabel>
        <Input
          id="fromName"
          value={state.fromName}
          onChange={(e) => setField("fromName", e.target.value)}
          placeholder="Your name or company"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="fromAddress">Address</FieldLabel>
        <Input
          id="fromAddress"
          value={state.fromAddress}
          onChange={(e) => setField("fromAddress", e.target.value)}
          placeholder="Street address"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel htmlFor="fromCity">City</FieldLabel>
          <Input
            id="fromCity"
            value={state.fromCity}
            onChange={(e) => setField("fromCity", e.target.value)}
            placeholder="City"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="fromCountry">Country</FieldLabel>
          <Input
            id="fromCountry"
            value={state.fromCountry}
            onChange={(e) => setField("fromCountry", e.target.value)}
            placeholder="Country"
          />
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="fromEmail">Email</FieldLabel>
        <Input
          id="fromEmail"
          type="email"
          value={state.fromEmail}
          onChange={(e) => setField("fromEmail", e.target.value)}
          placeholder="email@example.com"
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="fromPhone">Phone (optional)</FieldLabel>
        <Input
          id="fromPhone"
          type="tel"
          value={state.fromPhone}
          onChange={(e) => setField("fromPhone", e.target.value)}
          placeholder="+1 234 567 890"
        />
      </Field>
    </FieldGroup>
  );
}
