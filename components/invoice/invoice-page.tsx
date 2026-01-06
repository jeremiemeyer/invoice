"use client";

import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import useLocalStorage from "@/hooks/use-local-storage";
import { useInvoice } from "@/lib/invoice/use-invoice";
import { InvoiceWizard } from "./form/invoice-wizard";
import { InvoiceHtmlPreview } from "./preview/invoice-html-preview";

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
    <div className="flex h-screen">
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
      <main className="flex-1 overflow-hidden">
        <InvoiceHtmlPreview
          invoice={state}
          totals={totals}
          currentStep={currentStep}
          onStepClick={setCurrentStep}
          onLocaleChange={(locale) => setField("locale", locale)}
          onCurrencyChange={(currency) => setField("currency", currency)}
          onPageSizeChange={(pageSize) => setField("pageSize", pageSize)}
        />
      </main>
    </div>
  );
}
