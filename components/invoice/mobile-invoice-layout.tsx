"use client";

import { useEffect, useRef, useState } from "react";
import { getPageSizeConfig } from "@/lib/invoice/translations";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";
import { InvoiceWizard } from "./form/invoice-wizard";
import { InvoiceHtmlPreview } from "./preview/invoice-html-preview";
import { InvoiceSettings } from "./preview/invoice-settings";

interface MobileInvoiceLayoutProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
  updateLineItem: UseInvoiceReturn["updateLineItem"];
  removeLineItem: UseInvoiceReturn["removeLineItem"];
  reorderLineItems: UseInvoiceReturn["reorderLineItems"];
  totals: UseInvoiceReturn["totals"];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isBlank: boolean;
  loadState: UseInvoiceReturn["loadState"];
}

export function MobileInvoiceLayout({
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
}: MobileInvoiceLayoutProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [previewScale, setPreviewScale] = useState(0.5);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pageSizeConfig = getPageSizeConfig(state.pageSize);
  const previewWidth = pageSizeConfig.previewWidth;
  const previewHeight = pageSizeConfig.previewHeight;

  // Calculate preview scale based on viewport
  useEffect(() => {
    const calculateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 32;

      const scaleByWidth = (viewportWidth - padding) / previewWidth;
      const scaleByHeight = (viewportHeight * 0.55) / previewHeight;

      const scale = Math.min(scaleByWidth, scaleByHeight, 0.65);
      setPreviewScale(scale);
    };

    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, [previewWidth, previewHeight]);

  // Track scroll progress for backdrop fade
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const handleScroll = () => {
      const scrollTop = scrollEl.scrollTop;
      const progress = Math.min(scrollTop / 200, 1);
      setScrollProgress(progress);
    };

    scrollEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollEl.removeEventListener("scroll", handleScroll);
  }, []);

  const scaledPreviewHeight = previewHeight * previewScale;

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Fixed preview in background - z-0 */}
      <div className="fixed inset-x-0 top-0 z-0 flex justify-center pt-4 pointer-events-none">
        <div
          style={{
            transform: `scale(${previewScale})`,
            transformOrigin: "top center",
          }}
        >
          <InvoiceHtmlPreview
            invoice={state}
            totals={totals}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            className="pointer-events-auto !p-0 !overflow-visible !bg-transparent"
          />
        </div>
      </div>

      {/* Backdrop that fades in on scroll - z-10 */}
      <div
        className="fixed inset-0 z-10 bg-black pointer-events-none transition-opacity duration-150"
        style={{ opacity: scrollProgress * 0.5 }}
      />

      {/* Settings button - z-30 */}
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
        onPageMarginChange={(pageMargin) => setField("pageMargin", pageMargin)}
        collapsed
        className="fixed top-4 right-4 z-30"
      />

      {/* Scrollable area - z-20, scrollbar will be above backdrop */}
      <div
        ref={scrollRef}
        className="relative z-20 h-full overflow-y-auto overflow-x-hidden"
      >
        {/* Spacer to push content below the preview */}
        <div style={{ height: `${scaledPreviewHeight + 32}px` }} />

        {/* Wizard content */}
        <div className="relative">
          <div className="rounded-t-2xl bg-background shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
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
              compact
            />

            <div className="h-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
