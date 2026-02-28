"use client";

import { useEffect, useState, useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/primitives/select";
import { getSelectTriggerClasses } from "@/lib/utils/input-styles";

interface CurrencyFieldProps {
  form: UseFormReturn<Record<string, unknown>>;
  disabled?: boolean;
}

export default function CurrencyField({ form, disabled }: CurrencyFieldProps) {
  const serverOptions = useMemo(() => {
    const raw = form.getValues("currency_options") as
      | Array<{ code: string; symbol: string }>
      | undefined;
    return raw?.map((c) => ({
      value: c.code,
      label: `${c.code} (${c.symbol})`,
    }));
  }, [form]);

  const [options, setOptions] = useState<
    Array<{ value: string; label: string }>
  >(
    serverOptions || [
      { value: "EUR", label: "EUR (€)" },
      { value: "USD", label: "USD ($)" },
      { value: "GBP", label: "GBP (£)" },
    ]
  );

  // If server provided options, use them; otherwise keep default fallback.
  useEffect(() => {
    if (serverOptions && serverOptions.length > 0) setOptions(serverOptions);
  }, [serverOptions]);

  const value = (form.watch("currency") as string) || "EUR";

  return (
    <Select
      value={value}
      onValueChange={(val) => form.setValue("currency", val)}
      disabled={disabled}
    >
      <SelectTrigger className={getSelectTriggerClasses(!!disabled, false)}>
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
