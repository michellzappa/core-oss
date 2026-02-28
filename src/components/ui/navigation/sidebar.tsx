"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/primitives/button";

const SIDEBAR_WIDTH = "12rem";
const SIDEBAR_WIDTH_COLLAPSED = "3.5rem";
const SIDEBAR_WIDTH_MOBILE = "85vw";

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  hovered: boolean;
  setHovered: (value: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (value: boolean) => void;
  effectiveCollapsed: boolean;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider.");
  }
  return context;
}

function SidebarProvider({
  children,
  defaultCollapsed = false,
  className,
}: React.PropsWithChildren<{
  defaultCollapsed?: boolean;
  className?: string;
}>) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [hovered, setHovered] = React.useState(false);
  const [openMobile, setOpenMobile] = React.useState(false);

  const effectiveCollapsed = collapsed && !hovered;
  const desktopWidth = effectiveCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH;

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        hovered,
        setHovered,
        openMobile,
        setOpenMobile,
        effectiveCollapsed,
      }}
    >
      <div
        data-slot="sidebar-wrapper"
        className={cn("flex min-h-screen w-full", className)}
        style={
          {
            "--sidebar-width": desktopWidth,
            "--sidebar-width-expanded": SIDEBAR_WIDTH,
            "--sidebar-width-collapsed": SIDEBAR_WIDTH_COLLAPSED,
            "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

const Sidebar = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"aside">
>(({ className, onMouseEnter, onMouseLeave, children, ...props }, ref) => {
  const { collapsed, setHovered, openMobile, setOpenMobile } = useSidebar();

  return (
    <>
      {openMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setOpenMobile(false)}
          aria-hidden="true"
        />
      )}
      <aside
        ref={ref}
        data-slot="sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 h-screen bg-white dark:bg-[var(--card)] minimal-shadow minimal-border-r transition-[transform,width] duration-300 ease-in-out",
          openMobile ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:w-[var(--sidebar-width)]",
          "w-[var(--sidebar-width-mobile)] sm:max-w-[320px]",
          className,
        )}
        onMouseEnter={(event) => {
          if (collapsed) setHovered(true);
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          if (collapsed) setHovered(false);
          onMouseLeave?.(event);
        }}
        {...props}
      >
        {children}
      </aside>
    </>
  );
});
Sidebar.displayName = "Sidebar";

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sidebar-inset"
    className={cn(
      "flex min-h-screen flex-1 lg:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out",
      className,
    )}
    {...props}
  />
));
SidebarInset.displayName = "SidebarInset";

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, onClick, children, ...props }, ref) => {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <Button
      ref={ref}
      data-slot="sidebar-trigger"
      variant="outline"
      size="icon"
      className={cn("lg:hidden fixed top-4 left-4 z-50 h-12 w-12", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpenMobile(!openMobile);
        }
      }}
      {...props}
    >
      {children ?? <PanelLeft className="h-5 w-5" />}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    data-slot="sidebar-rail"
    className={cn(
      "hidden lg:block absolute inset-y-0 -right-[1px] w-1 cursor-col-resize hover:bg-neutral-200 dark:hover:bg-[var(--secondary)] transition-colors",
      className,
    )}
    {...props}
  />
));
SidebarRail.displayName = "SidebarRail";

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sidebar-header"
    className={cn("flex-shrink-0", className)}
    {...props}
  />
));
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sidebar-content"
    className={cn("flex-1 min-h-0 overflow-y-auto", className)}
    {...props}
  />
));
SidebarContent.displayName = "SidebarContent";

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="sidebar-footer"
    className={cn("flex-shrink-0", className)}
    {...props}
  />
));
SidebarFooter.displayName = "SidebarFooter";

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<"ul">
>(({ className, ...props }, ref) => (
  <ul ref={ref} data-slot="sidebar-menu" className={cn("space-y-1", className)} {...props} />
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li ref={ref} data-slot="sidebar-menu-item" className={cn("", className)} {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
    isActive?: boolean;
  }
>(({ className, isActive, ...props }, ref) => {
  return (
    <button
      ref={ref}
      data-slot="sidebar-menu-button"
      data-active={isActive ? "true" : "false"}
      className={cn(
        "group flex w-full items-center rounded-md py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-neutral-100 dark:bg-[var(--secondary)] text-neutral-900 dark:text-neutral-300"
          : "text-neutral-900 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[var(--secondary)]",
        className,
      )}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

export {
  SidebarProvider,
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
};
