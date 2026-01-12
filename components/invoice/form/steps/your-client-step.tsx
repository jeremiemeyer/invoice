"use client";

import { InlineField } from "@/components/ui/inline-field";
import { InlineImageField } from "@/components/ui/inline-image-field";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";

interface YourClientStepProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
}

export function YourClientStep({ state, setField }: YourClientStepProps) {
  return (
    <div>
      <h2 className="pb-3 text-2xl font-semibold">Your client</h2>

      <InlineField
        label="Client name"
        value={state.customerName}
        onChange={(value) => setField("customerName", value)}
        placeholder="Client name or company"
        autoComplete="section-customer organization"
      />

      <InlineField
        label="Subtitle"
        value={state.customerSubtitle}
        onChange={(value) => setField("customerSubtitle", value)}
        placeholder="Department or project"
      />

      <InlineImageField
        label="Logo"
        value={state.customerLogoUrl}
        onChange={(value) => setField("customerLogoUrl", value)}
        isVisible={state.showCustomerLogo}
        onToggleVisibility={() =>
          setField("showCustomerLogo", !state.showCustomerLogo)
        }
      />

      <InlineField
        label="Email"
        type="email"
        value={state.customerEmail}
        onChange={(value) => setField("customerEmail", value)}
        placeholder="client@company.com"
        autoComplete="section-customer email"
      />

      <InlineField
        label="Address"
        value={state.customerAddress}
        onChange={(value) => setField("customerAddress", value)}
        placeholder="123 Main Street"
        autoComplete="section-customer street-address"
      />

      <InlineField
        label="City"
        value={state.customerCity}
        onChange={(value) => setField("customerCity", value)}
        placeholder="San Francisco"
        autoComplete="section-customer address-level2"
      />

      <InlineField
        label="Country"
        value={state.customerCountry}
        onChange={(value) => setField("customerCountry", value)}
        placeholder="United States"
        autoComplete="section-customer country-name"
      />

      <InlineField
        label="Phone"
        type="tel"
        value={state.customerPhone}
        onChange={(value) => setField("customerPhone", value)}
        placeholder="+1 234 567 890"
        autoComplete="section-customer tel"
      />

      <InlineField
        label="Tax ID"
        value={state.customerTaxId}
        onChange={(value) => setField("customerTaxId", value)}
        placeholder="XX-XXXXXXX"
      />
    </div>
  );
}
