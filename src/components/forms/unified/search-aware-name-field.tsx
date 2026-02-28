"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/primitives/input";
import { Alert, AlertDescription } from "@/components/ui/primitives/alert";
import { fetcher } from "@/lib/fetchers";
import { getInputClasses } from "@/lib/utils/input-styles";

interface SearchAwareNameFieldProps {
  form: UseFormReturn<Record<string, unknown>>;
  fieldName: string;
  placeholder: string;
  entityType: "contact" | "organization";
  disabled?: boolean;
  mode?: "create" | "edit";
}

interface SearchResult {
  id: string;
  name: string;
  email?: string;
  company_role?: string;
  legal_name?: string;
  country?: string;
}

export default function SearchAwareNameField({
  form,
  fieldName,
  placeholder,
  entityType,
  disabled,
  mode = "create",
}: SearchAwareNameFieldProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const value = String((form.watch(fieldName) as string) || "");

  // Memoized search function to prevent recreation on every render
  const searchForDuplicates = useCallback(
    async (searchValue: string) => {
      if (!searchValue || searchValue.length < 2) {
        setSearchResults([]);
        setShowWarning(false);
        return;
      }

      setIsSearching(true);
      try {
        const endpoint =
          entityType === "contact" ? "/api/contacts" : "/api/organizations";
        const results = await fetcher(endpoint);

        // Filter results that match the current input
        const matches = (results as SearchResult[]).filter(
          (item) =>
            item.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            (entityType === "contact" &&
              item.email?.toLowerCase().includes(searchValue.toLowerCase()))
        );

        setSearchResults(matches);
        setShowWarning(matches.length > 0);
      } catch (error) {
        console.error("Error searching for duplicates:", error);
        setSearchResults([]);
        setShowWarning(false);
      } finally {
        setIsSearching(false);
      }
    },
    [entityType]
  );

  // Only search on create pages, not edit pages
  useEffect(() => {
    if (mode === "edit") {
      setSearchResults([]);
      setShowWarning(false);
      return;
    }

    // Debounce the search
    const timeoutId = setTimeout(() => {
      searchForDuplicates(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, mode, searchForDuplicates]);

  // Memoized change handler
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      form.setValue(fieldName, newValue);
    },
    [form, fieldName]
  );

  // Memoized warning content
  const warningContent = useMemo(() => {
    if (mode !== "create" || !showWarning || searchResults.length === 0) {
      return null;
    }

    return (
      <Alert className="border-muted-foreground/30 bg-muted/10">
        <AlertDescription className="text-muted-foreground">
          <div className="font-medium mb-1">
            Found {searchResults.length} existing{" "}
            {entityType === "contact" ? "contact(s)" : "organization(s)"} with
            similar names:
          </div>
          <div className="space-y-1 text-sm">
            {searchResults.slice(0, 3).map((result) => (
              <div key={result.id} className="flex items-center gap-2">
                <span className="font-medium">{result.name}</span>
                {entityType === "contact" && result.email && (
                  <span className="text-muted-foreground">
                    ({result.email})
                  </span>
                )}
                {entityType === "organization" && result.legal_name && (
                  <span className="text-muted-foreground">
                    ({result.legal_name})
                  </span>
                )}
              </div>
            ))}
            {searchResults.length > 3 && (
              <div className="text-muted-foreground">
                ... and {searchResults.length - 3} more
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }, [mode, showWarning, searchResults, entityType]);

  return (
    <div className="space-y-2">
      <Input
        id={fieldName}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={getInputClasses(disabled, false)}
      />

      {mode === "create" && isSearching && (
        <div className="text-sm text-muted-foreground">
          Searching for existing entries...
        </div>
      )}

      {warningContent}
    </div>
  );
}
