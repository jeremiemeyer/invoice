"use client";

import { setIsHtmlMode } from "@jeremiemeyer/react-pdf-html";
import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { InvoicePdfDocument } from "@/lib/invoice/pdf/invoice-pdf-document";
import { getPageSizeConfig } from "@/lib/invoice/translations";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";
import { InvoiceWizard } from "./form/invoice-wizard";
import { GridBackground } from "./preview/grid-background";
import { InvoiceSettings } from "./preview/invoice-settings";

interface MobileInvoiceLayoutProps {
  state: UseInvoiceReturn["state"];
  previewState: UseInvoiceReturn["state"];
  previewTotals: UseInvoiceReturn["totals"];
  setField: UseInvoiceReturn["setField"];
  updateLineItem: UseInvoiceReturn["updateLineItem"];
  removeLineItem: UseInvoiceReturn["removeLineItem"];
  reorderLineItems: UseInvoiceReturn["reorderLineItems"];
  totals: UseInvoiceReturn["totals"];
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isBlank: boolean;
  loadState: UseInvoiceReturn["loadState"];
  previewMode?: boolean;
  onPreviewModeChange?: (previewMode: boolean) => void;
}

export function MobileInvoiceLayout({
  state,
  previewState,
  previewTotals,
  setField,
  updateLineItem,
  removeLineItem,
  reorderLineItems,
  totals,
  currentStep,
  setCurrentStep,
  isBlank,
  loadState,
  previewMode = false,
  onPreviewModeChange,
}: MobileInvoiceLayoutProps) {
  const [previewScale, setPreviewScale] = useState(0.5);
  const [snap, setSnap] = useState<number | string | null>("100px");
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1165,
  );

  const pageSizeConfig = getPageSizeConfig(state.pageSize);
  const previewWidth = pageSizeConfig.previewWidth;
  const previewHeight = pageSizeConfig.previewHeight;

  useEffect(() => {
    setIsHtmlMode(true);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1164px)");
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const calculateScale = () => {
      const padding = 32;
      setPreviewScale((window.innerWidth - padding) / previewWidth);
    };
    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, [previewWidth]);

  return (
    <div className="h-dvh overflow-hidden">
      <GridBackground />

      <div className="flex justify-center pt-4">
        <div
          style={{
            transform: `scale(${previewScale})`,
            transformOrigin: "top center",
          }}
        >
          <div
            className="overflow-hidden bg-white shadow-[0_0_0_1px_rgba(0,25,59,.05),0_1px_1px_0_rgba(0,25,59,.04),0_3px_3px_0_rgba(0,25,59,.03),0_6px_4px_0_rgba(0,25,59,.02),0_11px_4px_0_rgba(0,25,59,.01),0_32px_24px_-12px_rgba(0,0,59,.06)]"
            style={{ width: previewWidth, height: previewHeight }}
          >
            <InvoicePdfDocument
              invoice={previewState}
              totals={previewTotals}
              layoutId={state.layoutId || "classic"}
              styleId={state.styleId || "classic"}
              currentStep={currentStep}
              onStepClick={setCurrentStep}
            />
          </div>
        </div>
      </div>

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
        onFromCountryCodeChange={(countryCode) =>
          setField("fromCountryCode", countryCode)
        }
        previewMode={previewMode}
        onPreviewModeChange={onPreviewModeChange}
        collapsed
        className="fixed top-4 right-4 z-30"
      />

      {isMobile && (
        <Drawer
          open
          dismissible={false}
          modal={false}
          noBodyStyles
          snapPoints={["100px", 1]}
          activeSnapPoint={snap}
          setActiveSnapPoint={setSnap}
        >
          <DrawerContent className="!max-h-none h-dvh">
            <DrawerTitle className="sr-only">Invoice Editor</DrawerTitle>
            <div
              className={`min-h-0 flex-1 ${snap === 1 ? "overflow-y-auto" : "overflow-hidden"}`}
            >
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
                onExitPreviewMode={
                  onPreviewModeChange
                    ? () => onPreviewModeChange(false)
                    : undefined
                }
                compact
                fixedFooter={false}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}
