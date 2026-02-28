"use client";

import React, { useMemo, useCallback } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Combobox } from "@/components/ui/navigation/combobox";
import { industryOptions } from "@/lib/industries";

interface IndustryFieldProps {
  form: UseFormReturn<Record<string, unknown>>;
  disabled?: boolean;
}

export default function IndustryField({ form, disabled }: IndustryFieldProps) {
  const watchedIndustry = useWatch({ control: form.control, name: "industry" });
  const value = String(watchedIndustry || "");

  const options = useMemo(() => industryOptions, []);

  const handleChange = useCallback(
    (v: string) => {
      form.setValue("industry", v);
    },
    [form]
  );

  return (
    <Combobox
      options={options}
      value={value || "__placeholder__"}
      onChange={handleChange}
      placeholder="Select industry"
      searchPlaceholder="Search industries..."
      emptyText="No industries found."
      className="w-full"
      disabled={disabled}
      fieldName="industry"
    />
  );
}
