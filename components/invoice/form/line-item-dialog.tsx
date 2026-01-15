"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InlineField, LabelAboveTextarea } from "@/components/ui/inline-field";
import type { LineItem } from "@/lib/invoice/types";

interface LineItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: LineItem | null;
  onSave: (item: Omit<LineItem, "id">) => void;
}

export function LineItemDialog({
  open,
  onOpenChange,
  item,
  onSave,
}: LineItemDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  // Reset form when dialog opens with new item
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (open) {
      setName(item?.name ?? "");
      setDescription(item?.description ?? "");
      setQuantity(item?.quantity ? String(item.quantity) : "");
      setPrice(item?.price ? String(item.price) : "");
    }
  }, [open, item]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSave = () => {
    onSave({
      name: name.trim(),
      description: description.trim(),
      quantity: quantity === "" ? 0 : Number(quantity),
      price: price === "" ? 0 : Number(price),
    });
    onOpenChange(false);
  };

  const isNew = !item;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Add item" : "Edit item"}</DialogTitle>
        </DialogHeader>

        <div>
          <InlineField
            label="Name"
            value={name}
            onChange={setName}
            placeholder="Item name"
          />

          <LabelAboveTextarea
            label="Description"
            value={description}
            onChange={setDescription}
            placeholder="Item description..."
            className="pt-4"
          />

          <InlineField
            label="Quantity"
            value={quantity}
            onChange={setQuantity}
            placeholder="1"
            type="text"
          />

          <InlineField
            label="Price"
            value={price}
            onChange={setPrice}
            placeholder="0.00"
            type="text"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isNew ? "Add" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
