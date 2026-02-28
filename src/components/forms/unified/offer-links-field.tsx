"use client";

import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/primitives/checkbox";
import * as Icons from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetchers";

interface LinkPreset {
  id: string;
  title: string;
  url: string;
  icon?: string | null;
  is_default: boolean;
  is_active: boolean;
}

function IconPreview({ name }: { name?: string | null }) {
  if (!name) return null;
  const Icon = (
    Icons as unknown as Record<
      string,
      React.ComponentType<{ className?: string }>
    >
  )[name];
  return Icon ? <Icon className="h-4 w-4" /> : null;
}

export default function OfferLinksField({
  form,
  disabled,
}: {
  form: UseFormReturn<Record<string, unknown>>;
  disabled?: boolean;
}) {
  const { data: presetsData } = useSWR<LinkPreset[]>(
    "/api/settings/offer-links",
    fetcher,
  );
  const presets = (presetsData || []).filter((r) => r.is_active);
  // Register the field so it remains in RHF state across lock/unlock
  useEffect(() => {
    form.register("offer_selected_link_ids");
  }, [form]);
  const watched = form.watch("offer_selected_link_ids") as string[] | undefined;
  const initial = (form.getValues("offer_selected_link_ids") as string[]) || [];
  const value: string[] = watched ?? initial ?? [];

  useEffect(() => {
    const current = form.getValues("offer_selected_link_ids") as
      | string[]
      | undefined;
    if (current && current.length > 0) return;
    const defaults = presets
      .filter((r: LinkPreset) => r.is_default)
      .map((r: LinkPreset) => r.id);
    if (defaults.length > 0) {
      form.setValue("offer_selected_link_ids", defaults, {
        shouldDirty: true,
        shouldValidate: false,
      });
    }
  }, [form, presets]);

  const toggle = (id: string) => {
    const current: string[] =
      (form.getValues("offer_selected_link_ids") as string[]) || [];
    const exists = current.includes(id);
    const next = exists ? current.filter((x) => x !== id) : [...current, id];
    form.setValue("offer_selected_link_ids", next, {
      shouldDirty: true,
      shouldValidate: false,
    });
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-3">
        {presets.map((p) => {
          const checked = value?.includes(p.id);
          return (
            <label
              key={p.id}
              className={
                `flex items-start gap-3 rounded-md px-3 py-2 border ` +
                `border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] ` +
                `${
                  disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                }`
              }
            >
              <Checkbox
                checked={!!checked}
                onCheckedChange={() => toggle(p.id)}
                disabled={disabled}
                name="offer_selected_link_ids[]"
                value={p.id}
                className="h-4 w-4 border-[var(--border)] data-[state=checked]:bg-[var(--foreground)] data-[state=checked]:text-[var(--background)]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
                  <IconPreview name={p.icon} />
                  <span>{p.title}</span>
                </div>
                <div className="text-xs text-[var(--muted-foreground)] break-all mt-0.5">
                  {p.url}
                </div>
              </div>
            </label>
          );
        })}
        {presets.length === 0 && (
          <div className="text-sm text-[var(--muted-foreground)]">
            No link presets yet.
          </div>
        )}
      </div>
    </div>
  );
}
