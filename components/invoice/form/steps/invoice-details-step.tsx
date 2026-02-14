"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  CaretDown as CaretDownIcon,
  DotsSixVertical as DotsSixVerticalIcon,
  Plus as PlusIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { InlineInput, InlineTextarea } from "@/components/ui/inline-input";
import { createLineItem } from "@/lib/invoice/defaults";
import type { UseInvoiceReturn } from "@/lib/invoice/use-invoice";
import { cn } from "@/lib/utils";
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
  const [reorderMode, setReorderMode] = useState(false);

  const canReorder = state.lineItems.length > 1;

  // Auto-exit reorder mode when items drop below 2
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!canReorder) setReorderMode(false);
  }, [canReorder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = state.lineItems.findIndex((i) => i.id === active.id);
    const newIndex = state.lineItems.findIndex((i) => i.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderLineItems(oldIndex, newIndex);
    }
  };

  const handleAddItem = () => {
    setReorderMode(false);
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
      <div className="flex items-center justify-between pb-3">
        <h2 className="text-lg invoice:text-2xl font-semibold">
          Invoice details
        </h2>
      </div>

      {/* Line Items */}
      <div className="mb-7">
        <div className="flex items-center justify-between pb-2">
          <p className="block text-sm font-medium text-black/60">Items</p>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setReorderMode(!reorderMode)}
            disabled={!canReorder}
            className={cn(
              reorderMode &&
                "border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-50 hover:text-blue-600",
            )}
          >
            <DotsSixVerticalIcon size={12} />
            {reorderMode ? "Done" : "Reorder"}
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={state.lineItems.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div>
              <div className="space-y-0">
                {state.lineItems.map((item) => (
                  <LineItemRow
                    key={item.id}
                    item={item}
                    onUpdate={(field, value) =>
                      updateLineItem(item.id, field, value)
                    }
                    onRemove={() => removeLineItem(item.id)}
                    canRemove={state.lineItems.length > 1}
                    reorderMode={reorderMode}
                    autoOpen={item.id === newlyAddedItemId}
                    onPopoverOpenChange={(isOpen) =>
                      handlePopoverOpenChange(item.id, isOpen)
                    }
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="flex h-12 w-full items-center border-b border-black/10 py-2 text-start text-sm font-medium text-blue-600 outline-none transition-all hover:border-black/20 focus:border-blue-600"
            >
              <PlusIcon size={12} className="mr-2" />
              <span>Add item</span>
            </button>
          </SortableContext>
        </DndContext>
      </div>

      {/* More Options (Discount & Tax) */}
      <Collapsible open={moreOptionsOpen} onOpenChange={setMoreOptionsOpen}>
        <CollapsibleTrigger className="group -mx-4 invoice:-mx-6 flex h-12 w-[calc(100%+2rem)] invoice:w-[calc(100%+3rem)] items-center justify-between px-4 invoice:px-6 text-sm font-medium text-black/50 transition-colors hover:bg-accent hover:text-black/80">
          <span>More options</span>
          <CaretDownIcon
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
