"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

export const RadioGroup = RadioGroupPrimitive.Root;

export interface RadioGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {}

export const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className = "", ...props }, ref) => {
  const classes = [
    "h-5 w-5 rounded-full border border-input",
    "text-primary",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
    "data-[state=checked]:border-primary data-[state=checked]:bg-primary/15",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <RadioGroupPrimitive.Item ref={ref} className={classes} {...props}>
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <span className="block h-3 w-3 rounded-full bg-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});

RadioGroupItem.displayName = "RadioGroupItem";
