"use client";

import { useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
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

interface ServerPaymentTermOption {
  id: string;
  title: string;
  description: string;
  is_default?: boolean;
  is_active?: boolean;
}

export default function PaymentTermsField({
  form,
  disabled,
}: {
  form: UseFormReturn<Record<string, unknown>>;
  disabled?: boolean;
}) {
  const serverProvided = useMemo(() => {
    const raw = form.getValues("payment_term_options") as
      | ServerPaymentTermOption[]
      | undefined;
    return Array.isArray(raw) ? raw : undefined;
  }, [form]);

  const { data: fetchedOptions } = useSWR<ServerPaymentTermOption[]>(
    serverProvided && serverProvided.length > 0
      ? null
      : "/api/settings/payment-terms",
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

  useEffect(() => {
    if (serverProvided && serverProvided.length > 0) {
      // Prefer a server-provided default when none is selected yet
      const current = form.getValues("payment_term_id") as
        | string
        | undefined;
      if (!current) {
        const explicitDefault = serverProvided.find((r) => r.is_default);
        const fallbackFirst = serverProvided[0];
        const chosen = explicitDefault ?? fallbackFirst;
        if (chosen) {
          form.setValue("payment_term_id", chosen.id);
        }
      }
      // Options are already derived from serverProvided in initial state
      return;
    }

    const current = form.getValues("payment_term_id") as string | undefined;
    if (!current && options.length > 0) {
      form.setValue("payment_term_id", options[0]?.value);
    }
  }, [form, serverProvided, options]);

  const watched = form.watch("payment_term_id") as string | undefined;
  const initial = form.getValues("payment_term_id") as string | undefined;
  const value = watched ?? initial ?? "";

  return (
    <Select
      value={value || ""}
      onValueChange={(val) =>
        form.setValue(
          "payment_term_id",
          val === "__none__" ? undefined : (val as string)
        )
      }
      disabled={disabled}
    >
      <SelectTrigger className={getSelectTriggerClasses(!!disabled, false)}>
        <SelectValue placeholder="Select payment terms" />
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
