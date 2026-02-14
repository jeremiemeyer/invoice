"use client";

import {
  CalendarBlank as CalendarBlankIcon,
  CaretDown as CaretDownIcon,
} from "@phosphor-icons/react";
import { addDays, addMonths, format, parseISO } from "date-fns";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Format date as YYYY-MM-DD in local timezone (not UTC)
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Parse date string as local time (not UTC)
function parseDateString(value: string): Date | undefined {
  if (!value) return undefined;
  // parseISO treats the string as local time when no timezone is specified
  return parseISO(value);
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  presets?: Array<{ label: string; days?: number; months?: number }>;
  /** Reference date for calculating presets (e.g., issue date for due date presets) */
  presetsRelativeTo?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  presets,
  presetsRelativeTo,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const date = parseDateString(value);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(formatDateString(selectedDate));
      setOpen(false);
    }
  };

  const handlePreset = (preset: { days?: number; months?: number }) => {
    const baseDate = presetsRelativeTo
      ? parseDateString(presetsRelativeTo)
      : new Date();
    if (!baseDate) return;
    baseDate.setHours(12, 0, 0, 0); // Set to noon to avoid DST issues
    let newDate = baseDate;
    if (preset.days) {
      newDate = addDays(baseDate, preset.days);
    } else if (preset.months) {
      newDate = addMonths(baseDate, preset.months);
    }
    onChange(formatDateString(newDate));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "group flex h-[54px] w-full items-center justify-between border-b border-black/10 transition-colors",
          "focus-within:border-blue-600 hover:border-black/20",
          "data-popup-open:border-blue-600",
          className,
        )}
      >
        <span className="text-sm">
          {date ? (
            format(date, "PPP")
          ) : (
            <span className="text-black/30">{placeholder}</span>
          )}
        </span>
        <CalendarBlankIcon size={16} className="text-black/40" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        {presets && presets.length > 0 && (
          <div className="flex gap-1 border-b border-black/10 p-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePreset(preset)}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-black/60 transition-colors hover:bg-black/5 hover:text-black"
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  );
}

// Inline variant that looks like InlineField
interface InlineDatePickerProps extends DatePickerProps {
  label: string;
}

export function InlineDatePicker({
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  presets,
  presetsRelativeTo,
}: InlineDatePickerProps) {
  const [open, setOpen] = useState(false);
  const date = parseDateString(value);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(formatDateString(selectedDate));
      setOpen(false);
    }
  };

  const handlePreset = (preset: { days?: number; months?: number }) => {
    const baseDate = presetsRelativeTo
      ? parseDateString(presetsRelativeTo)
      : new Date();
    if (!baseDate) return;
    baseDate.setHours(12, 0, 0, 0); // Set to noon to avoid DST issues
    let newDate = baseDate;
    if (preset.days) {
      newDate = addDays(baseDate, preset.days);
    } else if (preset.months) {
      newDate = addMonths(baseDate, preset.months);
    }
    onChange(formatDateString(newDate));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "group flex h-[54px] w-full items-center justify-between border-b border-black/10 transition-colors",
          "hover:border-black/20",
          "data-popup-open:border-blue-600",
          className,
        )}
      >
        <span className="mr-3 shrink-0 whitespace-nowrap text-sm font-medium">
          {label}
        </span>
        <span className="flex items-center gap-2 text-sm">
          {date ? (
            format(date, "PPP")
          ) : (
            <span className="text-black/30">{placeholder}</span>
          )}
          <CaretDownIcon
            size={16}
            className="text-black/40 group-data-popup-open:rotate-180 transition-transform duration-100"
          />
        </span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        {presets && presets.length > 0 && (
          <div className="flex gap-1 border-b border-black/10 p-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePreset(preset)}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-black/60 transition-colors hover:bg-black/5 hover:text-black"
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  );
}
