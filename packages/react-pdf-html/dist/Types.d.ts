import { DocumentProps, PageProps, SVGPresentationAttributes, SourceObject, Style, TextProps, ViewProps } from "@react-pdf/types";
import { ReactNode } from "react";
export type { Style };
export interface PropsView extends ViewProps {
    style?: Style | Style[];
    children?: ReactNode;
    debug?: boolean;
}
export interface PropsText extends TextProps {
    style?: Style | Style[];
    children?: ReactNode;
    debug?: boolean;
}
export interface PropsImage extends ImageWithSrcProp {
    style?: Style | Style[];
}
export interface PropsPage extends PageProps {
    style?: Style | Style[];
    children?: ReactNode;
    size?: "A4" | "LETTER" | "LEGAL" | [number, number];
}
export interface PropsLink extends LinkProps {
    style?: Style | Style[];
    children?: ReactNode;
}
export interface PropsSVG extends SVGProps {
    style?: Style | Style[];
    children?: ReactNode;
}
export interface PropsRect extends RectProps {
    children?: ReactNode;
}
export interface PropsPath extends PathProps {
    children?: ReactNode;
}
export interface PropsG extends SVGPresentationAttributes {
    children?: ReactNode;
}
export interface PropsLine extends LineProps {
    children?: ReactNode;
}
export interface PropsStop extends StopProps {
    children?: ReactNode;
}
export interface PropsLinearGradient extends LinearGradientProps {
    children?: ReactNode;
}
export interface PropsDefs {
    children?: ReactNode;
}
export interface PropsDocument extends DocumentProps {
    children?: ReactNode;
}
export interface PropsPolygon extends PropPolygon {
    children?: ReactNode;
}
export type { Style as StylePDF };
export type fontWeight = number | "thin" | "hairline" | "ultralight" | "extralight" | "light" | "normal" | "medium" | "semibold" | "demibold" | "bold" | "ultrabold" | "extrabold" | "heavy" | "black";
interface NodeProps {
    id?: string;
    style?: Style | Style[];
    /**
     * Render component in all wrapped pages.
     * @see https://react-pdf.org/advanced#fixed-components
     */
    fixed?: boolean;
    /**
     * Force the wrapping algorithm to start a new page when rendering the
     * element.
     * @see https://react-pdf.org/advanced#page-breaks
     */
    break?: boolean;
    /**
     * Hint that no page wrapping should occur between all sibling elements following the element within n points
     * @see https://react-pdf.org/advanced#orphan-&-widow-protection
     */
    minPresenceAhead?: number;
}
interface BaseImageProps extends NodeProps {
    /**
     * Enables debug mode on page bounding box.
     * @see https://react-pdf.org/advanced#debugging
     */
    debug?: boolean;
    cache?: boolean;
}
interface ImageWithSrcProp extends BaseImageProps {
    src: SourceObject;
}
interface LinkProps extends NodeProps {
    /**
     * Enable/disable page wrapping for element.
     * @see https://react-pdf.org/components#page-wrapping
     */
    wrap?: boolean;
    /**
     * Enables debug mode on page bounding box.
     * @see https://react-pdf.org/advanced#debugging
     */
    debug?: boolean;
    src: string;
}
interface SVGProps extends NodeProps {
    /**
     * Enables debug mode on page bounding box.
     * @see https://react-pdf.org/advanced#debugging
     */
    debug?: boolean;
    width?: string | number;
    height?: string | number;
    viewBox?: string;
    preserveAspectRatio?: string;
}
interface RectProps extends SVGPresentationAttributes {
    style?: SVGPresentationAttributes;
    x: string | number;
    y: string | number;
    width: string | number;
    height: string | number;
    rx?: string | number;
    ry?: string | number;
}
interface PropPolygon {
    style?: React.CSSProperties | SVGPresentationAttributes;
    points: string;
}
interface PathProps extends SVGPresentationAttributes {
    style?: SVGPresentationAttributes;
    d: string;
}
interface LineProps extends SVGPresentationAttributes {
    style?: SVGPresentationAttributes;
    x1: string | number;
    x2: string | number;
    y1: string | number;
    y2: string | number;
}
interface StopProps {
    offset: string | number;
    stopColor: string;
    stopOpacity?: string | number;
}
interface LinearGradientProps {
    id: string;
    x1: string | number;
    x2: string | number;
    y1: string | number;
    y2: string | number;
}
