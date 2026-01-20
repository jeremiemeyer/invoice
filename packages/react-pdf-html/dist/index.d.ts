import React, { FC } from "react";
import { PropsDefs, PropsDocument, PropsG, PropsImage, PropsLine, PropsLinearGradient, PropsLink, PropsPage, PropsPath, PropsPolygon, PropsRect, PropsSVG, PropsStop, PropsText, PropsView } from "./Types";
/**
 * Direct setter for isHtml mode (use for PDF generation without hooks)
 */
export declare const setIsHtmlMode: (value: boolean) => void;
/**
 * Getter for isHtml mode (use to check current mode)
 */
export declare const getIsHtmlMode: () => boolean;
/**
 * Hook for toggling HTML/PDF mode in React components
 */
export declare const usePDFComponentsAreHTML: () => {
    isHTML: boolean;
    setHtml: React.Dispatch<React.SetStateAction<boolean>>;
};
export declare const CustomView: FC<PropsView>;
export declare const CustomText: FC<PropsText>;
export declare const CustomImage: FC<PropsImage>;
export declare const CustomPage: FC<PropsPage>;
export declare const CustomLink: FC<PropsLink>;
export declare const CustomG: FC<PropsG>;
export declare const CustomPath: FC<PropsPath>;
export declare const CustomRect: FC<PropsRect>;
export declare const CustomSVG: FC<PropsSVG>;
export declare const CustomPolygon: FC<PropsPolygon>;
export declare const CustomDefs: FC<PropsDefs>;
export declare const CustomLine: FC<PropsLine>;
export declare const CustomStop: FC<PropsStop>;
export declare const CustomLinearGradient: FC<PropsLinearGradient>;
export declare const CustomDocument: FC<PropsDocument>;
export { CustomDefs as Defs, CustomDocument as Document, CustomG as G, CustomImage as Image, CustomLine as Line, CustomLinearGradient as LinearGradient, CustomLink as Link, CustomPage as Page, CustomPath as Path, CustomPolygon as Polygon, CustomRect as Rect, CustomStop as Stop, CustomSVG as Svg, CustomText as Text, CustomView as View, };
