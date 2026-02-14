"use client";

import { CustomizeFieldsPopover } from "@/components/invoice/form/customize-fields-popover";
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

  const customizeFields = [
    {
      key: "showFromLogo",
      label: "Logo",
      checked: state.showFromLogo,
      onChange: (checked: boolean) => setField("showFromLogo", checked),
    },
    {
      key: "showFromCountry",
      label: "Country",
      checked: state.showFromCountry,
      onChange: (checked: boolean) => setField("showFromCountry", checked),
    },
    ...(countryConfig.registrationId.available
      ? [
          {
            key: "showFromRegistrationId",
            label: countryConfig.registrationId.label,
            checked: state.showFromRegistrationId,
            onChange: (checked: boolean) =>
              setField("showFromRegistrationId", checked),
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-lg invoice:text-2xl font-semibold">Your company</h2>
        <CustomizeFieldsPopover fields={customizeFields} />
      </div>

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

      {state.showFromLogo && (
        <InlineImageField
          label="Logo"
          value={state.fromLogoUrl}
          onChange={(value) => setField("fromLogoUrl", value)}
        />
      )}

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

      {state.showFromCountry && (
        <InlineCountryField
          label="Country"
          value={state.fromCountryCode}
          onChange={(code) => setField("fromCountryCode", code)}
        />
      )}

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

      {countryConfig.registrationId.available &&
        state.showFromRegistrationId && (
          <InlineInput
            label={countryConfig.registrationId.label}
            value={state.fromRegistrationId}
            onChange={(value) => setField("fromRegistrationId", value)}
            placeholder={countryConfig.registrationId.placeholder}
          />
        )}
    </div>
  );
}
