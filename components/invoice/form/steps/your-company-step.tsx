"use client";

import { InlineField } from "@/components/ui/inline-field";
import { InlineImageField } from "@/components/ui/inline-image-field";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";

interface YourCompanyStepProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
}

export function YourCompanyStep({ state, setField }: YourCompanyStepProps) {
  return (
    <div>
      <h2 className="pb-3 text-2xl font-semibold">Your company</h2>

      <InlineField
        label="Company name"
        value={state.fromName}
        onChange={(value) => setField("fromName", value)}
        placeholder="Acme Inc"
        autoComplete="organization"
      />

      <InlineField
        label="Subtitle"
        value={state.fromSubtitle}
        onChange={(value) => setField("fromSubtitle", value)}
        placeholder="Web Design & Development"
      />

      <InlineImageField
        label="Logo"
        value={state.fromLogoUrl}
        onChange={(value) => setField("fromLogoUrl", value)}
        isVisible={state.showFromLogo}
        onToggleVisibility={() => setField("showFromLogo", !state.showFromLogo)}
      />

      <InlineField
        label="Email"
        type="email"
        value={state.fromEmail}
        onChange={(value) => setField("fromEmail", value)}
        placeholder="info@acme.inc"
        autoComplete="email"
      />

      <InlineField
        label="Address"
        value={state.fromAddress}
        onChange={(value) => setField("fromAddress", value)}
        placeholder="123 Main Street"
        autoComplete="street-address"
      />

      <InlineField
        label="City"
        value={state.fromCity}
        onChange={(value) => setField("fromCity", value)}
        placeholder="San Francisco"
        autoComplete="address-level2"
      />

      <InlineField
        label="Country"
        value={state.fromCountry}
        onChange={(value) => setField("fromCountry", value)}
        placeholder="United States"
        autoComplete="country-name"
      />

      <InlineField
        label="Phone"
        type="tel"
        value={state.fromPhone}
        onChange={(value) => setField("fromPhone", value)}
        placeholder="+1 234 567 890"
        autoComplete="tel"
      />

      <InlineField
        label="Tax ID"
        value={state.fromTaxId}
        onChange={(value) => setField("fromTaxId", value)}
        placeholder="XX-XXXXXXX"
      />
    </div>
  );
}
