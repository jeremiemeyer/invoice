"use client";

import {
  ArrowLeft02Icon,
  ArrowRight02Icon,
  Download04Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { downloadInvoicePdf } from "@/lib/invoice/pdf/generate-pdf";
import type { InvoiceFormState } from "@/lib/invoice/types";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";
import { DocumentTypeSelector } from "./document-type-selector";
import { FileMenu } from "./file-menu";
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
  isBlank: boolean;
  loadState: (state: InvoiceFormState) => void;
  compact?: boolean;
  previewMode?: boolean;
  onExitPreviewMode?: () => void;
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
  isBlank,
  loadState,
  compact = false,
  previewMode = false,
  onExitPreviewMode,
}: InvoiceWizardProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const previousStepLabel =
    currentStep > 0 ? STEPS[currentStep - 1].label : null;
  const nextStepLabel =
    currentStep < STEPS.length - 1 ? STEPS[currentStep + 1].label : null;

  const handleDownload = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      await downloadInvoicePdf({
        invoice: state,
        totals,
        layoutId: state.layoutId || "classic",
        styleId: state.styleId || "classic",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      // TODO: Show user-friendly error notification
    } finally {
      setIsGenerating(false);
    }
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

  const contentWrapper = compact ? "mx-auto max-w-sm" : "";

  return (
    <div className="relative flex h-full flex-col">
      {/* Preview mode overlay */}
      {previewMode && (
        <div
          role="button"
          tabIndex={0}
          className="group absolute inset-0 z-50 cursor-pointer bg-background/60 backdrop-blur-[1px] flex items-center justify-center overflow-hidden"
          onClick={() => onExitPreviewMode?.()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onExitPreviewMode?.();
            }
          }}
        >
          <span className="text-6xl font-black text-muted-foreground/20 tracking-widest -rotate-45 select-none whitespace-nowrap group-hover:hidden">
            PREVIEW MODE
          </span>
          <span className="text-sm font-medium text-muted-foreground hidden group-hover:flex items-center gap-1 animate-pulse">
            Click to exit preview mode
          </span>
        </div>
      )}

      {/* Header */}
      <header className={`border-b px-6 py-4 ${compact ? "" : "pl-20"}`}>
        <div className={`flex items-center justify-between ${contentWrapper}`}>
          <div className="flex items-center gap-2">
            <FileMenu state={state} onLoadState={loadState} isBlank={isBlank} />
            <DocumentTypeSelector
              documentType={state.documentType}
              onDocumentTypeChange={(type) => setField("documentType", type)}
            />
          </div>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={16}
                  strokeWidth={2}
                  className="animate-spin"
                />
                Generating...
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={Download04Icon}
                  size={16}
                  strokeWidth={2}
                />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Step content */}
        <div className={`flex-1 overflow-y-auto p-6 ${compact ? "" : "pl-20"}`}>
          <div className={contentWrapper}>
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
        </div>

        {/* Navigation buttons */}
        <footer className={`border-t px-6 py-4 ${compact ? "" : "pl-20"}`}>
          <div
            className={`flex items-center justify-between ${contentWrapper}`}
          >
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
                  <span className="text-sm font-medium">
                    {previousStepLabel}
                  </span>
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
          </div>
        </footer>
      </div>
    </div>
  );
}
