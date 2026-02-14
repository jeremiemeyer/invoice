/**
 * Interactive Section component for invoice layouts.
 * Provides clickable sections with hover effects and active state indicators.
 * Only renders interactive overlays in HTML preview mode.
 */

import { getIsHtmlMode, View } from "@jeremiemeyer/react-pdf-html";
import type { Style } from "@react-pdf/types";
import { motion, useAnimate } from "motion/react";
import { type ReactNode, useEffect } from "react";

const d = 2; // breathing displacement (px)
const focusD = 14; // initial focus-in displacement (px)

const corners = [
  {
    className: "top-0 -left-px border-l-2 border-t-2",
    x: -d,
    y: -d,
    fx: -focusD,
    fy: -focusD,
  },
  {
    className: "top-0 -right-px border-r-2 border-t-2",
    x: d,
    y: -d,
    fx: focusD,
    fy: -focusD,
  },
  {
    className: "bottom-0 -left-px border-b-2 border-l-2",
    x: -d,
    y: d,
    fx: -focusD,
    fy: focusD,
  },
  {
    className: "bottom-0 -right-px border-b-2 border-r-2",
    x: d,
    y: d,
    fx: focusD,
    fy: focusD,
  },
];

function CornerBracket({ corner }: { corner: (typeof corners)[number] }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();

  useEffect(() => {
    async function sequence() {
      // Phase 1: Focus in from expanded position
      await animate(
        scope.current,
        { x: 0, y: 0, opacity: 1 },
        { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
      );
      // Phase 2: Subtle breathing loop
      animate(
        scope.current,
        { x: [0, corner.x], y: [0, corner.y] },
        {
          duration: 1.6,
          ease: [0.4, 0, 0.2, 1],
          repeat: Infinity,
          repeatType: "mirror",
        },
      );
    }
    sequence();
  }, [animate, scope, corner]);

  return (
    <motion.div
      ref={scope}
      className={`absolute h-2 w-2 border-[#0094FF] ${corner.className}`}
      initial={{ x: corner.fx, y: corner.fy, opacity: 0 }}
    />
  );
}

function CornerBrackets() {
  return (
    <div className="pointer-events-none absolute inset-2 z-20">
      {corners.map((corner) => (
        <CornerBracket key={corner.className} corner={corner} />
      ))}
    </div>
  );
}

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
      {isActive && <CornerBrackets />}
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
