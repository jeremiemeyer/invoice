"use client";

import { CaretDown, Plus } from "@phosphor-icons/react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { InlineInput, InlineTextarea } from "@/components/ui/inline-input";
import { createLineItem } from "@/lib/invoice/defaults";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";
import { LineItemRow } from "../line-item-row";

interface InvoiceDetailsStepProps {
  state: UseInvoiceReturn["state"];
  setField: UseInvoiceReturn["setField"];
  updateLineItem: UseInvoiceReturn["updateLineItem"];
  removeLineItem: UseInvoiceReturn["removeLineItem"];
  reorderLineItems: UseInvoiceReturn["reorderLineItems"];
}

export function InvoiceDetailsStep({
  state,
  setField,
  updateLineItem,
  removeLineItem,
  reorderLineItems,
}: InvoiceDetailsStepProps) {
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(
    state.includeTax || state.includeDiscount,
  );
  const [newlyAddedItemId, setNewlyAddedItemId] = useState<string | null>(null);

  const handleAddItem = () => {
    const newItem = createLineItem();
    setNewlyAddedItemId(newItem.id);
    setField("lineItems", [...state.lineItems, newItem]);
  };

  const handlePopoverOpenChange = (itemId: string, isOpen: boolean) => {
    // Clear the newly added flag when the popover closes
    if (!isOpen && newlyAddedItemId === itemId) {
      setNewlyAddedItemId(null);
    }
  };

  return (
    <div>
      <h2 className="pb-3 text-2xl font-semibold">Invoice details</h2>

      {/* Line Items */}
      <div className="mb-7">
        <p className="block pb-2 text-sm font-medium text-black/60">Items</p>

        <div className="space-y-0">
          {state.lineItems.map((item, index) => (
            <LineItemRow
              key={item.id}
              item={item}
              onUpdate={(field, value) => updateLineItem(item.id, field, value)}
              onRemove={() => removeLineItem(item.id)}
              onMoveUp={() => reorderLineItems(index, index - 1)}
              onMoveDown={() => reorderLineItems(index, index + 1)}
              canRemove={state.lineItems.length > 1}
              canMoveUp={index > 0}
              canMoveDown={index < state.lineItems.length - 1}
              autoOpen={item.id === newlyAddedItemId}
              onPopoverOpenChange={(isOpen) =>
                handlePopoverOpenChange(item.id, isOpen)
              }
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddItem}
          className="flex h-12 w-full items-center border-b border-black/10 py-2 text-start text-sm font-medium text-blue-600 outline-none transition-all hover:border-black/20 focus:border-blue-600"
        >
          <Plus size={12} className="mr-2" />
          <span>Add item</span>
        </button>
      </div>

      {/* More Options (Discount & Tax) */}
      <Collapsible open={moreOptionsOpen} onOpenChange={setMoreOptionsOpen}>
        <CollapsibleTrigger className="group -mx-6 flex h-12 w-[calc(100%+3rem)] items-center justify-between px-6 text-sm font-medium text-black/50 transition-colors hover:bg-accent hover:text-black/80">
          <span>More options</span>
          <CaretDown
            size={16}
            className="transition-transform duration-200 group-data-panel-open:rotate-180"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <InlineInput
            label="Discount"
            value={state.discount > 0 ? String(state.discount) : ""}
            onChange={(value) => {
              const num = Number(value);
              setField("discount", num);
              setField("includeDiscount", num > 0);
            }}
            placeholder="0.00"
          />

          <InlineInput
            label="Taxes"
            value={state.taxRate > 0 ? String(state.taxRate) : ""}
            onChange={(value) => {
              const num = Number(value);
              setField("taxRate", num);
              setField("includeTax", num > 0);
            }}
            placeholder="0"
            suffix="%"
          />

          <div className="flex h-[54px] items-center gap-2 border-b border-black/10 text-sm text-black/60 transition-colors hover:border-black/20">
            <Checkbox
              id="show-tax-if-zero"
              checked={state.showTaxIfZero}
              onCheckedChange={(checked) =>
                setField("showTaxIfZero", checked === true)
              }
            />
            <label htmlFor="show-tax-if-zero" className="cursor-pointer">
              Display taxes when amount is zero
            </label>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Note */}
      <div className="mt-8">
        <InlineTextarea
          label="Note"
          value={state.notes}
          onChange={(value) => setField("notes", value)}
          placeholder="Thank you for your business!"
        />
      </div>
    </div>
  );
}
