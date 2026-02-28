"use client";

import * as React from "react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/navigation/dialog";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => {
  const { theme, resolvedTheme, systemTheme } = useTheme();
  // Default to light mode until mounted to prevent hydration mismatch
  const isDark = resolvedTheme === "dark" || (theme === "system" && systemTheme === "dark") || theme === "dark";
  
  return (
    <CommandPrimitive
      ref={ref}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md text-foreground",
        className
      )}
      style={{
        backdropFilter: "none !important",
        WebkitBackdropFilter: "none !important",
        filter: "none !important",
        backgroundColor: isDark ? "#0f0f0f" : "#ffffff",
        background: isDark ? "#0f0f0f" : "#ffffff",
      }}
      {...props}
    />
  );
});
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children, ...props }: DialogProps) => {
  const { theme, resolvedTheme, systemTheme } = useTheme();
  // Default to light mode until mounted to prevent hydration mismatch
  const isDark = resolvedTheme === "dark" || (theme === "system" && systemTheme === "dark") || theme === "dark";
  
  return (
    <Dialog {...props}>
      <DialogContent
        className="!flex !flex-col !p-0 !gap-0 overflow-hidden rounded-lg h-[70vh] max-h-[80vh] w-[92vw] sm:w-full sm:h-auto border border-neutral-200 dark:border-neutral-800 shadow-md [&>button]:hidden"
        style={{
          backdropFilter: "none !important",
          WebkitBackdropFilter: "none !important",
          filter: "none !important",
          backgroundColor: isDark ? "#0f0f0f" : "#ffffff",
          background: isDark ? "#0f0f0f" : "#ffffff",
          padding: "0 !important",
          gap: "0 !important",
          display: "flex",
          flexDirection: "column",
          borderColor: isDark ? "#262626" : "#e5e5e5",
        }}
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <Command
          className={cn(
            "h-full w-full [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5",
            isDark ? "!bg-[#0f0f0f]" : "!bg-white"
          )}
          style={{
            backdropFilter: "none !important",
            WebkitBackdropFilter: "none !important",
            filter: "none !important",
            backgroundColor: isDark ? "#0f0f0f !important" : "#ffffff !important",
            background: isDark ? "#0f0f0f !important" : "#ffffff !important",
          }}
          shouldFilter={false}
          loop
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => {
  return (
    <div className="flex items-center px-3 w-full" cmdk-input-wrapper="">
      <CommandPrimitive.Input
        ref={ref}
        className={cn(
          "flex h-10 w-full bg-transparent py-3 text-sm outline-none border-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-none focus:shadow-none placeholder:text-[var(--muted-foreground)] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        style={{
          outline: "none !important",
          boxShadow: "none !important",
          border: "none !important",
          outlineWidth: "0 !important",
          outlineStyle: "none" as any,
          outlineOffset: "0 !important",
        }}
        onFocus={(e) => {
          e.target.style.setProperty("outline", "none", "important");
          e.target.style.setProperty("box-shadow", "none", "important");
          e.target.style.setProperty("border", "none", "important");
          e.target.style.setProperty("outline-width", "0", "important");
          e.target.style.setProperty("outline-style", "none", "important");
        }}
        onBlur={(e) => {
          e.target.style.setProperty("outline", "none", "important");
          e.target.style.setProperty("box-shadow", "none", "important");
          e.target.style.setProperty("border", "none", "important");
        }}
        {...props}
      />
    </div>
  );
});

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      "max-h-[70vh] sm:max-h-[400px] overflow-y-auto overflow-x-hidden",
      className
    )}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden text-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("h-px bg-neutral-200 dark:bg-neutral-700 my-2", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer gap-2 select-none items-center px-3 py-1.5 text-sm outline-none transition-colors hover:bg-neutral-100 dark:hover:bg-[var(--secondary)] focus:bg-neutral-100 dark:focus:bg-[var(--secondary)] data-[disabled=true]:pointer-events-none data-[selected=true]:bg-neutral-100 data-[selected=true]:text-neutral-900 dark:data-[selected=true]:bg-[var(--secondary)] dark:data-[selected=true]:text-neutral-300 data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
