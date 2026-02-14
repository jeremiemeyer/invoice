"use client";

import {
  ArrowLeft,
  ArrowRight,
  CaretLeft,
  CaretRight,
  CircleNotch,
  DownloadSimple,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { downloadInvoicePdf } from "@/lib/invoice/pdf/generate-pdf";
import type { InvoiceFormState } from "@/lib/invoice/types";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";
import { cn } from "@/lib/utils";
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
  fixedFooter?: boolean;
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
  fixedFooter = compact,
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

  const contentWrapper = compact ? "mx-auto max-w-lg" : "";

  return (
    <div
      className={`relative flex flex-col ${compact ? "min-h-full" : "h-full"}`}
    >
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
      <header
        className={cn(
          "border-b px-4 invoice:px-6 py-4",
          compact && "sticky top-0 z-20 bg-background",
        )}
      >
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
                <CircleNotch size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <DownloadSimple size={16} />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </header>

      <div
        className={`flex flex-col ${compact ? "flex-1" : "flex-1 overflow-hidden"}`}
      >
        {/* Step content */}
        {compact ? (
          <div className="flex-1" data-vaul-no-drag>
            <div
              className={`${fixedFooter ? "pb-20" : ""} py-4 px-4 invoice:px-6 invoice:py-6`}
            >
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
          </div>
        ) : (
          <ScrollArea className="flex-1 overflow-x-hidden">
            <div
              className={`${fixedFooter ? "pb-20" : ""} py-4 px-4 invoice:px-6 invoice:py-6`}
            >
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
          </ScrollArea>
        )}

        {/* Navigation buttons */}
        <footer
          data-vaul-no-drag
          className={cn(
            "border-t px-4 invoice:px-6 py-2 invoice:py-4",
            fixedFooter && "fixed bottom-0 inset-x-0 z-30 bg-background",
            !fixedFooter && compact && "sticky bottom-0 z-20 bg-background",
          )}
        >
          <div
            className={`flex items-center justify-between ${contentWrapper}`}
          >
            <div className="flex-1 w-full gap-2">
              {!isFirstStep && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goToPreviousStep}
                  className="group/prev h-auto flex-col items-start gap-0.5 px-4 py-2 w-full"
                >
                  <span className="flex items-center text-xs gap-1.5 text-muted-foreground">
                    <span className="relative size-4">
                      <CaretLeft
                        size={16}
                        className="absolute inset-0 transition-opacity duration-150 group-hover/prev:opacity-0"
                      />
                      <ArrowLeft
                        size={16}
                        className="absolute inset-0 opacity-0 transition-opacity duration-150 group-hover/prev:opacity-100"
                      />
                    </span>
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
                  className="group/next h-auto flex-col items-end gap-0.5 px-4 py-2 w-full"
                >
                  <span className="flex items-center text-xs gap-1.5 text-muted-foreground">
                    Next
                    <span className="relative size-4">
                      <CaretRight
                        size={16}
                        className="absolute inset-0 transition-opacity duration-150 group-hover/next:opacity-0"
                      />
                      <ArrowRight
                        size={16}
                        className="absolute inset-0 opacity-0 transition-opacity duration-150 group-hover/next:opacity-100"
                      />
                    </span>
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
