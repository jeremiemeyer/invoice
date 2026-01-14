"use client";

import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import { calculateTotal } from "@/lib/invoice/calculate";
import { demoInvoiceData } from "@/lib/invoice/demo-data";
import { useInvoice } from "@/lib/invoice/use-invoice";
import { InvoiceWizard } from "./form/invoice-wizard";
import { MobileInvoiceLayout } from "./mobile-invoice-layout";
import { InvoiceSettings } from "./preview/invoice-settings";
import { PdfPreview } from "./preview/pdf-preview";

const STEP_STORAGE_KEY = "invoice-wizard-step";

export function InvoicePage() {
  const {
    state,
    totals,
    isHydrated,
    isBlank,
    setField,
    updateLineItem,
    removeLineItem,
    reorderLineItems,
    loadState,
  } = useInvoice();

  // Step state is now managed at page level to share between wizard and preview
  const [currentStep, setCurrentStep] = useLocalStorage(STEP_STORAGE_KEY, 0);

  // Preview mode shows demo data instead of user's data
  const [previewMode, setPreviewMode] = useState(false);

  // Calculate totals for demo data
  const demoTotals = useMemo(
    () =>
      calculateTotal({
        lineItems: demoInvoiceData.lineItems,
        taxRate: demoInvoiceData.taxRate,
        discount: demoInvoiceData.discount,
        includeTax: demoInvoiceData.includeTax,
        includeDiscount: demoInvoiceData.includeDiscount,
      }),
    [],
  );

  // Use demo data when preview mode is enabled, but keep user's settings
  const previewState = useMemo(() => {
    if (!previewMode) return state;
    // Merge demo content with user's current settings
    return {
      ...demoInvoiceData,
      // Preserve user's display settings
      layoutId: state.layoutId,
      styleId: state.styleId,
      pageMargin: state.pageMargin,
      locale: state.locale,
      numberLocale: state.numberLocale,
      currency: state.currency,
      pageSize: state.pageSize,
    };
  }, [previewMode, state]);
  const previewTotals = previewMode ? demoTotals : totals;

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">
          <HugeiconsIcon
            icon={Loading03Icon}
            size={32}
            strokeWidth={2}
            className="animate-spin"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      {/* Desktop: Side-by-side layout */}
      <div className="hidden invoice:flex h-full">
        {/* Wizard Form */}
        <aside className="w-[520px] min-w-[480px] border-r bg-background">
          <InvoiceWizard
            state={state}
            setField={setField}
            updateLineItem={updateLineItem}
            removeLineItem={removeLineItem}
            reorderLineItems={reorderLineItems}
            totals={totals}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            isBlank={isBlank}
            loadState={loadState}
            previewMode={previewMode}
            onExitPreviewMode={() => setPreviewMode(false)}
          />
        </aside>

        {/* Preview Panel */}
        <main className="relative flex-1 overflow-hidden">
          {/* Fixed settings */}
          <InvoiceSettings
            invoice={state}
            onLayoutChange={(layoutId) => setField("layoutId", layoutId)}
            onStyleChange={(styleId) => setField("styleId", styleId)}
            onLocaleChange={(locale) => setField("locale", locale)}
            onNumberLocaleChange={(numberLocale) =>
              setField("numberLocale", numberLocale)
            }
            onCurrencyChange={(currency) => setField("currency", currency)}
            onPageSizeChange={(pageSize) => setField("pageSize", pageSize)}
            onPageMarginChange={(pageMargin) =>
              setField("pageMargin", pageMargin)
            }
            previewMode={previewMode}
            onPreviewModeChange={setPreviewMode}
            className="fixed top-4 right-4 z-10"
          />

          <PdfPreview
            invoice={previewState}
            totals={previewTotals}
            layoutId={state.layoutId || "classic"}
            styleId={state.styleId || "classic"}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </main>
      </div>

      {/* Mobile: Scroll-based drawer layout */}
      <div className="invoice:hidden">
        <MobileInvoiceLayout
          state={state}
          setField={setField}
          updateLineItem={updateLineItem}
          removeLineItem={removeLineItem}
          reorderLineItems={reorderLineItems}
          totals={totals}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isBlank={isBlank}
          loadState={loadState}
        />
      </div>
    </div>
  );
}
