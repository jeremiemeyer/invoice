"use client";

import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Download04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";
import { PdfTemplate } from "../pdf/pdf-template";
import { InvoiceDetailsStep } from "./steps/invoice-details-step";
import { InvoiceTermsStep } from "./steps/invoice-terms-step";
import { PaymentMethodStep } from "./steps/payment-method-step";
import { YourClientStep } from "./steps/your-client-step";
import { YourCompanyStep } from "./steps/your-company-step";

const STEPS = [
  { id: "company", label: "Your company" },
  { id: "client", label: "Your client" },
  { id: "details", label: "Invoice details" },
  { id: "payment", label: "Payment details" },
  { id: "terms", label: "Invoice terms" },
];

interface InvoiceWizardProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
  updateLineItem: UseInvoiceReturn["updateLineItem"];
  removeLineItem: UseInvoiceReturn["removeLineItem"];
  reorderLineItems: UseInvoiceReturn["reorderLineItems"];
  totals: UseInvoiceReturn["totals"];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export function InvoiceWizard({
  state,
  setField,
  updateLineItem,
  removeLineItem,
  reorderLineItems,
  totals,
  currentStep,
  setCurrentStep,
}: InvoiceWizardProps) {
  const previousStepLabel =
    currentStep > 0 ? STEPS[currentStep - 1].label : null;
  const nextStepLabel =
    currentStep < STEPS.length - 1 ? STEPS[currentStep + 1].label : null;

  const handleDownload = async () => {
    const blob = await pdf(
      <PdfTemplate invoice={state} totals={totals} />,
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${state.invoiceNumber || "invoice"}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const goToNextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-6 py-4 pl-20">
        <h1 className="text-xl font-semibold">New Invoice</h1>
        <Button type="button" onClick={handleDownload}>
          <HugeiconsIcon icon={Download04Icon} size={16} strokeWidth={2} />
          Download PDF
        </Button>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Step content */}
        <div className="flex-1 overflow-y-auto p-6 pl-20">
          {currentStep === 0 && (
            <YourCompanyStep state={state} setField={setField} />
          )}
          {currentStep === 1 && (
            <YourClientStep state={state} setField={setField} />
          )}
          {currentStep === 2 && (
            <InvoiceDetailsStep
              state={state}
              setField={setField}
              updateLineItem={updateLineItem}
              removeLineItem={removeLineItem}
              reorderLineItems={reorderLineItems}
            />
          )}
          {currentStep === 3 && (
            <PaymentMethodStep state={state} setField={setField} />
          )}
          {currentStep === 4 && (
            <InvoiceTermsStep state={state} setField={setField} />
          )}
        </div>

        {/* Navigation buttons */}
        <footer className="flex items-center justify-between border-t px-6 py-4 pl-20">
          <div className="flex-1 w-full gap-2">
            {!isFirstStep && (
              <Button
                type="button"
                variant="ghost"
                onClick={goToPreviousStep}
                className="h-auto flex-col items-start gap-0.5 px-4 py-2 w-full"
              >
                <span className="flex items-center text-xs gap-1.5 text-muted-foreground">
                  <HugeiconsIcon
                    icon={ArrowLeft02Icon}
                    size={16}
                    strokeWidth={2}
                  />
                  Previous
                </span>
                <span className="text-sm font-medium">{previousStepLabel}</span>
              </Button>
            )}
          </div>

          <div className="flex-1 w-full gap-2">
            {!isLastStep && (
              <Button
                type="button"
                variant="ghost"
                onClick={goToNextStep}
                className="h-auto flex-col items-end gap-0.5 px-4 py-2 w-full"
              >
                <span className="flex items-center text-xs gap-1.5 text-muted-foreground">
                  Next
                  <HugeiconsIcon
                    icon={ArrowRight02Icon}
                    size={16}
                    strokeWidth={2}
                  />
                </span>
                <span className="text-sm font-medium">{nextStepLabel}</span>
              </Button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
