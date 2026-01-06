"use client";

import { useMemo, useState } from "react";
import { CircleFlag } from "react-circle-flags";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/invoice/format-currency";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";

interface TotalsSectionProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
  totals: UseInvoiceReturn["totals"];
}

const CURRENCIES = [
  { value: "USD", label: "US Dollar", country: "us" },
  { value: "EUR", label: "Euro", country: "eu" },
  { value: "GBP", label: "British Pound", country: "gb" },
  { value: "CAD", label: "Canadian Dollar", country: "ca" },
  { value: "AUD", label: "Australian Dollar", country: "au" },
  { value: "JPY", label: "Japanese Yen", country: "jp" },
  { value: "CHF", label: "Swiss Franc", country: "ch" },
  { value: "CNY", label: "Chinese Yuan", country: "cn" },
  { value: "INR", label: "Indian Rupee", country: "in" },
  { value: "MXN", label: "Mexican Peso", country: "mx" },
  { value: "BRL", label: "Brazilian Real", country: "br" },
  { value: "KRW", label: "South Korean Won", country: "kr" },
  { value: "SGD", label: "Singapore Dollar", country: "sg" },
  { value: "HKD", label: "Hong Kong Dollar", country: "hk" },
  { value: "NOK", label: "Norwegian Krone", country: "no" },
  { value: "SEK", label: "Swedish Krona", country: "se" },
  { value: "DKK", label: "Danish Krone", country: "dk" },
  { value: "NZD", label: "New Zealand Dollar", country: "nz" },
  { value: "ZAR", label: "South African Rand", country: "za" },
  { value: "RUB", label: "Russian Ruble", country: "ru" },
];

function safeCurrency(currency: string): string {
  // Fallback to USD if currency is empty or invalid
  return currency || "USD";
}

export function TotalsSection({ state, setField, totals }: TotalsSectionProps) {
  const currency = safeCurrency(state.currency);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery) return CURRENCIES;
    const query = searchQuery.toLowerCase();
    return CURRENCIES.filter(
      (c) =>
        c.value.toLowerCase().includes(query) ||
        c.label.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
      <FieldGroup>
        {/* Currency */}
        <Field>
          <FieldLabel>Currency</FieldLabel>
          <Combobox
            value={currency}
            onValueChange={(val) => {
              if (val) {
                setField("currency", val as string);
                setSearchQuery("");
              }
            }}
          >
            <ComboboxInput
              placeholder="Search currency..."
              showClear={false}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <ComboboxContent className="p-1">
              <ComboboxList>
                {filteredCurrencies.map((c) => (
                  <ComboboxItem key={c.value} value={c.value}>
                    <CircleFlag
                      countryCode={c.country}
                      height={16}
                      width={16}
                    />
                    <span>{c.value}</span>
                    <span className="text-muted-foreground">{c.label}</span>
                  </ComboboxItem>
                ))}
                {filteredCurrencies.length === 0 && (
                  <div className="text-muted-foreground py-2 text-center text-sm">
                    No currency found
                  </div>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>

        {/* Tax */}
        <div className="flex items-center gap-3">
          <Label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={state.includeTax}
              onCheckedChange={(checked) =>
                setField("includeTax", checked === true)
              }
            />
            Include Tax
          </Label>
          {state.includeTax && (
            <InputGroup className="w-24">
              e
              <InputGroupInput
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={state.taxRate}
                onChange={(e) => setField("taxRate", Number(e.target.value))}
              />
              <InputGroupAddon align="inline-end">%</InputGroupAddon>
            </InputGroup>
          )}
        </div>

        {/* Discount */}
        <div className="flex items-center gap-3">
          <Label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox
              checked={state.includeDiscount}
              onCheckedChange={(checked) =>
                setField("includeDiscount", checked === true)
              }
            />
            Include Discount
          </Label>
          {state.includeDiscount && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={state.discount}
                onChange={(e) => setField("discount", Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">{currency}</span>
            </div>
          )}
        </div>
      </FieldGroup>

      {/* Summary */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>
            {formatCurrency(totals.subTotal, currency, state.numberLocale)}
          </span>
        </div>
        {state.includeTax && state.taxRate > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Tax ({state.taxRate}%)
            </span>
            <span>
              {formatCurrency(totals.tax, currency, state.numberLocale)}
            </span>
          </div>
        )}
        {state.includeDiscount && state.discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span>
              -{formatCurrency(state.discount, currency, state.numberLocale)}
            </span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
          <span>Total</span>
          <span>
            {formatCurrency(totals.total, currency, state.numberLocale)}
          </span>
        </div>
      </div>
    </div>
  );
}
