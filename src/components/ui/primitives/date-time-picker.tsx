"use client";

import * as React from "react";
import { CalendarIcon, Clock3 } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { Calendar } from "@/components/ui/primitives/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/navigation/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives/select";

type PickerMode = "date" | "datetime" | "time";

interface DateTimePickerProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  mode?: PickerMode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  stepMinutes?: number;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

function toDateFromValue(value: string, mode: PickerMode): Date | undefined {
  if (!value) return undefined;
  if (mode === "date") {
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return undefined;
    return new Date(y, m - 1, d);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function buildDateTimeString(date: Date, time: string): string {
  return `${formatDateString(date)}T${time}`;
}

function getTimePart(value: string): string {
  if (!value || !value.includes("T")) return "09:00";
  return value.split("T")[1]?.slice(0, 5) || "09:00";
}

function buildTimeOptions(stepMinutes: number): string[] {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += stepMinutes) {
      const hh = String(hour).padStart(2, "0");
      const mm = String(minute).padStart(2, "0");
      options.push(`${hh}:${mm}`);
    }
  }
  return options;
}

export function DateTimePicker({
  id,
  name,
  value,
  defaultValue = "",
  onValueChange,
  mode = "datetime",
  placeholder,
  disabled,
  className,
  stepMinutes = 15,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: DateTimePickerProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const currentValue = isControlled ? value ?? "" : internalValue;

  const setValue = React.useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  if (mode === "time") {
    const options = React.useMemo(() => buildTimeOptions(stepMinutes), [stepMinutes]);
    return (
      <div className={className}>
        <Select
          value={currentValue || undefined}
          onValueChange={setValue}
          disabled={disabled}
        >
          <SelectTrigger
            id={id}
            className="w-full"
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
          >
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder={placeholder ?? "Select time"} />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {options.map((time) => (
              <SelectItem key={time} value={time}>
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {name ? <input type="hidden" name={name} value={currentValue} /> : null}
      </div>
    );
  }

  const selectedDate = toDateFromValue(currentValue, mode);
  const buttonLabel = selectedDate
    ? mode === "date"
      ? format(selectedDate, "PPP")
      : format(selectedDate, "PPP p")
    : (placeholder ?? (mode === "date" ? "Pick a date" : "Pick date & time"));

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground",
            )}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {buttonLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-h-none p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return;
              if (mode === "date") {
                setValue(formatDateString(date));
                return;
              }
              const timePart = getTimePart(currentValue);
              setValue(buildDateTimeString(date, timePart));
            }}
            initialFocus
          />
          {mode === "datetime" ? (
            <div className="border-t p-3">
              <Input
                type="time"
                aria-invalid={ariaInvalid}
                aria-describedby={ariaDescribedBy}
                value={getTimePart(currentValue)}
                onChange={(event) => {
                  const baseDate = selectedDate ?? new Date();
                  setValue(buildDateTimeString(baseDate, event.target.value));
                }}
              />
            </div>
          ) : null}
        </PopoverContent>
      </Popover>
      {name ? <input type="hidden" name={name} value={currentValue} /> : null}
    </div>
  );
}
