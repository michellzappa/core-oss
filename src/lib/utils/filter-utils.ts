import { FilterValue } from "@/components/ui/composite/table-filters";

export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterValue[]
): T[] {
  if (!filters.length) return data;

  return data.filter((item) => {
    return filters.every((filter) => {
      const value = item[filter.key];
      const filterValue = filter.value;
      const operator = filter.operator || "equals";

      // Handle null/undefined values
      if (value == null) {
        return operator === "equals" && filterValue === null;
      }

      // Handle different data types
      switch (operator) {
        case "equals":
          return String(value).toLowerCase() === String(filterValue).toLowerCase();

        case "contains":
          return String(value).toLowerCase().includes(String(filterValue).toLowerCase());

        case "starts_with":
          return String(value).toLowerCase().startsWith(String(filterValue).toLowerCase());

        case "ends_with":
          return String(value).toLowerCase().endsWith(String(filterValue).toLowerCase());

        case "greater_than":
          const numValue = typeof value === "number" ? value : parseFloat(String(value));
          const numFilterValue = typeof filterValue === "number" ? filterValue : parseFloat(String(filterValue));
          return !isNaN(numValue) && !isNaN(numFilterValue) && numValue > numFilterValue;

        case "less_than":
          const numValue2 = typeof value === "number" ? value : parseFloat(String(value));
          const numFilterValue2 = typeof filterValue === "number" ? filterValue : parseFloat(String(filterValue));
          return !isNaN(numValue2) && !isNaN(numFilterValue2) && numValue2 < numFilterValue2;

        case "in":
          if (Array.isArray(filterValue)) {
            return filterValue.includes(String(value));
          }
          return String(value) === String(filterValue);

        case "not_in":
          if (Array.isArray(filterValue)) {
            return !filterValue.includes(String(value));
          }
          return String(value) !== String(filterValue);

        default:
          return String(value).toLowerCase() === String(filterValue).toLowerCase();
      }
    });
  });
}

// Specialized filter functions for specific entity types
export function applyOrganizationFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterValue[]
): T[] {
  return data.filter((item) => {
    return filters.every((filter) => {
      const value = item[filter.key];
      const filterValue = filter.value;

      switch (filter.key) {
        case "industry":
          return value === filterValue;

        case "country":
          return value === filterValue;

        case "is_agency":
          return value === filterValue;

        default:
          return true;
      }
    });
  });
}

export function applyContactFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterValue[]
): T[] {
  return data.filter((item) => {
    return filters.every((filter) => {
      const value = item[filter.key];
      const filterValue = filter.value;

      switch (filter.key) {
        case "organization_id":
          return value === filterValue;

        case "country":
          return value === filterValue;

        default:
          return true;
      }
    });
  });
}

export function applyOfferFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterValue[]
): T[] {
  return data.filter((item) => {
    return filters.every((filter) => {
      const value = item[filter.key];
      const filterValue = filter.value;

      switch (filter.key) {
        case "status":
          return value === filterValue;

        case "currency":
          return value === filterValue;

        default:
          return true;
      }
    });
  });
}

export function applyProjectFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterValue[]
): T[] {
  return data.filter((item) => {
    return filters.every((filter) => {
      const value = item[filter.key];
      const filterValue = filter.value;

      switch (filter.key) {
        case "status":
          return value === filterValue;

        case "organization_id":
          return value === filterValue;

        default:
          return true;
      }
    });
  });
}

export function applyServiceFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterValue[]
): T[] {
  return data.filter((item) => {
    return filters.every((filter) => {
      const value = item[filter.key];
      const filterValue = filter.value;

      switch (filter.key) {
        case "group_type":
          return value === filterValue;

        case "is_public":
          return value === filterValue;

        default:
          return true;
      }
    });
  });
}
