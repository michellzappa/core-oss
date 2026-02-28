"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import useSWR from "swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives/select";
import { getSelectTriggerClasses } from "@/lib/utils/input-styles";
import { fetcher } from "@/lib/fetchers";

interface ServerDeliveryConditionOption {
  id: string;
  title: string;
  description: string;
  is_default?: boolean;
  is_active?: boolean;
}

export default function DeliveryConditionsField({
  form,
  disabled,
}: {
  form: UseFormReturn<Record<string, unknown>>;
  disabled?: boolean;
}) {
  const serverProvided = useMemo(() => {
    const raw = form.getValues("delivery_condition_options") as
      | ServerDeliveryConditionOption[]
      | undefined;
    return Array.isArray(raw) ? raw : undefined;
  }, [form]);

  const { data: fetchedOptions } = useSWR<ServerDeliveryConditionOption[]>(
    serverProvided && serverProvided.length > 0
      ? null
      : "/api/settings/delivery-conditions",
    fetcher,
  );

  const options = useMemo(() => {
    if (serverProvided && serverProvided.length > 0) {
      return serverProvided.map((r) => ({ value: r.id, label: r.title }));
    }
    return (fetchedOptions || [])
      .filter((r) => r.is_active)
      .map((r) => ({ value: r.id, label: r.title }));
  }, [serverProvided, fetchedOptions]);

  const watched = form.watch("delivery_condition_id") as string | undefined;
  const initial = form.getValues("delivery_condition_id") as string | undefined;
  const value = watched ?? initial ?? "";

  return (
    <Select
      value={value || ""}
      onValueChange={(val) =>
        form.setValue(
          "delivery_condition_id",
          val === "__none__" ? undefined : (val as string)
        )
      }
      disabled={disabled}
    >
      <SelectTrigger className={getSelectTriggerClasses(!!disabled, false)}>
        <SelectValue placeholder="Select delivery conditions" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__none__">None</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
