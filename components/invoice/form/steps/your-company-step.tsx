"use client";

import { ToggleableField } from "@/components/invoice/form/toggleable-field";
import { InlineCountryField } from "@/components/ui/inline-country-field";
import { InlineImageField } from "@/components/ui/inline-image-field";
import { InlineInput } from "@/components/ui/inline-input";
import { getCountryConfig } from "@/lib/invoice/countries";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";

interface YourCompanyStepProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
}

export function YourCompanyStep({ state, setField }: YourCompanyStepProps) {
  // Get country-specific ID labels based on business country
  const countryConfig = getCountryConfig(state.fromCountryCode);

  return (
    <div>
      <h2 className="pb-3 text-2xl font-semibold">Your company</h2>

      <InlineInput
        label="Company name"
        value={state.fromName}
        onChange={(value) => setField("fromName", value)}
        placeholder="Acme Inc"
        autoComplete="organization"
      />

      <InlineInput
        label="Contact / Dept"
        value={state.fromSubtitle}
        onChange={(value) => setField("fromSubtitle", value)}
        placeholder="Contact name or department"
      />

      <ToggleableField
        isVisible={state.showFromLogo}
        onToggleVisibility={() => setField("showFromLogo", !state.showFromLogo)}
      >
        <InlineImageField
          label="Logo"
          value={state.fromLogoUrl}
          onChange={(value) => setField("fromLogoUrl", value)}
        />
      </ToggleableField>

      <InlineInput
        label="Email"
        type="email"
        value={state.fromEmail}
        onChange={(value) => setField("fromEmail", value)}
        placeholder="info@acme.inc"
        autoComplete="email"
      />

      <InlineInput
        label="Address"
        value={state.fromAddress}
        onChange={(value) => setField("fromAddress", value)}
        placeholder="123 Main Street"
        autoComplete="street-address"
      />

      <InlineInput
        label="City"
        value={state.fromCity}
        onChange={(value) => setField("fromCity", value)}
        placeholder="San Francisco"
        autoComplete="address-level2"
      />

      <ToggleableField
        isVisible={state.showFromCountry}
        onToggleVisibility={() =>
          setField("showFromCountry", !state.showFromCountry)
        }
      >
        <InlineCountryField
          label="Country"
          value={state.fromCountryCode}
          onChange={(code) => setField("fromCountryCode", code)}
        />
      </ToggleableField>

      <InlineInput
        label="Phone"
        type="tel"
        value={state.fromPhone}
        onChange={(value) => setField("fromPhone", value)}
        placeholder="+1 234 567 890"
        autoComplete="tel"
      />

      <InlineInput
        label={countryConfig.taxId.label}
        value={state.fromTaxId}
        onChange={(value) => setField("fromTaxId", value)}
        placeholder={countryConfig.taxId.placeholder}
      />

      {countryConfig.registrationId.available && (
        <ToggleableField
          isVisible={state.showFromRegistrationId}
          onToggleVisibility={() =>
            setField("showFromRegistrationId", !state.showFromRegistrationId)
          }
        >
          <InlineInput
            label={countryConfig.registrationId.label}
            value={state.fromRegistrationId}
            onChange={(value) => setField("fromRegistrationId", value)}
            placeholder={countryConfig.registrationId.placeholder}
          />
        </ToggleableField>
      )}
    </div>
  );
}
