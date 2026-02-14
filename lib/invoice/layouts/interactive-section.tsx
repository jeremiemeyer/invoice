/**
 * Interactive Section component for invoice layouts.
 * Provides clickable sections with hover effects and active state indicators.
 * Only renders interactive overlays in HTML preview mode.
 */

import { getIsHtmlMode, View } from "@jeremiemeyer/react-pdf-html";
import type { Style } from "@react-pdf/types";
import type { ReactNode } from "react";

/**
 * Interactive overlay for sections in HTML preview mode.
 * Renders hover background, corner brackets, and hover tooltip.
 */
function InteractiveOverlay({
  stepIndex,
  stepLabel,
  isActive,
  onStepClick,
}: {
  stepIndex: number;
  stepLabel: string;
  isActive: boolean;
  onStepClick?: (step: number) => void;
}) {
  // Only render in HTML mode
  if (!getIsHtmlMode()) return null;

  return (
    <>
      {/* Clickable overlay with hover background */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: Preview section click */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onStepClick?.(stepIndex);
        }}
        className="group/section absolute inset-0 z-10 cursor-pointer transition-colors hover:bg-neutral-100/40"
      >
        {/* Hover tooltip */}
        <div className="pointer-events-none absolute left-1/2 top-3 z-20 flex -translate-x-1/2 -translate-y-2.5 items-center gap-1 rounded-full bg-[#1A1A1A] py-1 pl-1 pr-2.5 opacity-0 shadow-lg transition-all duration-300 ease-out group-hover/section:translate-y-0 group-hover/section:opacity-100">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#494949] text-[10px] font-bold text-white">
            {stepIndex + 1}
          </span>
          <span className="whitespace-nowrap text-[10px] font-semibold text-white">
            {stepLabel}
          </span>
        </div>
      </div>

      {/* Corner brackets for active section */}
      {isActive && (
        <div className="pointer-events-none absolute inset-2 z-20">
          {/* Top-left */}
          <div className="absolute -left-px top-0 h-2 w-2 animate-pulse border-l-2 border-t-2 border-[#0094FF]" />
          {/* Top-right */}
          <div className="absolute -right-px top-0 h-2 w-2 animate-pulse border-r-2 border-t-2 border-[#0094FF]" />
          {/* Bottom-left */}
          <div className="absolute -left-px bottom-0 h-2 w-2 animate-pulse border-b-2 border-l-2 border-[#0094FF]" />
          {/* Bottom-right */}
          <div className="absolute -right-px bottom-0 h-2 w-2 animate-pulse border-b-2 border-r-2 border-[#0094FF]" />
        </div>
      )}
    </>
  );
}

export interface SectionProps {
  children: ReactNode;
  stepIndex: number;
  stepLabel: string;
  currentStep?: number;
  onStepClick?: (step: number) => void;
  style?: Style;
  wrap?: boolean;
}

/**
 * Section wrapper component.
 * Wraps content in a View with optional interactive overlay for HTML preview.
 */
export function Section({
  children,
  stepIndex,
  stepLabel,
  currentStep,
  onStepClick,
  style,
  wrap,
}: SectionProps) {
  const isActive = stepIndex === currentStep;
  const isHtml = getIsHtmlMode();

  // In HTML mode, add position: relative so the absolute overlay is contained
  const finalStyle: Style = isHtml
    ? { ...style, position: "relative" }
    : style || {};

  return (
    <View style={finalStyle} wrap={wrap}>
      {children}
      {/* Interactive overlay only in HTML mode and when onStepClick is provided */}
      {isHtml && onStepClick && (
        <InteractiveOverlay
          stepIndex={stepIndex}
          stepLabel={stepLabel}
          isActive={isActive}
          onStepClick={onStepClick}
        />
      )}
    </View>
  );
}
