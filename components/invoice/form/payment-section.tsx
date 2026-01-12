"use client";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";

interface PaymentSectionProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
}

export function PaymentSection({ state, setField }: PaymentSectionProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="paymentDetails">Payment Instructions</FieldLabel>
        <FieldDescription>
          Bank details, payment methods, or other instructions
        </FieldDescription>
        <Textarea
          id="paymentDetails"
          value={state.paymentDetails}
          onChange={(e) => setField("paymentDetails", e.target.value)}
          placeholder="Bank: Example Bank&#10;Account: 1234567890&#10;Routing: 123456789"
          rows={4}
        />
      </Field>
    </FieldGroup>
  );
}
