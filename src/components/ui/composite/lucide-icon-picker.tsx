"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
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
import dynamicIconImports from "lucide-react/dynamicIconImports";

interface LucideIconPickerProps {
  value?: string | null;
  onChange: (iconName: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function LucideIconPicker({
  value,
  onChange,
  placeholder = "Select icon",
  disabled = false,
  className,
}: LucideIconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const allIconNames = React.useMemo<string[]>(() => {
    return Object.keys(dynamicIconImports as Record<string, unknown>).sort();
  }, []);

  const filtered = React.useMemo(() => {
    if (!searchValue) return allIconNames;
    const needle = searchValue.toLowerCase();
    return allIconNames.filter((name) => name.toLowerCase().includes(needle));
  }, [searchValue, allIconNames]);

  const SelectedIcon = React.useMemo(() => {
    if (!value) return null;
    type IconLoader = () => Promise<{
      default: React.ComponentType<{ className?: string }>;
    }>;
    const loader = (
      dynamicIconImports as Record<string, IconLoader | undefined>
    )[value];
    if (!loader) return null;
    return dynamic(loader, {
      ssr: false,
      loading: () => <span className="inline-block h-4 w-4" />,
    });
  }, [value]);

  return (
    <Popover
      open={open && !disabled}
      onOpenChange={(next) => {
        if (disabled) return;
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls="icon-picker-list"
          className={cn(
            getComboboxTriggerClasses(disabled),
            !value && "text-[var(--muted-foreground)]",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 text-sm">
            {SelectedIcon ? (
              React.createElement(
                SelectedIcon as React.ComponentType<{ className?: string }>,
                {
                  className: "h-4 w-4 shrink-0 text-[var(--muted-foreground)]",
                }
              )
            ) : (
              <Search className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
            )}
            <span className="truncate text-sm">{value || placeholder}</span>
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
            placeholder="Search icons..."
            className="h-9"
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList
            id="icon-picker-list"
            className="max-h-[220px] overflow-auto"
          >
            <CommandGroup className="bg-[var(--popover)]">
              {filtered.map((name) => (
                <CommandItem
                  key={name}
                  value={name}
                  onSelect={() => {
                    onChange(name);
                    setSearchValue("");
                    // Slight delay to avoid flicker on trigger content update
                    setTimeout(() => setOpen(false), 16);
                  }}
                  className="px-3 py-2 cursor-pointer text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="truncate">{name}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0 text-[var(--accent-foreground)]",
                      value === name ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default LucideIconPicker;
