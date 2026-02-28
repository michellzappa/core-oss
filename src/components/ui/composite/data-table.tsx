"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  MoreHorizontal,
  Edit,
  Trash2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/primitives/button";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/navigation/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives/select";
import { PageLoader } from "@/components/ui/primitives/page-loader";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import { ConfirmDialog } from "@/components/ui/navigation";
import {
  applyFilters,
  applyOrganizationFilters,
  applyContactFilters,
  applyOfferFilters,
  applyProjectFilters,
  applyServiceFilters,
} from "@/lib/utils/filter-utils";

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

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  cell: (item: T) => React.ReactNode;
  sortValue?: (item: T) => string | number | null;
  className?: string;
  width?: string;
}

export interface DataTableProps<T> {
  title?: string;
  subtitle?: React.ReactNode;
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  error?: string | null;
  createLink?: string;
  createButtonText?: string;
  emptyStateIcon: React.ReactNode;
  emptyStateTitle: string;
  emptyStateDescription: string;
  searchPlaceholder?: string;
  searchFields?: string[];
  // Optional controlled search query. If provided, the table becomes controlled for search.
  searchQuery?: string;
  onSearchQueryChange?: (value: string) => void;
  onRowClick?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  initialSortColumn?: string;
  initialSortDirection?: "asc" | "desc";
  actions?: React.ReactNode;
  onRefresh?: () => void | Promise<void>;
  hideTitle?: boolean;
  // Filter props
  filters?: Array<{
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
  }>;
  // Optional controlled filters
  filterValues?: FilterValue[];
  onFilterValuesChange?: (filters: FilterValue[]) => void;
  filterOptions?: Array<{ value: string; label: string }>;
  filterType?:
    | "generic"
    | "organization"
    | "lead"
    | "contact"
    | "offer"
    | "project"
    | "task"
    | "interaction"
    | "service"
    | "milestone";
}

export default function DataTable<
  T extends { id: string } & Record<string, unknown>,
