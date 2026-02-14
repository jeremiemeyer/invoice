"use client";

import { setIsHtmlMode } from "@jeremiemeyer/react-pdf-html";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  InvoicePdfDocument,
  LAYOUT,
} from "@/lib/invoice/pdf/invoice-pdf-document";
import { getPageSizeConfig } from "@/lib/invoice/translations";
import type { InvoiceFormState, InvoiceTotals } from "@/lib/invoice/types";
import { cn } from "@/lib/utils";

export interface PdfPreviewProps {
  /** Invoice form data */
  invoice: InvoiceFormState;
  /** Calculated totals */
  totals: InvoiceTotals;
  /** Layout ID */
  layoutId?: string;
  /** Theme ID */
  styleId?: string;
  /** Current wizard step (for highlighting) */
  currentStep?: number;
  /** Callback when a section is clicked */
  onStepClick?: (step: number) => void;
  /** Additional className for the container */
  className?: string;
}

/**
 * Single page view - clips content to show only one page
 * Accounts for footer space when calculating page content area
 */
function PageView({
  pageIndex,
  previewWidth,
  previewHeight,
  footerHeight,
  children,
  isMainView = false,
}: {
  pageIndex: number;
  previewWidth: number;
  previewHeight: number;
  footerHeight: number;
  children: React.ReactNode;
  isMainView?: boolean;
}) {
  // Usable content height per page (excluding footer)
  const contentHeightPerPage = previewHeight - footerHeight;
  // Offset for this page's content
  const pageOffset = pageIndex * contentHeightPerPage;

  return (
    <div
      className={cn(
        "relative bg-white overflow-hidden flex-shrink-0",
        isMainView && "shadow-custom-lg",
      )}
      style={{
        width: previewWidth,
        height: previewHeight,
      }}
    >
      {/* Clipped content - shows only this page's portion */}
      <div
        style={{
          transform: `translateY(-${pageOffset}px)`,
          // Height must be full page height so flexbox can push footer to bottom
          height: previewHeight,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Page thumbnail for navigation
 */
function PageThumbnail({
  pageIndex,
  isActive,
  onClick,
  previewWidth,
  previewHeight,
  children,
}: {
  pageIndex: number;
  isActive: boolean;
  onClick: () => void;
  previewWidth: number;
  previewHeight: number;
  children: React.ReactNode;
}) {
  const scale = 0.12; // Thumbnail scale

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200",
        "border shadow-sm",
        isActive
          ? "border-blue-500 shadow-md ring-2 ring-blue-500/20"
          : "border-gray-200 hover:border-gray-300 hover:shadow",
      )}
      style={{
        width: previewWidth * scale,
        height: previewHeight * scale,
      }}
    >
      {/* Scaled page content */}
      <div
        className="origin-top-left bg-white"
        style={{
          width: previewWidth,
          height: previewHeight,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
      {/* Page number overlay */}
      <div
        className={cn(
          "absolute bottom-0.5 right-0.5 text-white text-[8px] h-4 w-4 flex items-center justify-center rounded-full",
          isActive ? "bg-blue-500" : "bg-black/50",
        )}
      >
        {pageIndex + 1}
      </div>
    </button>
  );
}

/**
 * PDF preview component with multi-page support.
 * Shows the active page large with page thumbnails below for navigation.
 */
export function PdfPreview({
  invoice,
  totals,
  layoutId = "classic",
  styleId = "classic",
  currentStep = 0,
  onStepClick,
  className,
}: PdfPreviewProps) {
  const pageSizeConfig = getPageSizeConfig(invoice.pageSize);
  const { previewWidth, previewHeight } = pageSizeConfig;

  // Footer height from layout constants - reserved space at bottom of each page
  const footerHeight = LAYOUT.footerHeight;
  // Usable content height per page (excluding footer area)
  const contentHeightPerPage = previewHeight - footerHeight;

  const contentRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);

  // Ensure HTML mode for preview
  useEffect(() => {
    setIsHtmlMode(true);
  }, []);

  // Measure content height and calculate page count
  const measureContent = useCallback(() => {
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      // Calculate pages based on usable content height (excluding footer space)
      const pages = Math.max(
        1,
        Math.ceil(contentHeight / contentHeightPerPage),
      );
      setPageCount(pages);
      // Reset to page 1 if current page is out of bounds
      if (activePage >= pages) {
        setActivePage(Math.max(0, pages - 1));
      }
    }
  }, [contentHeightPerPage, activePage]);

  // Measure on mount and when content changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: invoice/totals are props, need to remeasure when they change
  useEffect(() => {
    measureContent();
    // Also measure after a short delay to account for async rendering
    const timeout = setTimeout(measureContent, 100);
    return () => clearTimeout(timeout);
  }, [measureContent, invoice, totals]);

  // Hidden container to measure total content height
  const measurementContent = (
    <div
      ref={contentRef}
      style={{
        position: "absolute",
        visibility: "hidden",
        width: previewWidth,
      }}
    >
      <InvoicePdfDocument
        invoice={invoice}
        totals={totals}
        layoutId={layoutId}
        styleId={styleId}
      />
    </div>
  );

  return (
    <div className={cn("h-full overflow-auto", className)}>
      {/* Hidden measurement container */}
      {measurementContent}

      {/* Centering wrapper - offset left to account for settings panel on right */}
      <div className="flex min-h-full flex-col items-center justify-center gap-4 py-8 pl-4 pr-32">
        {/* Main preview - active page */}
        <PageView
          pageIndex={activePage}
          previewWidth={previewWidth}
          previewHeight={previewHeight}
          footerHeight={footerHeight}
          isMainView={true}
        >
          <InvoicePdfDocument
            invoice={invoice}
            totals={totals}
            layoutId={layoutId}
            styleId={styleId}
            currentStep={currentStep}
            onStepClick={onStepClick}
            pageNumber={activePage + 1}
            totalPages={pageCount}
          />
        </PageView>

        {/* Thumbnails navigation (when multi-page) */}
        {pageCount > 1 && (
          <div className="flex items-center gap-3 pb-4">
            {/* Thumbnails */}
            <div className="flex gap-2">
              {Array.from({ length: pageCount }).map((_, index) => (
                <PageThumbnail
                  key={index}
                  pageIndex={index}
                  isActive={index === activePage}
                  onClick={() => setActivePage(index)}
                  previewWidth={previewWidth}
                  previewHeight={previewHeight}
                >
                  <PageView
                    pageIndex={index}
                    previewWidth={previewWidth}
                    previewHeight={previewHeight}
                    footerHeight={footerHeight}
                  >
                    <InvoicePdfDocument
                      invoice={invoice}
                      totals={totals}
                      layoutId={layoutId}
                      styleId={styleId}
                      pageNumber={index + 1}
                      totalPages={pageCount}
                    />
                  </PageView>
                </PageThumbnail>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
