"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { useState } from "react";
import { CircleFlag } from "react-circle-flags";

import {
  Combobox,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
} from "@/components/ui/combobox";
import { COUNTRIES, type CountryCode } from "@/lib/invoice/countries";
import { cn } from "@/lib/utils";

// Create items array for combobox filtering
const countryItems = COUNTRIES.map((country) => ({
  label: country.name,
  value: country.code,
  flag: country.flag,
}));

interface InlineCountryFieldProps {
  label: string;
  value: CountryCode;
  onChange: (value: CountryCode) => void;
  className?: string;
  required?: boolean;
  invalid?: boolean;
}

export function InlineCountryField({
  label,
  value,
  onChange,
  className,
}: InlineCountryFieldProps) {
  const selectedCountry = COUNTRIES.find((c) => c.code === value);
  const selectedItem = countryItems.find((item) => item.value === value);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Combobox
      items={countryItems}
      value={selectedItem}
      onValueChange={(item) => {
        if (item) {
          onChange(item.value as CountryCode);
        }
      }}
    >
      <div
        className={cn(
          "relative flex h-[54px] items-center justify-between border-b border-black/10 transition-colors",
          "focus-within:border-blue-600",
          "[&:hover:not(:focus-within)]:border-black/20",
          className,
        )}
      >
        <span className="shrink-0 whitespace-nowrap text-sm font-medium">
          {label}
        </span>
        <div className="relative flex h-full flex-1 items-center justify-end">
          {/* Static display - visible when not focused, pointer-events-none so clicks go through to input */}
          {!isFocused && selectedCountry && (
            <div className="pointer-events-none absolute right-0 flex items-center gap-1.5 text-sm">
              <CircleFlag
                countryCode={selectedCountry.flag}
                height={16}
                width={16}
                className="shrink-0"
              />
              <span>{selectedCountry.name}</span>
            </div>
          )}
          {/* Input - always present but transparent when not focused */}
          <ComboboxPrimitive.Input
            autoComplete="off"
            placeholder={isFocused ? "Search..." : ""}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              "h-full w-full bg-transparent text-right text-base md:text-sm caret-blue-600 outline-none placeholder:text-muted-foreground",
              !isFocused && "text-transparent",
            )}
          />
        </div>
      </div>
      <ComboboxPopup className="w-[280px]" align="end">
        <ComboboxEmpty>No country found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              <div className="flex items-center gap-2 whitespace-nowrap">
                <CircleFlag countryCode={item.flag} height={16} width={16} />
                <span>{item.label}</span>
              </div>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxPopup>
    </Combobox>
  );
}