>({
  title = "",
  subtitle,
  data,
  columns,
  isLoading = false,
  error = null,
  createLink,
  createButtonText = "Create New",
  emptyStateIcon,
  emptyStateTitle,
  emptyStateDescription,
  searchPlaceholder,
  searchFields = [],
  onRowClick,
  onEdit,
  onDelete,
  initialSortColumn = "created_at",
  initialSortDirection = "desc",
  actions,
  onRefresh,
  hideTitle = false,
  filters,
  filterType = "generic",
  searchQuery,
  onSearchQueryChange,
  filterValues,
  onFilterValuesChange,
}: DataTableProps<T>) {
  const [uncontrolledSearchTerm, setUncontrolledSearchTerm] = useState("");
  const isSearchControlled = typeof searchQuery === "string";
  const effectiveSearchTerm = isSearchControlled
    ? (searchQuery as string)
    : uncontrolledSearchTerm;
  const [sortColumn, setSortColumn] = useState<string>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
    initialSortDirection,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [optimisticallyDeletedIds, setOptimisticallyDeletedIds] = useState<
    Set<string>
  >(new Set());
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);
  const isFiltersControlled = Array.isArray(filterValues);
  const effectiveFilters = useMemo(
    () =>
      isFiltersControlled
        ? (filterValues as FilterValue[]) || []
        : activeFilters,
    [isFiltersControlled, filterValues, activeFilters],
  );
  const setFilters = (next: FilterValue[]) => {
    if (isFiltersControlled) onFilterValuesChange?.(next);
    else setActiveFilters(next);
  };
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<T | null>(null);

  // Filter data based on search query and filters
  const filteredData = useMemo(() => {
    let filtered = data.filter((item) => !optimisticallyDeletedIds.has(item.id));

    // Apply search filter
    if (effectiveSearchTerm) {
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const value = item[field];
          return (
            value &&
            value
              .toString()
              .toLowerCase()
              .includes(effectiveSearchTerm.toLowerCase())
          );
        }),
      );
    }

    // Apply additional filters
    if (effectiveFilters.length > 0) {
      switch (filterType) {
        case "organization":
          filtered = applyOrganizationFilters(filtered, effectiveFilters);
          break;
        case "contact":
          filtered = applyContactFilters(filtered, effectiveFilters);
          break;
        case "offer":
          filtered = applyOfferFilters(filtered, effectiveFilters);
          break;
        case "project":
          filtered = applyProjectFilters(filtered, effectiveFilters);
          break;
        case "service":
          filtered = applyServiceFilters(filtered, effectiveFilters);
          break;
        default:
          filtered = applyFilters(filtered, effectiveFilters);
      }
    }

    return filtered;
  }, [
    data,
    optimisticallyDeletedIds,
    effectiveSearchTerm,
    searchFields,
    effectiveFilters,
    filterType,
  ]);

  // Sort the filtered data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const column = columns.find((col) => col.key === sortColumn);
      let aValue, bValue;

      if (column?.sortValue) {
        aValue = column.sortValue(a);
        bValue = column.sortValue(b);
      } else {
        aValue = a[sortColumn];
        bValue = b[sortColumn];
      }

      // Handle null/undefined values
      if (aValue == null) return sortDirection === "asc" ? -1 : 1;
      if (bValue == null) return sortDirection === "asc" ? 1 : -1;

      // Compare values
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection, columns]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    if (isSearchControlled) {
      onSearchQueryChange?.(next);
    } else {
      setUncontrolledSearchTerm(next);
    }
  };

  const renderFilterInput = (
    filter: NonNullable<DataTableProps<T>["filters"]>[0],
  ) => {
    const currentValue =
      effectiveFilters.find((v) => v.key === filter.key)?.value || "";

    const handleFilterChange = (
      key: string,
      value: string | string[] | number | boolean,
    ) => {
      const newFilters = effectiveFilters.filter((f) => f.key !== key);

      if (value !== "" && value !== null && value !== undefined) {
        newFilters.push({
          key,
          value,
          operator: "equals",
        });
      }

      setFilters(newFilters);
    };

    switch (filter.type) {
      case "select":
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
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] bg-[var(--card)] text-[var(--foreground)]"
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
            className="w-full px-3 py-2 border border-[var(--border)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] bg-[var(--card)] text-[var(--foreground)]"
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

      case "checkboxes_exclude": {
        const excluded = Array.isArray(currentValue) ? currentValue : [];
        return (
          <fieldset className="flex flex-col gap-2 max-h-48 overflow-y-auto py-1 border-0 p-0 m-0 min-w-0">
            <legend className="sr-only">{filter.label}</legend>
            {filter.options?.map((option) => {
              const isChecked = !excluded.includes(option.value);
              return (
                <div
                  key={option.value}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[var(--accent)] rounded px-2 py-1.5 -mx-2"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? excluded.filter((v) => v !== option.value)
                        : [...excluded, option.value];
                      handleFilterChange(filter.key, next);
                    }}
                    aria-label={option.label}
                  />
                  <span className="truncate">{option.label}</span>
                </div>
              );
            })}
          </fieldset>
        );
      }

      default:
        return null;
    }
  };

  const handleDelete = async (item: T) => {
    if (!onDelete) return;
    setDeletingId(item.id);

    // Optimistically hide the item from local view.
    setOptimisticallyDeletedIds((prev) => new Set(prev).add(item.id));

    try {
      await onDelete(item);
      toast.success("Item deleted successfully");
    } catch (error) {
      // If deletion fails, restore the item in local view.
      setOptimisticallyDeletedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      toast.error("Failed to delete item");
      console.error("Error deleting item:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Add click outside listener
  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (
        openDropdown &&
        !(e.target as Element).closest(".dropdown-container")
      ) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openDropdown]);

  if (isLoading) {
    return <PageLoader variant="block" />;
  }

  return (
    <div className="space-y-6">
      {!hideTitle && title && (
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              {title}
            </h1>
            <div className="text-sm text-[var(--muted-foreground)] space-y-1">
              <p>
                {filteredData.length}{" "}
                {filteredData.length === 1 ? "item" : "items"}
              </p>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    setIsRefreshing(true);
                    await onRefresh();
                  } finally {
                    setIsRefreshing(false);
                  }
                }}
                disabled={isRefreshing}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {isRefreshing && <span className="ml-2 text-xs">Syncing…</span>}
              </Button>
            )}

            {actions ||
              (createLink && (
                <Link href={createLink}>
                  <Button className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>{createButtonText}</span>
                  </Button>
                </Link>
              ))}
          </div>
        </div>
      )}


      <div className="space-y-4">
        {/* Search and Filter Button Row */}
        <div className="flex items-center gap-3">
          {searchPlaceholder && (
            <div className="relative flex-1">
              <input
                type="text"
                value={effectiveSearchTerm}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="pl-10 pr-4 py-2 w-full border border-[var(--border)] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--ring)] bg-[var(--card)] text-[var(--foreground)]"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-[var(--muted-foreground)]" />

              {effectiveSearchTerm && (
                <button
                  type="button"
                  onClick={() =>
                    isSearchControlled
                      ? onSearchQueryChange?.("")
                      : setUncontrolledSearchTerm("")
                  }
                  className="absolute right-2 top-2 p-1 rounded-full bg-[var(--muted)] hover:bg-[var(--accent)]"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {filters && filters.length > 0 && (
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 h-9"
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFilters.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full">
                    {activeFilters.length}
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {effectiveFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {effectiveFilters
              .filter(
                (f) =>
                  !(
                    f.key === "show_closed" &&
                    (f.value === true || f.value === "true")
                  ),
              )
              .map((filter) => {
                const filterOption = filters?.find((f) => f.key === filter.key);
                const displayValue =
                  filter.key === "status_excluded" &&
                  Array.isArray(filter.value)
                    ? (filter.value as string[]).length === 0
                      ? "All"
                      : `Excluding ${(filter.value as string[]).join(", ")}`
                    : filter.key === "show_closed"
                      ? "No"
                      : Array.isArray(filter.value)
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
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const newFilters = effectiveFilters.filter(
                          (f) => f.key !== filter.key,
                        );
                        setFilters(newFilters);
                      }}
                      className="ml-1 hover:text-[var(--destructive)]"
                      aria-label={`Clear ${filterOption?.label ?? "filter"} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
          </div>
        )}

        {/* Filter Options */}
        {filtersOpen && filters && filters.length > 0 && (
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

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-950 dark:border-red-800 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {sortedData.length > 0 ? (
        <div className="bg-[var(--card)] shadow overflow-hidden sm:rounded-lg border border-[var(--border)]">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-[var(--muted)]">
                <tr>
                  {(onEdit || onDelete) && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider w-16"
                    ></th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={
                        column.sortable && sortColumn === column.key
                          ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                      className={`px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider ${
                        column.sortable ? "hover:bg-[var(--accent)]" : ""
                      } ${column.className || ""}`}
                      style={{ width: column.width }}
                    >
                      {column.sortable ? (
                        <button
                          type="button"
                          onClick={() => handleSort(column.key)}
                          className="inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] rounded"
                        >
                          <span>{column.header}</span>
                          <span className="inline-flex items-center">
                            {sortColumn === column.key ? (
                              sortDirection === "asc" ? (
                                <ArrowUp className="h-4 w-4 text-[var(--foreground)]" />
                              ) : (
                                <ArrowDown className="h-4 w-4 text-[var(--foreground)]" />
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 text-[var(--muted-foreground)]" />
                            )}
                          </span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{column.header}</span>
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[var(--card)] divide-y divide-[var(--border)]">
                {sortedData.map((item) => (
                  <tr
                    key={item.id}
                    className={`${
                      onRowClick
                        ? "cursor-pointer hover:bg-[var(--accent)] transition-colors duration-200"
                        : "hover:bg-[var(--accent)] transition-colors duration-200"
                    } bg-[var(--card)]`}
                    onClick={() => onRowClick?.(item)}
                    onKeyDown={(e) => {
                      if (!onRowClick) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(item);
                      }
                    }}
                    tabIndex={onRowClick ? 0 : undefined}
                    role={onRowClick ? "button" : undefined}
                  >
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                        <div className="relative dropdown-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Toggle dropdown for this specific item
                              setOpenDropdown(
                                openDropdown === item.id ? null : item.id,
                              );
                            }}
                            className="p-1 rounded hover:bg-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                            aria-label="Open row actions"
                          >
                            <MoreHorizontal className="h-4 w-4 text-[var(--muted-foreground)]" />
                          </button>

                          {openDropdown === item.id && (
                            <div className="absolute left-0 mt-1 w-32 bg-[var(--popover)] rounded-md shadow-lg border border-[var(--border)] z-50">
                              <div className="py-1">
                                {onEdit && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEdit(item);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-[var(--popover-foreground)] hover:bg-[var(--accent)] flex items-center"
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </button>
                                )}
                                {onDelete && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPendingDeleteItem(item);
                                      setOpenDropdown(null);
                                    }}
                                    disabled={deletingId === item.id}
                                    className="w-full text-left px-4 py-2 text-sm text-[var(--destructive)] hover:bg-[var(--accent)] flex items-center disabled:opacity-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)] ${
                          column.className || ""
                        }`}
                        style={{ width: column.width }}
                      >
                        {column.cell(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4">
            {emptyStateIcon}
          </div>
          <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">
            {emptyStateTitle}
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] mb-6">
            {emptyStateDescription}
          </p>
          {createLink && (
            <Link href={createLink}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {createButtonText}
              </Button>
            </Link>
          )}
        </div>
      )}
      <ConfirmDialog
        open={!!pendingDeleteItem}
        title="Delete item?"
        description="This will permanently delete this item. This action cannot be undone."
        confirmLabel="Delete"
        isDestructive
        onConfirm={
          pendingDeleteItem ? () => handleDelete(pendingDeleteItem) : () => {}
        }
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteItem(null);
          }
        }}
      />
    </div>
  );
}
