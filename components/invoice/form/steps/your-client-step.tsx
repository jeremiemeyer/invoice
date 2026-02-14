"use client";

import { ToggleableField } from "@/components/invoice/form/toggleable-field";
import { Checkbox } from "@/components/ui/checkbox";
import { InlineCountryField } from "@/components/ui/inline-country-field";
import { InlineImageField } from "@/components/ui/inline-image-field";
import { InlineInput } from "@/components/ui/inline-input";
import { getCountryConfig } from "@/lib/invoice/countries";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";

interface YourClientStepProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
}

export function YourClientStep({ state, setField }: YourClientStepProps) {
  // Get country-specific ID labels based on client's country
  const countryConfig = getCountryConfig(state.customerCountryCode);

  return (
    <div>
      <h2 className="pb-3 text-lg invoice:text-2xl font-semibold">
        Your client
      </h2>

      <InlineInput
        label="Client name"
        value={state.customerName}
        onChange={(value) => setField("customerName", value)}
        placeholder="Client name or company"
        autoComplete="section-customer organization"
      />

      <InlineInput
        label="Contact / Dept"
        value={state.customerSubtitle}
        onChange={(value) => setField("customerSubtitle", value)}
        placeholder="Contact name or department"
      />

      <ToggleableField
        isVisible={state.showCustomerLogo}
        onToggleVisibility={() =>
          setField("showCustomerLogo", !state.showCustomerLogo)
        }
      >
        <InlineImageField
          label="Logo"
          value={state.customerLogoUrl}
          onChange={(value) => setField("customerLogoUrl", value)}
        />
      </ToggleableField>

      <InlineInput
        label="Email"
        type="email"
        value={state.customerEmail}
        onChange={(value) => setField("customerEmail", value)}
        placeholder="client@company.com"
        autoComplete="section-customer email"
      />

      <InlineInput
        label="Address"
        value={state.customerAddress}
        onChange={(value) => setField("customerAddress", value)}
        placeholder="123 Main Street"
        autoComplete="section-customer street-address"
      />

      <InlineInput
        label="City"
        value={state.customerCity}
        onChange={(value) => setField("customerCity", value)}
        placeholder="San Francisco"
        autoComplete="section-customer address-level2"
      />

      <ToggleableField
        isVisible={state.showCustomerCountry}
        onToggleVisibility={() =>
          setField("showCustomerCountry", !state.showCustomerCountry)
        }
      >
        <InlineCountryField
          label="Country"
          value={state.customerCountryCode}
          onChange={(code) => setField("customerCountryCode", code)}
        />
      </ToggleableField>

      <InlineInput
        label="Phone"
        type="tel"
        value={state.customerPhone}
        onChange={(value) => setField("customerPhone", value)}
        placeholder="+1 234 567 890"
        autoComplete="section-customer tel"
      />

      <InlineInput
        label={countryConfig.taxId.label}
        value={state.customerTaxId}
        onChange={(value) => setField("customerTaxId", value)}
        placeholder={countryConfig.taxId.placeholder}
      />

      {countryConfig.registrationId.available && (
        <ToggleableField
          isVisible={state.showCustomerRegistrationId}
          onToggleVisibility={() =>
            setField(
              "showCustomerRegistrationId",
              !state.showCustomerRegistrationId,
            )
          }
        >
          <InlineInput
            label={countryConfig.registrationId.label}
            value={state.customerRegistrationId}
            onChange={(value) => setField("customerRegistrationId", value)}
            placeholder={countryConfig.registrationId.placeholder}
          />
        </ToggleableField>
      )}

      {/* Separate shipping address toggle */}
      <label className="flex h-[54px] cursor-pointer items-center justify-between border-b border-black/10 transition-colors hover:border-black/20">
        <span className="text-sm font-medium">Different shipping address</span>
        <Checkbox
          checked={state.hasSeparateShippingAddress ?? false}
          onCheckedChange={(checked) =>
            setField("hasSeparateShippingAddress", checked === true)
          }
        />
      </label>

      {/* Shipping address fields (conditional) - full block for different delivery entity */}
      {state.hasSeparateShippingAddress && (
        <>
          <div className="mt-4 mb-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              Shipping details
            </p>
          </div>

          <InlineInput
            label="Name"
            value={state.shippingName}
            onChange={(value) => setField("shippingName", value)}
            placeholder="Contact name"
          />

          <InlineInput
            label="Company / Dept"
            value={state.shippingSubtitle}
            onChange={(value) => setField("shippingSubtitle", value)}
            placeholder="Company or department"
          />

          <InlineInput
            label="Address"
            value={state.shippingAddress}
            onChange={(value) => setField("shippingAddress", value)}
            placeholder="456 Warehouse Ave"
          />

          <InlineInput
            label="City"
            value={state.shippingCity}
            onChange={(value) => setField("shippingCity", value)}
            placeholder="Los Angeles, CA 90001"
          />

          <InlineInput
            label="Phone"
            type="tel"
            value={state.shippingPhone}
            onChange={(value) => setField("shippingPhone", value)}
            placeholder="+1 234 567 890"
          />
        </>
      )}
    </div>
  );
}
