"use client";

import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import useLocalStorage from "@/hooks/use-local-storage";
import { useInvoice } from "@/lib/invoice/use-invoice";
import { InvoiceWizard } from "./form/invoice-wizard";
import { MobileInvoiceLayout } from "./mobile-invoice-layout";
import { InvoiceHtmlPreview } from "./preview/invoice-html-preview";
import { InvoiceSettings } from "./preview/invoice-settings";

const STEP_STORAGE_KEY = "invoice-wizard-step";

export function InvoicePage() {
  const {
    state,
    totals,
    isHydrated,
    setField,
    updateLineItem,
    removeLineItem,
    reorderLineItems,
  } = useInvoice();

  // Step state is now managed at page level to share between wizard and preview
  const [currentStep, setCurrentStep] = useLocalStorage(STEP_STORAGE_KEY, 0);

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
          />
        </aside>

        {/* Preview Panel */}
        <main className="relative flex-1 overflow-hidden">
          {/* Fixed settings */}
          <InvoiceSettings
            invoice={state}
            onLocaleChange={(locale) => setField("locale", locale)}
            onNumberLocaleChange={(numberLocale) =>
              setField("numberLocale", numberLocale)
            }
            onCurrencyChange={(currency) => setField("currency", currency)}
            onPageSizeChange={(pageSize) => setField("pageSize", pageSize)}
            className="fixed top-4 right-4 z-10"
          />

          <InvoiceHtmlPreview
            invoice={state}
            totals={totals}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            showSettings={false}
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
        />
      </div>
    </div>
  );
}
