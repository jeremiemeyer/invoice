"use client";

import {
  GearSix as GearSixIcon,
  PencilSimple as PencilSimpleIcon,
} from "@phosphor-icons/react";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { CountryCode } from "@/lib/invoice/countries";
import { getLayout, LAYOUTS } from "@/lib/invoice/layouts";
import { getAllStyles, getStyle } from "@/lib/invoice/styles";
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
import type { InvoiceFormState, PageMargin } from "@/lib/invoice/types";
import { cn } from "@/lib/utils";

const dropdownTriggerClasses = cn(
  buttonVariants({ variant: "outline", size: "default" }),
  "w-full justify-start",
);

interface InvoiceSettingsProps {
  invoice: InvoiceFormState;
  onLayoutChange: (layoutId: string) => void;
  onStyleChange: (styleId: string) => void;
  onLocaleChange: (locale: InvoiceLocale) => void;
  onNumberLocaleChange: (numberLocale: NumberLocale) => void;
  onCurrencyChange: (currency: string) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
  onPageMarginChange: (pageMargin: PageMargin) => void;
  onFromCountryCodeChange: (countryCode: CountryCode) => void;
  previewMode?: boolean;
  onPreviewModeChange?: (enabled: boolean) => void;
  collapsed?: boolean;
  className?: string;
}

function SettingsContent({
  invoice,
  onLayoutChange,
  onStyleChange,
  onLocaleChange,
  onNumberLocaleChange,
  onCurrencyChange,
  onPageSizeChange,
  onPageMarginChange,
  onFromCountryCodeChange,
  previewMode,
  onPreviewModeChange,
}: Omit<InvoiceSettingsProps, "collapsed" | "className">) {
  const currentLayout = getLayout(invoice.layoutId || "classic");
  const currentStyle = getStyle(invoice.styleId || "classic");
  const allStyles = getAllStyles();
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
    <div className="flex flex-col gap-4 md:gap-8">
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* APPEARANCE SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label className="text-2xs uppercase tracking-wide text-muted-foreground">
            Appearance
          </Label>
          <Separator />
        </div>

        {/* Layout */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Layout</Label>
          <DropdownMenu>
            <DropdownMenuTrigger className={dropdownTriggerClasses}>
              <span>{currentLayout.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={invoice.layoutId || "classic"}
                onValueChange={onLayoutChange}
              >
                {LAYOUTS.map((layout) => (
                  <DropdownMenuRadioItem key={layout.id} value={layout.id}>
                    <span>{layout.name}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Style */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Style</Label>
          <DropdownMenu>
            <DropdownMenuTrigger className={dropdownTriggerClasses}>
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: currentStyle.colors.accent }}
              />
              <span>{currentStyle.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={invoice.styleId || "classic"}
                onValueChange={onStyleChange}
              >
                {allStyles.map((style) => (
                  <DropdownMenuRadioItem key={style.id} value={style.id}>
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: style.colors.accent }}
                    />
                    <span>{style.name}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* REGION SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <Label className="text-2xs uppercase tracking-wide text-muted-foreground">
            Region Formatting
          </Label>
          <Separator />
        </div>

        {/* Formatting Preset */}
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">
            Formatting preset
          </Label>
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
                  <PencilSimpleIcon weight="thin" />
                  <span className="text-muted-foreground">Custom</span>
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={currentPreset?.id ?? "custom"}
                onValueChange={(presetId) => {
                  const preset = INVOICE_PRESETS.find((p) => p.id === presetId);
                  if (preset) {
                    onLocaleChange(preset.locale);
                    onNumberLocaleChange(preset.numberLocale);
                    onCurrencyChange(preset.currency);
                    onPageSizeChange(preset.pageSize);
                    // Set business country code for ID labels (uppercase)
                    onFromCountryCodeChange(
                      preset.countryCode.toUpperCase() as CountryCode,
                    );
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
                    <PencilSimpleIcon />
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
            <DropdownMenuContent align="end">
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
                    <span className="text-muted-foreground">
                      {currency.label}
                    </span>
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
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={invoice.locale}
                onValueChange={(value) =>
                  onLocaleChange(value as InvoiceLocale)
                }
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
            <DropdownMenuContent align="end">
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
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={invoice.numberLocale}
                onValueChange={(value) =>
                  onNumberLocaleChange(value as NumberLocale)
                }
              >
                {NUMBER_FORMATS.map((format) => (
                  <DropdownMenuRadioItem
                    key={format.value}
                    value={format.value}
                  >
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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* PREVIEW SECTION */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {onPreviewModeChange && (
        <div className="flex flex-col gap-3">
          <Separator />
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-muted-foreground">
              Preview mode
            </Label>
            <Switch
              checked={previewMode}
              onCheckedChange={onPreviewModeChange}
              size="sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function InvoiceSettings({
  invoice,
  onLayoutChange,
  onStyleChange,
  onLocaleChange,
  onNumberLocaleChange,
  onCurrencyChange,
  onPageSizeChange,
  onPageMarginChange,
  onFromCountryCodeChange,
  previewMode,
  onPreviewModeChange,
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
          <GearSixIcon size={18} />
          <span className="sr-only">Settings</span>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-4">
          <SettingsContent
            invoice={invoice}
            onLayoutChange={onLayoutChange}
            onStyleChange={onStyleChange}
            onLocaleChange={onLocaleChange}
            onNumberLocaleChange={onNumberLocaleChange}
            onCurrencyChange={onCurrencyChange}
            onPageSizeChange={onPageSizeChange}
            onPageMarginChange={onPageMarginChange}
            onFromCountryCodeChange={onFromCountryCodeChange}
            previewMode={previewMode}
            onPreviewModeChange={onPreviewModeChange}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={className}>
      <SettingsContent
        invoice={invoice}
        onLayoutChange={onLayoutChange}
        onStyleChange={onStyleChange}
        onLocaleChange={onLocaleChange}
        onNumberLocaleChange={onNumberLocaleChange}
        onCurrencyChange={onCurrencyChange}
        onPageSizeChange={onPageSizeChange}
        onPageMarginChange={onPageMarginChange}
        onFromCountryCodeChange={onFromCountryCodeChange}
        previewMode={previewMode}
        onPreviewModeChange={onPreviewModeChange}
      />
    </div>
  );
}
