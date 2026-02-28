"use client";

import React, { useMemo, useCallback } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import { Combobox } from "@/components/ui/navigation/combobox";
import { countryOptions } from "@/lib/countries";

interface CountryFieldProps {
  form: UseFormReturn<Record<string, unknown>>;
  disabled?: boolean;
}

export default function CountryField({ form, disabled }: CountryFieldProps) {
  const watchedCountry = useWatch({ control: form.control, name: "country" });
  const value = String(watchedCountry || "");

  const options = useMemo(() => countryOptions, []);

  const handleChange = useCallback(
    (v: string) => {
      form.setValue("country", v);
    },
    [form]
  );

  return (
    <Combobox
      options={options}
      value={value || "__placeholder__"}
      onChange={handleChange}
      placeholder="Select country"
      searchPlaceholder="Search countries..."
      emptyText="No countries found."
      className="w-full"
      disabled={disabled}
      fieldName="country"
    />
  );
}
