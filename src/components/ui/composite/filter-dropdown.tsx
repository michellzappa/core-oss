"use client";

import * as React from "react";
import { ChevronDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/navigation/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/navigation/command";

export interface FilterDropdownOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterDropdownProps {
  label: string;
  options: FilterDropdownOption[];
  value: string[]; // Selected values
  onChange: (values: string[]) => void;
  searchable?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export function FilterDropdown({
  label,
  options,
  value = [],
  onChange,
  searchable = true,
  placeholder,
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled = false,
}: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options;

    const needle = searchValue.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(needle) ||
        option.value.toLowerCase().includes(needle),
    );
  }, [options, searchValue]);

  // Handle checkbox toggle
  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    const allValues = filteredOptions.map((opt) => opt.value);
    const newValues = [...new Set([...value, ...allValues])];
    onChange(newValues);
  };

  // Handle clear all
  const handleClearAll = () => {
    const filteredValues = filteredOptions.map((opt) => opt.value);
    onChange(value.filter((v) => !filteredValues.includes(v)));
  };

  // Check if all filtered options are selected
  const allFilteredSelected = React.useMemo(() => {
    if (filteredOptions.length === 0) return false;
    return filteredOptions.every((opt) => value.includes(opt.value));
  }, [filteredOptions, value]);

  // Check if some filtered options are selected
  const someFilteredSelected = React.useMemo(() => {
    if (filteredOptions.length === 0) return false;
    return filteredOptions.some((opt) => value.includes(opt.value));
  }, [filteredOptions, value]);

  const selectedCount = value.length;
  const displayText = selectedCount === 0 ? placeholder || label : label;

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 items-center justify-between gap-2 rounded-md border border-[var(--border)] bg-white dark:bg-[#0f0f0f] px-3 py-2 text-sm shadow-sm",
            "ring-offset-background placeholder:text-[var(--text-muted)]",
            "focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "hover:bg-neutral-50 dark:hover:bg-[#1a1a1a] hover:text-[var(--foreground)]",
            selectedCount > 0 && "bg-[var(--accent)]",
            className,
          )}
        >
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm">{displayText}</span>
            {selectedCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full">
                {selectedCount}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 z-50 border-0 bg-white dark:bg-[#0f0f0f]"
        align="start"
        sideOffset={5}
        style={{
          maxHeight: "400px",
        }}
      >
        <Command
          className="bg-white dark:bg-[#0f0f0f] border-none"
          shouldFilter={false}
        >
          {searchable && (
            <div className="bg-white dark:bg-[#0f0f0f]">
              <CommandInput
                placeholder={searchPlaceholder}
                className="h-9"
                value={searchValue}
                onValueChange={setSearchValue}
              />
            </div>
          )}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-white dark:bg-[#0f0f0f]">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">
              {filteredOptions.length}{" "}
              {filteredOptions.length === 1 ? "option" : "options"}
            </span>
            <div className="flex gap-2">
              {filteredOptions.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs text-[var(--primary)] hover:underline"
                    disabled={allFilteredSelected}
                  >
                    Select All
                  </button>
                  {someFilteredSelected && (
                    <>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        •
                      </span>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:underline"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <CommandList className="max-h-[300px] overflow-auto">
            {filteredOptions.length === 0 ? (
              <CommandEmpty className="py-6 text-center text-sm text-[var(--muted-foreground)]">
                {emptyText}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleToggle(option.value)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 cursor-pointer",
                        !isSelected &&
                          "!bg-white dark:!bg-[#0f0f0f] hover:!bg-neutral-50 dark:hover:!bg-[#1a1a1a] focus:!bg-neutral-50 dark:focus:!bg-[#1a1a1a]",
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggle(option.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="pointer-events-none"
                      />
                      <span className="flex-1 text-sm">{option.label}</span>
                      {typeof option.count === "number" && (
                        <span className="text-xs text-[var(--muted-foreground)]">
                          ({option.count})
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
