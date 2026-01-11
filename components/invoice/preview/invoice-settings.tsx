"use client";

import { PencilEdit01Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { CircleFlag } from "react-circle-flags";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CURRENCIES,
  getPresetFromSettings,
  INVOICE_PRESETS,
  type InvoiceLocale,
  LANGUAGES,
  NUMBER_FORMATS,
  type NumberLocale,
  PAPER_SIZES,
  type PageSize,
} from "@/lib/invoice/translations";
import type { InvoiceFormState } from "@/lib/invoice/types";
import { cn } from "@/lib/utils";

const dropdownTriggerClasses = cn(
  buttonVariants({ variant: "outline", size: "default" }),
  "w-full justify-start",
);

interface InvoiceSettingsProps {
  invoice: InvoiceFormState;
  onLocaleChange: (locale: InvoiceLocale) => void;
  onNumberLocaleChange: (numberLocale: NumberLocale) => void;
  onCurrencyChange: (currency: string) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
  collapsed?: boolean;
  className?: string;
}

function SettingsContent({
  invoice,
  onLocaleChange,
  onNumberLocaleChange,
  onCurrencyChange,
  onPageSizeChange,
}: Omit<InvoiceSettingsProps, "collapsed" | "className">) {
  const currentPreset = getPresetFromSettings(
    invoice.locale,
    invoice.numberLocale,
    invoice.currency,
    invoice.pageSize,
  );
  const currentCurrency = CURRENCIES.find((c) => c.value === invoice.currency);
  const currentLanguage = LANGUAGES.find((l) => l.value === invoice.locale);
  const currentNumberFormat = NUMBER_FORMATS.find(
    (n) => n.value === invoice.numberLocale,
  );
  const currentPaperSize = PAPER_SIZES.find(
    (p) => p.value === invoice.pageSize,
  );

  return (
    <div className="flex w-52 flex-col gap-3">
      {/* Invoice Preset */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Invoice Preset</Label>
        <DropdownMenu>
          <DropdownMenuTrigger className={dropdownTriggerClasses}>
            {currentPreset ? (
              <>
                <CircleFlag
                  countryCode={currentPreset.countryCode}
                  height={16}
                  width={16}
                />
                <span>{currentPreset.label}</span>
              </>
            ) : (
              <>
                <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={1} />
                <span className="text-muted-foreground">Custom</span>
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuRadioGroup
              value={currentPreset?.id ?? "custom"}
              onValueChange={(presetId) => {
                const preset = INVOICE_PRESETS.find((p) => p.id === presetId);
                if (preset) {
                  onLocaleChange(preset.locale);
                  onNumberLocaleChange(preset.numberLocale);
                  onCurrencyChange(preset.currency);
                  onPageSizeChange(preset.pageSize);
                }
              }}
            >
              {INVOICE_PRESETS.map((preset) => (
                <DropdownMenuRadioItem key={preset.id} value={preset.id}>
                  <CircleFlag
                    countryCode={preset.countryCode}
                    height={16}
                    width={16}
                  />
                  <span>{preset.label}</span>
                </DropdownMenuRadioItem>
              ))}
              {!currentPreset && (
                <DropdownMenuRadioItem value="custom" disabled>
                  <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
                  <span className="text-muted-foreground">Custom</span>
                </DropdownMenuRadioItem>
              )}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Currency */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Currency</Label>
        <DropdownMenu>
          <DropdownMenuTrigger className={dropdownTriggerClasses}>
            {currentCurrency && (
              <CircleFlag
                countryCode={currentCurrency.countryCode}
                height={16}
                width={16}
              />
            )}
            <span>{invoice.currency}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuRadioGroup
              value={invoice.currency}
              onValueChange={onCurrencyChange}
            >
              {CURRENCIES.map((currency) => (
                <DropdownMenuRadioItem
                  key={currency.value}
                  value={currency.value}
                >
                  <CircleFlag
                    countryCode={currency.countryCode}
                    height={16}
                    width={16}
                  />
                  <span>{currency.value}</span>
                  <span className="text-muted-foreground">{currency.label}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Language */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Language</Label>
        <DropdownMenu>
          <DropdownMenuTrigger className={dropdownTriggerClasses}>
            {currentLanguage && (
              <CircleFlag
                countryCode={currentLanguage.countryCode}
                height={16}
                width={16}
              />
            )}
            <span>{currentLanguage?.label ?? invoice.locale}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuRadioGroup
              value={invoice.locale}
              onValueChange={(value) => onLocaleChange(value as InvoiceLocale)}
            >
              {LANGUAGES.map((lang) => (
                <DropdownMenuRadioItem key={lang.value} value={lang.value}>
                  <CircleFlag
                    countryCode={lang.countryCode}
                    height={16}
                    width={16}
                  />
                  <span>{lang.label}</span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Paper Size */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Paper Size</Label>
        <DropdownMenu>
          <DropdownMenuTrigger className={dropdownTriggerClasses}>
            <span>{currentPaperSize?.label ?? invoice.pageSize}</span>
            <span className="text-muted-foreground text-xs">
              {currentPaperSize?.dimensions}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuRadioGroup
              value={invoice.pageSize}
              onValueChange={(value) => onPageSizeChange(value as PageSize)}
            >
              {PAPER_SIZES.map((size) => (
                <DropdownMenuRadioItem key={size.value} value={size.value}>
                  <span>{size.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {size.dimensions}
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Number Format */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-muted-foreground">Number Format</Label>
        <DropdownMenu>
          <DropdownMenuTrigger className={dropdownTriggerClasses}>
            <span>{currentNumberFormat?.label ?? invoice.numberLocale}</span>
            <span className="text-muted-foreground text-xs">
              {currentNumberFormat?.example}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuRadioGroup
              value={invoice.numberLocale}
              onValueChange={(value) =>
                onNumberLocaleChange(value as NumberLocale)
              }
            >
              {NUMBER_FORMATS.map((format) => (
                <DropdownMenuRadioItem key={format.value} value={format.value}>
                  <span>{format.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {format.example}
                  </span>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function InvoiceSettings({
  invoice,
  onLocaleChange,
  onNumberLocaleChange,
  onCurrencyChange,
  onPageSizeChange,
  collapsed = false,
  className,
}: InvoiceSettingsProps) {
  if (collapsed) {
    return (
      <Popover>
        <PopoverTrigger
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "bg-background/80 backdrop-blur-sm",
            className,
          )}
        >
          <HugeiconsIcon icon={Settings02Icon} size={18} strokeWidth={2} />
          <span className="sr-only">Settings</span>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-4">
          <SettingsContent
            invoice={invoice}
            onLocaleChange={onLocaleChange}
            onNumberLocaleChange={onNumberLocaleChange}
            onCurrencyChange={onCurrencyChange}
            onPageSizeChange={onPageSizeChange}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={className}>
      <SettingsContent
        invoice={invoice}
        onLocaleChange={onLocaleChange}
        onNumberLocaleChange={onNumberLocaleChange}
        onCurrencyChange={onCurrencyChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
