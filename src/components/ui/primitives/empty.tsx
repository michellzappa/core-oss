import * as React from "react";
import { Inbox } from "lucide-react";

import { cn } from "@/lib/utils";

interface EmptyProps extends React.ComponentPropsWithoutRef<"div"> {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, title, description, icon, action, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-md border bg-card px-6 py-8 text-center minimal-shadow minimal-border",
        className,
      )}
      {...props}
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon ?? <Inbox className="h-5 w-5" />}
      </div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  ),
);
Empty.displayName = "Empty";

export { Empty };
