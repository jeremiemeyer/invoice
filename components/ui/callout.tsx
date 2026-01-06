import {
  Alert02Icon,
  CancelCircleIcon,
  IdeaIcon,
  InformationCircleIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const iconClass =
  "size-5 -me-0.5 fill-[var(--callout-color)] text-background stroke-2";

export type CalloutType =
  | "info"
  | "warning"
  | "error"
  | "success"
  | "idea"
  | "warn"
  | "tip";

export interface CalloutProps
  extends Omit<CalloutContainerProps, "children" | "title"> {
  children: ReactNode;
  title?: ReactNode;
}

export function Callout({ children, title, ...props }: CalloutProps) {
  return (
    <CalloutContainer {...props}>
      {title && <CalloutTitle>{title}</CalloutTitle>}
      <CalloutDescription>{children}</CalloutDescription>
    </CalloutContainer>
  );
}

function resolveAlias(
  type: CalloutType,
): "info" | "warning" | "error" | "success" | "idea" {
  if (type === "warn") return "warning";
  if (type === "tip") return "info";
  return type as "info" | "warning" | "error" | "success" | "idea";
}

export interface CalloutContainerProps extends HTMLAttributes<HTMLDivElement> {
  type?: CalloutType;
  icon?: ReactNode;
}

export function CalloutContainer({
  type: inputType = "info",
  icon,
  children,
  className,
  style,
  ...props
}: CalloutContainerProps) {
  const type = resolveAlias(inputType);

  // Get the color variable name based on type
  const colorVarMap: Record<typeof type, string> = {
    info: "var(--color-custom-info)",
    warning: "var(--color-custom-warning)",
    error: "var(--color-custom-error)",
    success: "var(--color-custom-success)",
    idea: "var(--color-custom-idea)",
  };

  const calloutColor = colorVarMap[type] || "var(--color-custom-muted)";

  const defaultIcons = {
    info: <HugeiconsIcon icon={InformationCircleIcon} className={iconClass} />,
    warning: <HugeiconsIcon icon={Alert02Icon} className={iconClass} />,
    error: <HugeiconsIcon icon={CancelCircleIcon} className={iconClass} />,
    success: <HugeiconsIcon icon={Tick02Icon} className={iconClass} />,
    idea: (
      <HugeiconsIcon
        icon={IdeaIcon}
        className={cn(iconClass, "stroke-custom-idea")}
      />
    ),
  };

  return (
    <div
      className={cn(
        "rounded-lg shadow-custom-sm my-4 flex gap-2 overflow-hidden bg-custom-card p-3 ps-0 text-sm text-custom-card-foreground",
        className,
      )}
      style={
        {
          "--callout-color": calloutColor,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <div
        role="presentation"
        className="w-0.5 rounded-sm"
        style={{ backgroundColor: calloutColor, opacity: 0.5 }}
      />
      {icon ?? defaultIcons[type]}
      <div className="flex min-w-0 flex-1 flex-col gap-2">{children}</div>
    </div>
  );
}

export interface CalloutTitleProps
  extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CalloutTitle({
  children,
  className,
  ...props
}: CalloutTitleProps) {
  return (
    <p className={cn("my-0! font-medium", className)} {...props}>
      {children}
    </p>
  );
}

export interface CalloutDescriptionProps
  extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CalloutDescription({
  children,
  className,
  ...props
}: CalloutDescriptionProps) {
  return (
    <div
      className={cn(
        "prose-no-margin text-custom-muted-foreground empty:hidden",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
