"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useLocalStorage from "@/hooks/use-local-storage";
import type { InvoiceFormState, InvoiceTotals, LineItem } from "./types";
import { createLineItem, defaultInvoiceState, getDefaultState } from "./defaults";
import { calculateTotal } from "./calculate";
import { parseLexicalState, plainTextToLexical } from "./lexical-to-html";

// Migrate plain text name to Lexical JSON format
function migrateLineItemName(name: string): string {
  if (!name) return name;
  // Check if it's already valid Lexical JSON
  const parsed = parseLexicalState(name);
  if (parsed !== null) {
    return name; // Already Lexical format
  }
  // Convert plain text to Lexical format
  return JSON.stringify(plainTextToLexical(name));
}

function migrateLineItems(lineItems: LineItem[]): LineItem[] {
  return lineItems.map((item) => ({
    ...item,
    name: migrateLineItemName(item.name),
  }));
}

const STORAGE_KEY = "invoice-draft";

export function useInvoice() {
  const [state, setState, resetStorage] = useLocalStorage<InvoiceFormState>(
    STORAGE_KEY,
    defaultInvoiceState
  );

  const [isHydrated, setIsHydrated] = useState(false);

  // Generate dynamic values (invoice number, dates) only on client after hydration
  // Also migrate old plain text line item names to Lexical format
  useEffect(() => {
    // Read from localStorage and set defaults if needed
    const defaults = getDefaultState();
    setState((prev) => {
      const lineItems = prev.lineItems.length === 0
        ? defaults.lineItems
        : migrateLineItems(prev.lineItems);
      return {
        ...prev,
        invoiceNumber: prev.invoiceNumber || defaults.invoiceNumber,
        issueDate: prev.issueDate || defaults.issueDate,
        dueDate: prev.dueDate || defaults.dueDate,
        lineItems,
      };
    });
    setIsHydrated(true);
  }, [setState]);

  const totals: InvoiceTotals = useMemo(
    () =>
      calculateTotal({
        lineItems: state.lineItems,
        taxRate: state.taxRate,
        discount: state.discount,
        includeTax: state.includeTax,
        includeDiscount: state.includeDiscount,
      }),
    [
      state.lineItems,
      state.taxRate,
      state.discount,
      state.includeTax,
      state.includeDiscount,
    ]
  );

  const setField = useCallback(
    <K extends keyof InvoiceFormState>(field: K, value: InvoiceFormState[K]) => {
      setState((prev) => ({ ...prev, [field]: value }));
    },
    [setState]
  );

  const addLineItem = useCallback(() => {
    setState((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, createLineItem()],
    }));
  }, [setState]);

  const updateLineItem = useCallback(
    (id: string, field: keyof LineItem, value: unknown) => {
      setState((prev) => ({
        ...prev,
        lineItems: prev.lineItems.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      }));
    },
    [setState]
  );

  const removeLineItem = useCallback(
    (id: string) => {
      setState((prev) => {
        if (prev.lineItems.length <= 1) {
          return prev;
        }
        return {
          ...prev,
          lineItems: prev.lineItems.filter((item) => item.id !== id),
        };
      });
    },
    [setState]
  );

  const replaceLineItem = useCallback(
    (id: string, data: Omit<LineItem, "id">) => {
      setState((prev) => ({
        ...prev,
        lineItems: prev.lineItems.map((item) =>
          item.id === id ? { ...item, ...data } : item
        ),
      }));
    },
    [setState]
  );

  const reorderLineItems = useCallback(
    (fromIndex: number, toIndex: number) => {
      setState((prev) => {
        const items = [...prev.lineItems];
        const [removed] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, removed);
        return { ...prev, lineItems: items };
      });
    },
    [setState]
  );

  const reset = useCallback(() => {
    resetStorage();
  }, [resetStorage]);

  return {
    state,
    totals,
    isHydrated,
    setField,
    addLineItem,
    updateLineItem,
    removeLineItem,
    replaceLineItem,
    reorderLineItems,
    reset,
  };
}

export type UseInvoiceReturn = ReturnType<typeof useInvoice>;
