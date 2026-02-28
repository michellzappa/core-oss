"use client";

import { UseFormReturn } from "react-hook-form";
import { useMemo, useEffect } from "react";
import { Combobox } from "@/components/ui/navigation/combobox";

interface CorporateEntityFieldProps {
  form: UseFormReturn<Record<string, unknown>>;
  disabled?: boolean;
}

export default function CorporateEntityField({
  form,
  disabled,
}: CorporateEntityFieldProps) {
  const options = useMemo(() => {
    const raw = form.getValues("corporate_entity_options") as
      | Array<{ id: string; name: string }>
      | undefined;
    return raw || [];
  }, [form]);

  const value = String((form.watch("corporate_entity_id") as string) || "");

  // If empty and options exist, prefer default from server-provided value
  useEffect(() => {
    if (!value && options.length > 0) {
      const serverDefault = form.getValues("corporate_entity_default_id") as
        | string
        | undefined;
      const defaultId = serverDefault || options[0]?.id;
      if (defaultId) form.setValue("corporate_entity_id", defaultId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.length]);

  return (
    <Combobox
      options={options.map((o) => ({ value: o.id, label: o.name }))}
      value={value}
      onChange={(v) => form.setValue("corporate_entity_id", v)}
      placeholder="Select corporate entity"
      searchPlaceholder="Search corporate entities..."
      emptyText="No corporate entities found."
      className="w-full"
      disabled={disabled}
      fieldName="corporate_entity_id"
    />
  );
}
