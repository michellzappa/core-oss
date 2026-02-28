"use client";

import { type ReactNode, useMemo } from "react";
import { ChevronsUpDown, LayoutGrid, Table } from "lucide-react";
import { Button } from "../primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "../navigation/dropdown-menu";

interface KanbanOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface ViewToggleProps {
  activeView: "table" | "kanban";
  onViewChange: (view: "table" | "kanban") => void;
  className?: string;
  activeKanbanOption?: string;
  kanbanOptions?: KanbanOption[];
  onKanbanOptionSelect?: (value: string) => void;
}

export function ViewToggle({
  activeView,
  onViewChange,
  className,
  activeKanbanOption,
  kanbanOptions,
  onKanbanOptionSelect,
}: ViewToggleProps) {
  const hasKanbanOptions = useMemo(
    () => Boolean(kanbanOptions && kanbanOptions.length > 0),
    [kanbanOptions]
  );

  const resolvedActiveKanbanValue = useMemo(() => {
    if (!hasKanbanOptions || !kanbanOptions) return undefined;
    const current = kanbanOptions.find((option) => option.value === activeKanbanOption);
    if (current) return current.value;
    return kanbanOptions[0]?.value;
  }, [activeKanbanOption, hasKanbanOptions, kanbanOptions]);

  const activeKanbanLabel = useMemo(() => {
    if (!hasKanbanOptions || !kanbanOptions || !resolvedActiveKanbanValue) {
      return undefined;
    }
    return (
      kanbanOptions.find((option) => option.value === resolvedActiveKanbanValue)?.label ||
      kanbanOptions[0]?.label
    );
  }, [hasKanbanOptions, kanbanOptions, resolvedActiveKanbanValue]);

  const handleKanbanSelection = (value: string) => {
    onViewChange("kanban");
    if (onKanbanOptionSelect && value !== activeKanbanOption) {
      onKanbanOptionSelect(value);
    } else if (onKanbanOptionSelect && !activeKanbanOption) {
      onKanbanOptionSelect(value);
    }
  };

  const kanbanButtonContent = (
    <Button
      type="button"
      variant={activeView === "kanban" ? "default" : "ghost"}
      size="sm"
      onClick={() => onViewChange("kanban")}
      className="flex items-center gap-2"
      aria-label={
        activeKanbanLabel
          ? `View as Kanban (${activeKanbanLabel})`
          : "View as Kanban"
      }
    >
      <LayoutGrid className="h-4 w-4" />
      <span className="hidden sm:inline">
        {activeKanbanLabel && activeView === "kanban"
          ? `Kanban (${activeKanbanLabel})`
          : "Kanban"}
      </span>
      {hasKanbanOptions && activeView === "kanban" && (
        <ChevronsUpDown className="h-3.5 w-3.5 opacity-70" />
      )}
    </Button>
  );

  return (
    <div
      className={`flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg ${className}`}
    >
      {hasKanbanOptions && activeView === "kanban" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {kanbanButtonContent}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="start">
            <DropdownMenuLabel>Kanban mode</DropdownMenuLabel>
            {kanbanOptions && (
              <DropdownMenuRadioGroup
                value={resolvedActiveKanbanValue ?? ""}
                onValueChange={handleKanbanSelection}
              >
                {kanbanOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                    className="flex items-center gap-2"
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        kanbanButtonContent
      )}
      <Button
        type="button"
        variant={activeView === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewChange("table")}
        className="flex items-center gap-2"
        aria-label="View as table"
      >
        <Table className="h-4 w-4" />
        <span className="hidden sm:inline">Table</span>
      </Button>
    </div>
  );
}
