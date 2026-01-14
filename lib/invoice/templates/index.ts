import { classicTemplate } from "./classic";
import type { InvoiceTemplateConfig } from "./types";

export type { InvoiceTemplateConfig };

/** Default template ID used for new invoices */
export const DEFAULT_TEMPLATE_ID = "classic";

/** All available invoice templates */
export const TEMPLATES: InvoiceTemplateConfig[] = [classicTemplate];

/**
 * Get a template by ID.
 * Falls back to classic template if ID not found.
 */
export function getTemplate(id: string): InvoiceTemplateConfig {
  return TEMPLATES.find((t) => t.id === id) ?? classicTemplate;
}
