import type { LineItem } from "./types";

export function calculateTotal({
  lineItems,
  taxRate = 0,
  discount = 0,
  includeTax = true,
  includeDiscount = true,
}: {
  lineItems: LineItem[];
  taxRate?: number;
  discount?: number;
  includeTax?: boolean;
  includeDiscount?: boolean;
}) {
  const safeLineItems = lineItems || [];

  const subTotal = safeLineItems.reduce((acc, item) => {
    if (!item) return acc;
    const safePrice = item.price ?? 0;
    const safeQuantity = item.quantity ?? 0;
    return acc + safePrice * safeQuantity;
  }, 0);

  const safeTaxRate = taxRate ?? 0;
  const safeDiscount = discount ?? 0;

  const tax = includeTax ? (subTotal * safeTaxRate) / 100 : 0;
  const discountAmount = includeDiscount ? safeDiscount : 0;

  const total = subTotal + tax - discountAmount;

  return {
    subTotal,
    tax,
    total: Math.max(0, total),
  };
}

export function calculateLineItemTotal({
  price = 0,
  quantity = 0,
}: {
  price?: number;
  quantity?: number;
}) {
  const safePrice = price ?? 0;
  const safeQuantity = quantity ?? 0;
  return safePrice * safeQuantity;
}
