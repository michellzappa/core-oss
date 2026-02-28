"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { getFieldIcon } from "@/lib/utils/field-icons";
import { getComboboxTriggerClasses } from "@/lib/utils/input-styles";
import { Badge } from "@/components/ui/primitives/badge";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/navigation/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/navigation/popover";

export interface MultiComboboxOption {
  value: string;
  label: string;
  searchTerms?: string[];
}

interface MultiComboboxProps {
  options: MultiComboboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  fieldName?: string; // Optional field name to determine icon
  maxDisplayItems?: number; // Maximum number of items to display in trigger
}

export function MultiCombobox({
  options,
  value = [],
  onChange,
  placeholder = "Select options",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled = false,
  fieldName,
  maxDisplayItems = 3,
}: MultiComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const closeRef = React.useRef<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Get selected options
  const selectedOptions = React.useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value]
  );

  // Get the appropriate icon for this field
  const FieldIcon = fieldName ? getFieldIcon(fieldName) : null;

  // Filter out already selected options
  const availableOptions = React.useMemo(() => {
    return options.filter((option) => !value.includes(option.value));
  }, [options, value]);

  // Simple letter-by-letter filter on label/value and optional searchTerms
  const filteredOptions = React.useMemo(() => {
    const validOptions = availableOptions.filter(
      (option) => option.value !== "__placeholder__" && option.value !== ""
    );

    if (!searchValue) return validOptions;

    const needle = searchValue.toLowerCase();

    return validOptions.filter((option) => {
      const label = (option.label || "").toLowerCase();
      const valueStr = String(option.value || "").toLowerCase();
      const terms = (option.searchTerms || [])
        .filter(Boolean)
        .map((t) => String(t).toLowerCase());

      return (
        label.includes(needle) ||
        valueStr.includes(needle) ||
        terms.some((t) => t.includes(needle))
      );
    });
  }, [availableOptions, searchValue]);

  // Handle keyboard events for select-to-search
  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      // Allow direct typing when focused (letters, numbers, symbols)
      const isTypableKey =
        event.key.length === 1 ||
        event.key === "Backspace" ||
        event.key === "Delete";

      if (isTypableKey && !open) {
        event.preventDefault();
        setOpen(true);

        // Set the search value after the popover opens and input is focused
        const firstChar =
          event.key === "Backspace" || event.key === "Delete" ? "" : event.key;
        setTimeout(() => {
          inputRef.current?.focus();
          setSearchValue(firstChar);
        }, 0);
        return;
      }

      // Handle arrow keys to open/close
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (!open) {
          event.preventDefault();
          setOpen(true);
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
        }
        return;
      }

      // Handle Enter to open if closed
      if (event.key === "Enter" && !open) {
        event.preventDefault();
        setOpen(true);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
        return;
      }

      // Handle Escape to close
      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
        setSearchValue("");
        triggerRef.current?.focus();
        return;
      }
    },
    [disabled, open]
  );

  // Focus the search input when popover opens
  React.useEffect(() => {
    if (open && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Handle adding an option
  const handleAddOption = (optionValue: string) => {
    if (!value.includes(optionValue)) {
      onChange([...value, optionValue]);
    }
    setSearchValue("");
    // Cancel any pending close timers
    if (closeRef.current) {
      window.clearTimeout(closeRef.current);
      closeRef.current = null;
    }
    // Close after paint to avoid trigger content disappearing
    closeRef.current = window.setTimeout(() => {
      setOpen(false);
      closeRef.current = null;
    }, 16);
  };

  // Handle removing an option
  const handleRemoveOption = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  // Get display text for trigger
  const getTriggerText = () => {
    if (selectedOptions.length === 0) {
      return placeholder;
    }
    if (selectedOptions.length <= maxDisplayItems) {
      return `${selectedOptions.length} selected`;
    }
    return `${selectedOptions.length} selected`;
  };

  return (
    <Popover
      open={open && !disabled}
      onOpenChange={(newOpen) => {
        if (disabled) return;
        setOpen(newOpen);
        if (!newOpen) {
          setSearchValue("");
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls="multi-combobox-list"
          className={cn(
            getComboboxTriggerClasses(disabled),
            selectedOptions.length === 0 && "text-[var(--muted-foreground)]",
            className
          )}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 text-sm">
            {FieldIcon && (
              <FieldIcon className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
            )}
            <div className="flex flex-wrap gap-1 min-w-0 flex-1">
              {selectedOptions.length > 0 ? (
                <>
                  {selectedOptions.slice(0, maxDisplayItems).map((option) => (
                    <Badge
                      key={option.value}
                      variant="secondary"
                      className="flex items-center gap-1 text-xs"
                    >
                      <span className="truncate max-w-20">{option.label}</span>
                      {!disabled && (
                        <span
                          className="h-3 w-3 p-0 hover:bg-transparent flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveOption(option.value);
                          }}
                        >
                          <X className="h-2 w-2" />
                        </span>
                      )}
                    </Badge>
                  ))}
                  {selectedOptions.length > maxDisplayItems && (
                    <Badge variant="secondary" className="text-xs">
                      +{selectedOptions.length - maxDisplayItems} more
                    </Badge>
                  )}
                </>
              ) : (
                <span className="truncate">{getTriggerText()}</span>
              )}
            </div>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-0 z-50 backdrop-blur-none border border-[var(--border)] bg-[var(--popover)]"
        align="start"
        sideOffset={5}
        style={{
          width: "var(--radix-popover-trigger-width)",
          maxHeight: "300px",
          backdropFilter: "none",
          WebkitBackdropFilter: "none",
        }}
      >
        <Command
          className="bg-[var(--popover)] border-none"
          shouldFilter={false}
        >
          <CommandInput
            ref={inputRef}
            placeholder={searchPlaceholder}
            className="h-9"
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList
            id="multi-combobox-list"
            className="max-h-[200px] overflow-auto"
          >
            {filteredOptions.length === 0 ? (
              <div className="bg-[var(--popover)] py-6 text-center text-sm text-[var(--muted-foreground)]">
                {emptyText}
              </div>
            ) : (
              <CommandGroup className="bg-[var(--popover)]">
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleAddOption(option.value)}
                    className={cn(
                      "px-3 py-2 cursor-pointer text-sm",
                      "hover:bg-accent focus:bg-accent"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {FieldIcon && (
                        <FieldIcon className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>
                    <Check className="ml-auto h-4 w-4 shrink-0 text-[var(--accent-foreground)] opacity-0" />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
