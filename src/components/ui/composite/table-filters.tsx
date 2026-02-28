"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { Combobox } from "@/components/ui/navigation/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives/select";
import { industries } from "@/lib/industries";
import { countries } from "@/lib/countries";
import {
  PROJECT_STATUS_OPTIONS,
  OFFER_STATUS_OPTIONS,
  SERVICE_GROUP_OPTIONS,
} from "@/lib/data/filter-options";

export interface FilterOption {
  key: string;
  label: string;
  type:
    | "select"
    | "combobox"
    | "text"
    | "number"
    | "boolean"
    | "checkboxes_exclude";
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  multiple?: boolean;
}

export interface FilterValue {
  key: string;
  value: string | string[] | number | boolean;
  operator?:
    | "equals"
    | "contains"
    | "starts_with"
    | "ends_with"
    | "greater_than"
    | "less_than"
    | "in"
    | "not_in";
}

export interface TableFiltersProps {
  filters: FilterOption[];
  values: FilterValue[];
  onChange: (filters: FilterValue[]) => void;
  className?: string;
  compact?: boolean;
}

export default function TableFilters({
  filters,
  values,
  onChange,
  className = "",
  compact = false,
}: TableFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = values.length;

  const handleFilterChange = (
    key: string,
    value: string | string[] | number | boolean,
    operator?: string,
  ) => {
    const newFilters = values.filter((f) => f.key !== key);

    if (value !== "" && value !== null && value !== undefined) {
      newFilters.push({
        key,
        value,
        operator: (operator as FilterValue["operator"]) || "equals",
      });
    }

    onChange(newFilters);
  };

  const clearAllFilters = () => {
    onChange([]);
  };

  const clearFilter = (key: string) => {
    onChange(values.filter((f) => f.key !== key));
  };

  const renderFilterInput = (filter: FilterOption) => {
    const currentValue = values.find((v) => v.key === filter.key)?.value || "";

    switch (filter.type) {
      case "select":
        if (filter.multiple) {
          // For multiple selection, we'll use a simple text input with comma separation
          // This is a simplified approach - in a production app you might want a more sophisticated multi-select
          const currentArray = Array.isArray(currentValue) ? currentValue : [];
          const displayValue = currentArray.join(", ");

          return (
            <input
              type="text"
              value={displayValue}
              onChange={(e) => {
                const values = e.target.value
                  .split(",")
                  .map((v) => v.trim())
                  .filter((v) => v);
                handleFilterChange(filter.key, values, "in");
              }}
              placeholder={
                filter.placeholder || `Enter ${filter.label} (comma separated)`
              }
              className="w-full px-3 py-2 border border-[var(--border)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] bg-white dark:bg-neutral-800 text-[var(--foreground)]"
            />
          );
        }

        return (
          <Select
            value={String(currentValue)}
            onValueChange={(value) => handleFilterChange(filter.key, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={filter.placeholder || `Select ${filter.label}`}
              />
            </SelectTrigger>
            <SelectContent>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "combobox":
        return (
          <Combobox
            options={filter.options || []}
            value={String(currentValue)}
            onChange={(value) => handleFilterChange(filter.key, value)}
            placeholder={filter.placeholder || `Search ${filter.label}`}
            searchPlaceholder={`Search ${filter.label}...`}
            className="w-full"
          />
        );

      case "text":
        return (
          <input
            type="text"
            value={String(currentValue)}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] bg-white dark:bg-neutral-800 text-[var(--foreground)]"
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={String(currentValue)}
            onChange={(e) =>
              handleFilterChange(filter.key, e.target.valueAsNumber || 0)
            }
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] bg-white dark:bg-neutral-800 text-[var(--foreground)]"
          />
        );

      case "boolean":
        return (
          <Select
            value={String(currentValue)}
            onValueChange={(value) =>
              handleFilterChange(filter.key, value === "true")
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={filter.placeholder || `Select ${filter.label}`}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${compact ? "" : "space-y-4"} ${className}`}>
      {/* Filter Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 ${compact ? "h-9" : ""}`}
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-xs bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {values.map((filter) => {
            const filterOption = filters.find((f) => f.key === filter.key);
            const displayValue = Array.isArray(filter.value)
              ? filter.value.join(", ")
              : String(filter.value);

            return (
              <div
                key={filter.key}
                className="flex items-center gap-1 px-2 py-1 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-md text-sm"
              >
                <span className="font-medium">{filterOption?.label}:</span>
                <span>{displayValue}</span>
                <button
                  onClick={() => clearFilter(filter.key)}
                  className="ml-1 hover:text-[var(--destructive)]"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Clear All Button */}
      {activeFiltersCount > 0 && !compact && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Controls */}
      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border border-[var(--border)] rounded-lg bg-[var(--card)]">
          {filters.map((filter) => (
            <div key={filter.key} className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">
                {filter.label}
              </label>
              {renderFilterInput(filter)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Predefined filter configurations for common entities
export const getOrganizationFilters = (): FilterOption[] => [
  {
    key: "industry",
    label: "Industry",
    type: "select",
    options: industries.map((industry) => ({
      value: industry.id,
      label: industry.name,
    })),
    placeholder: "Select industry",
  },
  {
    key: "country",
    label: "Country",
    type: "select",
    options: countries.map((country) => ({
      value: country.code,
      label: country.name,
    })),
    placeholder: "Select country",
  },
  {
    key: "is_agency",
    label: "Is Agency",
    type: "boolean",
    placeholder: "Select agency status",
  },
];

/** Delimiter for encoding excluded statuses in URL (e.g. f_status_excluded=Closed Lost|Rapport) */
export const STATUS_EXCLUDED_DELIMITER = "|";

export const getContactFilters = (dynamicOptions?: {
  organizations?: Array<{ value: string; label: string }>;
}): FilterOption[] => [
  {
    key: "organization_id",
    label: "Organization",
    type: "combobox",
    options: dynamicOptions?.organizations || [],
    placeholder: "Search organization",
  },
  {
    key: "country",
    label: "Country",
    type: "select",
    options: countries.map((country) => ({
      value: country.code,
      label: country.name,
    })),
    placeholder: "Select country",
  },
  {
    key: "futurist",
    label: "Futurist",
    type: "boolean",
  },
  {
    key: "corporate",
    label: "Corporate",
    type: "boolean",
  },
  {
    key: "academic",
    label: "Academic",
    type: "boolean",
  },
  {
    key: "independent",
    label: "Independent",
    type: "boolean",
  },
  {
    key: "government",
    label: "Government",
    type: "boolean",
  },
  {
    key: "ngo",
    label: "NGO",
    type: "boolean",
  },
  {
    key: "media",
    label: "Media",
    type: "boolean",
  },
  {
    key: "intelligence",
    label: "Intelligence",
    type: "boolean",
  },
];

export const getOfferFilters = (dynamicOptions?: {
  currencies?: Array<{ value: string; label: string }>;
}): FilterOption[] => [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: OFFER_STATUS_OPTIONS,
    placeholder: "Select status",
  },
  {
    key: "currency",
    label: "Currency",
    type: "select",
    options: dynamicOptions?.currencies || [
      { value: "EUR", label: "EUR (€)" },
      { value: "USD", label: "USD ($)" },
      { value: "GBP", label: "GBP (£)" },
    ],
    placeholder: "Select currency",
  },
];

export const getProjectFilters = (dynamicOptions?: {
  organizations?: Array<{ value: string; label: string }>;
}): FilterOption[] => [
  {
    key: "status",
    label: "Status",
    type: "select",
    options: PROJECT_STATUS_OPTIONS,
    placeholder: "Select status",
  },
  {
    key: "organization_id",
    label: "Organization",
    type: "combobox",
    options: dynamicOptions?.organizations || [],
    placeholder: "Search organization",
  },
];

export const getServiceFilters = (): FilterOption[] => [
  {
    key: "group_type",
    label: "Group",
    type: "select",
    options: SERVICE_GROUP_OPTIONS,
    placeholder: "Select group",
  },
];

