import { useState, useEffect } from "react";
import { getCurrencyOptions, getOrganizationOptions, getContactOptions, getProjectOptions } from "@/lib/data/filter-options";

// Check if we're on the client side
const isClient = typeof window !== 'undefined';

export interface FilterOptions {
  currencies: Array<{ value: string; label: string }>;
  organizations: Array<{ value: string; label: string }>;
  contacts: Array<{ value: string; label: string }>;
  projects: Array<{ value: string; label: string }>;
}

export function useFilterOptions() {
  const [options, setOptions] = useState<FilterOptions>({
    currencies: [],
    organizations: [],
    contacts: [],
    projects: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client side
    if (!isClient) return;

    async function loadOptions() {
      try {
        setLoading(true);
        setError(null);

        const [
          currencies,
          organizations,
          contacts,
          projects,
        ] = await Promise.all([
          getCurrencyOptions(),
          getOrganizationOptions(),
          getContactOptions(),
          getProjectOptions(),
        ]);

        setOptions({
          currencies,
          organizations,
          contacts,
          projects,
        });
      } catch (err) {
        console.error("Error loading filter options:", err);
        setError("Failed to load filter options");
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, []);

  return {
    options,
    loading: isClient ? loading : false,
    error: isClient ? error : null
  };
}
