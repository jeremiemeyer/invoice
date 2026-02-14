"use client";

import { Faders as FadersIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CustomizeField {
  key: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface CustomizeFieldsPopoverProps {
  fields: CustomizeField[];
}

export function CustomizeFieldsPopover({
  fields,
}: CustomizeFieldsPopoverProps) {
  if (fields.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        <FadersIcon size={14} />
        Customize
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 gap-0 p-1">
        {fields.map((field) => (
          <label
            key={field.key}
            className="flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-accent"
          >
            <Checkbox
              checked={field.checked}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
            {field.label}
          </label>
        ))}
      </PopoverContent>
    </Popover>
  );
}
