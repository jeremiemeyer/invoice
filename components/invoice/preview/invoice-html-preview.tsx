"use client";

import { getPageSizeConfig } from "@/lib/invoice/translations";
import type { InvoiceFormState, InvoiceTotals } from "@/lib/invoice/types";
import { cn } from "@/lib/utils";
import { InvoiceDocument } from "./invoice-document";

interface InvoiceHtmlPreviewProps {
  invoice: InvoiceFormState;
  totals: InvoiceTotals;
  currentStep?: number;
  onStepClick?: (step: number) => void;
  className?: string;
  /** When true, renders a static version for PDF generation (no interactive elements) */
  printMode?: boolean;
}

interface PreviewSectionProps {
  stepIndex: number;
  stepLabel: string;
  currentStep?: number;
  onStepClick?: (step: number) => void;
  children: React.ReactNode;
  className?: string;
}

function PreviewSection({
  stepIndex,
  stepLabel,
  currentStep,
  onStepClick,
  children,
  className,
}: PreviewSectionProps) {
  const isActive = stepIndex === currentStep;

  return (
    // biome-ignore lint/a11y/useFocusableInteractive: Preview click
    <div
      onClick={() => onStepClick?.(stepIndex)}
      data-active={isActive}
      data-interactive="true"
      className={cn(
        "group relative w-full cursor-pointer transition-all duration-300",
        "hover:data-[active=false]:bg-neutral-100/80",
        className,
      )}
      role="button"
    >
      {/* Corner brackets for active section */}
      {isActive && (
        <div
          className="pointer-events-none absolute inset-[8px]"
          data-print-hide="true"
        >
          <div className="relative h-full w-full">
            {/* Top-left */}
            <div className="absolute -left-[1px] top-0 h-2 w-2 animate-pulse">
              <div className="h-full w-full border-l-2 border-t-2 border-[#0094FF]" />
            </div>
            {/* Top-right */}
            <div className="absolute -right-[1px] top-0 h-2 w-2 animate-pulse">
              <div className="h-full w-full border-r-2 border-t-2 border-[#0094FF]" />
            </div>
            {/* Bottom-left */}
            <div className="absolute -left-[1px] bottom-0 h-2 w-2 animate-pulse">
              <div className="h-full w-full border-b-2 border-l-2 border-[#0094FF]" />
            </div>
            {/* Bottom-right */}
            <div className="absolute -right-[1px] bottom-0 h-2 w-2 animate-pulse">
              <div className="h-full w-full border-b-2 border-r-2 border-[#0094FF]" />
            </div>
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      <div
        className="pointer-events-none absolute left-1/2 top-3 z-50 flex -translate-x-1/2 -translate-y-2.5 items-center space-x-1 rounded-full bg-[#1A1A1A] py-1 pl-1 pr-2.5 opacity-0 shadow-lg transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100"
        data-print-hide="true"
      >
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#494949] text-[10px] font-bold text-white">
          {stepIndex + 1}
        </span>
        <span className="text-[10px] font-semibold text-white">
          {stepLabel}
        </span>
      </div>

      {children}
    </div>
  );
}

export function InvoiceHtmlPreview({
  invoice,
  totals,
  currentStep = 0,
  onStepClick,
  className,
  printMode = false,
}: InvoiceHtmlPreviewProps) {
  const pageSizeConfig = getPageSizeConfig(invoice.pageSize);

  // Section wrapper for interactive mode
  const renderSection = printMode
    ? undefined
    : (
        children: React.ReactNode,
        props: { stepIndex: number; stepLabel: string; className?: string },
      ) => (
        <PreviewSection
          stepIndex={props.stepIndex}
          stepLabel={props.stepLabel}
          currentStep={currentStep}
          onStepClick={onStepClick}
          className={props.className}
        >
          {children}
        </PreviewSection>
      );

  // In print mode, render just the invoice document without wrapper
  // Dimensions are controlled by the HTML wrapper's body styling for PDF generation
  if (printMode) {
    return (
      <div className="invoice-document flex h-full w-full flex-col overflow-hidden bg-white">
        <InvoiceDocument invoice={invoice} totals={totals} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full items-center justify-center overflow-auto bg-muted/30 p-6",
        className,
      )}
    >
      {/* Invoice container - no rounded corners (it's paper) */}
      <div
        className="invoice-document relative flex flex-col overflow-hidden bg-white shadow-[0_0_0_1px_rgba(0,25,59,.05),0_1px_1px_0_rgba(0,25,59,.04),0_3px_3px_0_rgba(0,25,59,.03),0_6px_4px_0_rgba(0,25,59,.02),0_11px_4px_0_rgba(0,25,59,.01),0_32px_24px_-12px_rgba(0,0,59,.06)]"
        style={{
          width: `${pageSizeConfig.previewWidth}px`,
          height: `${pageSizeConfig.previewHeight}px`,
        }}
      >
        <InvoiceDocument
          invoice={invoice}
          totals={totals}
          renderSection={renderSection}
        />
      </div>
    </div>
  );
}
