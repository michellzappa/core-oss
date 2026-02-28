"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { getFieldIcon } from "@/lib/utils/field-icons";
import { getComboboxTriggerClasses } from "@/lib/utils/input-styles";
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

export interface ComboboxOption {
  value: string;
  label: string;
  searchTerms?: string[];
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  fieldName?: string; // Optional field name to determine icon
  // When value is set but not in options yet (e.g. loading), show this label instead of raw value
  valueLabel?: string;
  // When provided, a "Create" action will be shown when no results match.
  onCreate?: (searchValue: string) => void;
  createWhenEmpty?: boolean;
  createLabel?: string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled = false,
  // required = false,
  fieldName,
  valueLabel,
  onCreate,
  createWhenEmpty = false,
  createLabel = "+ Create",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const closeRef = React.useRef<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  // Get the appropriate icon for this field
  const FieldIcon = fieldName ? getFieldIcon(fieldName) : null;

  // Simple letter-by-letter filter on label/value and optional searchTerms
  const filteredOptions = React.useMemo(() => {
    // Deduplicate options by value to avoid duplicate keys
    const seen = new Set<string>();
    const deduplicatedOptions = options.filter((option) => {
      if (seen.has(option.value)) {
        return false;
      }
      seen.add(option.value);
      return true;
    });

    const validOptions = deduplicatedOptions.filter(
      (option) => option.value !== "__placeholder__" && option.value !== "",
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
  }, [options, searchValue]);

  const toTitleCase = React.useCallback((input: string) => {
    return input
      .trim()
      .split(/\s+/)
      .map((word) =>
        word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : "",
      )
      .join(" ");
  }, []);

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
    [disabled, open],
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
          aria-controls="combobox-list"
          className={cn(
            getComboboxTriggerClasses(disabled),
            !selectedOption && "text-[var(--muted-foreground)]",
            className,
          )}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 text-sm">
            {FieldIcon && (
              <FieldIcon className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
            )}
            <span className="truncate text-sm">
              {selectedOption
                ? selectedOption.label
                : value && value !== "__placeholder__"
                  ? (valueLabel ?? String(value))
                  : placeholder}
            </span>
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
            id="combobox-list"
            className="max-h-[200px] overflow-auto"
          >
            {filteredOptions.length === 0 ? (
              onCreate && createWhenEmpty && searchValue.trim() ? (
                <CommandGroup className="bg-[var(--popover)]">
                  <CommandItem
                    key="__create__"
                    value={createLabel}
                    onSelect={() => {
                      onCreate(searchValue);
                      setSearchValue("");
                      if (closeRef.current) {
                        window.clearTimeout(closeRef.current);
                        closeRef.current = null;
                      }
                      closeRef.current = window.setTimeout(() => {
                        setOpen(false);
                        closeRef.current = null;
                      }, 16);
                    }}
                    className="px-3 py-2 cursor-pointer text-sm hover:bg-accent focus:bg-accent"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {FieldIcon && (
                        <FieldIcon className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                      )}
                      <span className="truncate">
                        {createLabel} "{toTitleCase(searchValue)}"
                      </span>
                    </div>
                  </CommandItem>
                </CommandGroup>
              ) : (
                <div className="bg-[var(--popover)] py-6 text-center text-sm text-[var(--muted-foreground)]">
                  {emptyText}
                </div>
              )
            ) : (
              <CommandGroup className="bg-[var(--popover)]">
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
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
                    }}
                    className={cn(
                      "px-3 py-2 cursor-pointer text-sm",
                      value === option.value
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent focus:bg-accent",
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {FieldIcon && (
                        <FieldIcon className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0 text-[var(--accent-foreground)]",
                        value === option.value ? "opacity-100" : "opacity-0",
                      )}
                    />
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
