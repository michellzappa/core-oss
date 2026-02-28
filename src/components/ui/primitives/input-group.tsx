import * as React from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/primitives/input";

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring",
      className,
    )}
    {...props}
  />
));
InputGroup.displayName = "InputGroup";

const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("px-3 text-muted-foreground whitespace-nowrap", className)}
    {...props}
  />
));
InputGroupText.displayName = "InputGroupText";

const InputGroupInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentPropsWithoutRef<typeof Input>
>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    className={cn(
      "h-full border-0 bg-transparent shadow-none focus-visible:ring-0",
      className,
    )}
    {...props}
  />
));
InputGroupInput.displayName = "InputGroupInput";

export { InputGroup, InputGroupText, InputGroupInput };
