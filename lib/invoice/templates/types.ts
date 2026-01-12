/**
 * Invoice template configuration type.
 * Templates define the visual styling of invoices (colors, fonts).
 * Layout structure is shared across templates - for different layouts,
 * create separate template components.
 */
export interface InvoiceTemplateConfig {
  /** Unique template identifier */
  id: string;
  /** Display name shown in template selector */
  name: string;
  /** Color class for preview dot in dropdown (e.g., "bg-gray-400", "bg-blue-600") */
  previewColor: string;
  /** Color scheme for the template */
  colors: {
    /** Section labels - FROM, TO, INVOICE NO, etc. */
    label: string;
    /** Secondary text - prices, quantities, emails */
    text: string;
    /** Divider lines between sections */
    border: string;
    /** Avatar placeholder background */
    avatarBg: string;
    /** Optional accent color for highlights */
    accent?: string;
  };
  /** Font customizations */
  fonts: {
    /** Font class for numbers/prices (e.g., "font-mono") */
    numbers?: string;
    /** Font class for section labels - FROM, TO, DESCRIPTION, etc. (e.g., "font-mono") */
    labels?: string;
  };
}
