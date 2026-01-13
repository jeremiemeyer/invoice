/**
 * Invoice style type definitions.
 */

export interface InvoiceStyle {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Color palette */
  colors: {
    /** Primary text color (headings, important text) */
    primary: string;
    /** Secondary text color (body text) */
    secondary: string;
    /** Muted text color (labels, captions) */
    muted: string;
    /** Border color */
    border: string;
    /** Background color */
    background: string;
    /** Accent color (highlights, badges) */
    accent: string;
    /** Avatar/logo background */
    avatarBg: string;
  };
  /** Font families */
  fonts: {
    /** Heading font */
    heading: string;
    /** Body text font */
    body: string;
    /** Monospace font (for code, numbers) */
    mono: string;
  };
  /** Font style options */
  fontStyle: {
    /** Use monospace font for labels (DESCRIPTION, QTY, etc.) */
    monoLabels: boolean;
    /** Use monospace font for numbers (amounts, dates) */
    monoNumbers: boolean;
    /** Label font weight (400=regular, 300=light) */
    labelWeight: number;
  };
  /** Spacing values in points */
  spacing: {
    /** Page padding */
    page: number;
    /** Section padding */
    section: number;
    /** Item padding */
    item: number;
  };
}
