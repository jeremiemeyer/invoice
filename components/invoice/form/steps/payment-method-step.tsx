"use client";

import { LabelAboveTextarea } from "@/components/ui/inline-field";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";

interface PaymentMethodStepProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
}

export function PaymentMethodStep({ state, setField }: PaymentMethodStepProps) {
  return (
    <div>
      <h2 className="pb-3 text-2xl font-semibold">Payment details</h2>

      <div className="flex flex-col gap-4">
        <LabelAboveTextarea
          label="Payment details"
          value={state.paymentDetails}
          onChange={(value) => setField("paymentDetails", value)}
          placeholder={
            "Bank: Example Bank\nAccount Name: Your Company\nAccount Number: 1234567890"
          }
        />
        <LabelAboveTextarea
          label="Additional details"
          value={state.paymentDetailsSecondary}
          onChange={(value) => setField("paymentDetailsSecondary", value)}
          placeholder={"Bank address or\nother payment info"}
        />
      </div>
    </div>
  );
}
