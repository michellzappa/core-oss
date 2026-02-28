"use client";

import { useMemo, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import useSWR from "swr";
import { Combobox } from "@/components/ui/navigation/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/navigation/dialog";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";
import { fetcher } from "@/lib/fetchers";

interface OrganizationFieldProps {
  form: UseFormReturn<Record<string, unknown>>;
  disabled?: boolean;
}

interface Organization {
  id: string;
  name: string;
}

export default function OrganizationField({
  form,
  disabled,
}: OrganizationFieldProps) {
  const [localOrganizations, setLocalOrganizations] = useState<Organization[]>(
    [],
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const toTitleCase = (input: string) =>
    input
      .trim()
      .split(/\s+/)
      .map((word) =>
        word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : "",
      )
      .join(" ");

  // Watch for changes in organization_options and organization_id
  const organizationOptions = form.watch("organization_options") as
    | Array<{ id: string; name: string }>
    | undefined;
  const value = String((form.watch("organization_id") as string) || "");

  const shouldUseProvided =
    Array.isArray(organizationOptions) && organizationOptions.length > 0;
  const currentInOptions = shouldUseProvided
    ? organizationOptions.some((opt) => opt.id === value)
    : false;

  const { data: fetchedOrganizations, isLoading } = useSWR<Organization[]>(
    shouldUseProvided ? null : "/api/organizations",
    fetcher,
  );
  const { data: currentOrganization } = useSWR<{
    id: string;
    name?: string;
    legal_name?: string;
  }>(
    shouldUseProvided && value && !currentInOptions
      ? `/api/organizations/${value}`
      : null,
    fetcher,
  );

  const organizations = useMemo(() => {
    const base: Organization[] = shouldUseProvided
      ? organizationOptions
      : (fetchedOrganizations || []);
    const maybeCurrent =
      shouldUseProvided && currentOrganization
        ? [
            {
              id: currentOrganization.id,
              name:
                currentOrganization.name ||
                currentOrganization.legal_name ||
                "Unknown",
            },
          ]
        : [];
    return [...base, ...maybeCurrent, ...localOrganizations];
  }, [
    shouldUseProvided,
    organizationOptions,
    fetchedOrganizations,
    currentOrganization,
    localOrganizations,
  ]);

  const handleSubmitCreate = async () => {
    const trimmed = newOrgName.trim();
    if (trimmed.length < 2) {
      setCreateError("Name must be at least 2 characters");
      return;
    }

    // Smart identifier: extract trailing two-letter code as country
    let finalName = trimmed;
    let countryCode: string | undefined;
    const m = trimmed.match(/^(.*?)[\s]+([A-Za-z]{2})$/);
    if (m) {
      finalName = m[1].trim();
      countryCode = m[2].toUpperCase();
    }

    setIsCreating(true);
    setCreateError(null);
    try {
      const payload: Record<string, unknown> = { name: finalName };
      if (countryCode) payload.country = countryCode;

      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({} as any));
        throw new Error(err?.error || "Failed to create organization");
      }
      const created: Organization = await res.json();
      setLocalOrganizations((prev) => [...prev, created]);
      form.setValue("organization_id", created.id);
      setIsCreateOpen(false);
      setNewOrgName("");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setIsCreating(false);
    }
  };

  // Deduplicate organizations by id to avoid duplicate keys
  const uniqueOrganizations = Array.from(
    new Map(organizations.map((o) => [o.id, o])).values(),
  );

  const orgOptions = uniqueOrganizations.map((o) => ({
    id: o.id,
    name: o.name,
  }));

  // Add create option at the bottom
  const optionsWithCreate = [
    ...orgOptions.map((o) => ({ value: o.id, label: o.name })),
    { value: "__create_organization__", label: "+ Create Organization" },
  ];

  const handleChange = (v: string) => {
    if (v === "__create_organization__") {
      setCreateError(null);
      setNewOrgName("");
      setIsCreateOpen(true);
    } else {
      form.setValue("organization_id", v);
    }
  };

  return (
    <>
      <Combobox
        options={optionsWithCreate}
        value={value}
        onChange={handleChange}
        placeholder={isLoading ? "Loading organizations..." : "Select organization"}
        searchPlaceholder="Search organizations..."
        emptyText="No organizations found."
        className="w-full"
        disabled={disabled || isLoading}
        fieldName="organization_id"
        createWhenEmpty
        onCreate={(raw) => {
          setCreateError(null);
          setNewOrgName(toTitleCase(raw));
          setIsCreateOpen(true);
        }}
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create organization</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              autoFocus
              placeholder="Organization name"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (!isCreating) void handleSubmitCreate();
                }
              }}
              disabled={isCreating}
            />
            {createError ? (
              <p className="text-sm text-red-600">{createError}</p>
            ) : null}
          </div>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSubmitCreate()}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
