import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        // Light, subdued pill for generic statuses
        lead: "border-transparent bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",

        // Offer status variants
        // draft: dark gray pill
        draft:
          "border-transparent bg-neutral-400 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100",
        // sent: gray pill
        sent: "border-transparent bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
        // Project status variants
        planning:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        "in-progress":
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        review:
          "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        completed: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        pending:
          "border-transparent bg-neutral-900 text-white dark:bg-neutral-800 dark:text-white",
        "on-hold":
          "border-transparent bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
        cancelled:
          "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        archived:
          "border-transparent bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
        // Service group variants
        base: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        research:
          "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        optional:
          "border-transparent bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
        license:
          "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        "service-category-visualization":
          "border-transparent bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
        "service-category-architecture":
          "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
        "service-category-signals":
          "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        // Service type variants
        "service-recurring":
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        "service-one-time":
          "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        // Service public variants
        "service-public":
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        "service-private":
          "border-transparent bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
        // Task priority variants
        low: "border-transparent bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
        medium:
          "border-transparent bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        high: "border-transparent bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
        urgent:
          "border-transparent bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        // Interaction type variants
        email:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
        call: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        meeting:
          "border-transparent bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
        message:
          "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
        note: "border-transparent bg-neutral-100 text-neutral-800 dark:bg-neutral-900 dark:text-neutral-200",
        web: "border-transparent bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
        // Token status variants
        "token-active":
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        "token-expired":
          "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
