"use client";

import {
  ReactNode,
  useState,
  createContext,
  useContext,
  useEffect,
} from "react";
import { AutoPageHeader } from "./page-header";
import { Button } from "@/components/ui/primitives/button";
import { LockToggle } from "@/components/ui/primitives/lock-toggle";
import { Trash2 } from "lucide-react";

// Create context for lock state
interface EditPageContextType {
  isLocked: boolean;
  setIsLocked: (locked: boolean) => void;
}

const EditPageContext = createContext<EditPageContextType | undefined>(
  undefined
);

export function useEditPageLock() {
  const context = useContext(EditPageContext);
  if (context === undefined) {
    throw new Error("useEditPageLock must be used within an EditPageLayout");
  }
  return context;
}

// Safe accessor for consumers that might render outside EditPageLayout (e.g., create pages)
export function useOptionalEditPageLock() {
  return useContext(EditPageContext);
}

interface EditPageLayoutProps {
  title: string;
  subtitle?: React.ReactNode;
  children: ReactNode;
  onDelete?: () => void;
  deleteButtonText?: string;
  backLink?: string;
  fullWidth?: boolean;
  layout?: "half" | "wide";
  avatar?: ReactNode;
  defaultLocked?: boolean;
  actions?: ReactNode;
}

export function EditPageLayout({
  title,
  subtitle,
  children,
  onDelete,
  deleteButtonText = "Delete",
  backLink,
  fullWidth = false,
  layout = "wide",
  avatar,
  defaultLocked = true,
  actions,
}: EditPageLayoutProps) {
  const [isLocked, setIsLocked] = useState(defaultLocked);

  const getGridClass = () => {
    if (fullWidth) return "space-y-8";

    switch (layout) {
      case "half":
        return "grid grid-cols-1 lg:grid-cols-2 gap-8";
      case "wide":
        return "grid grid-cols-1 lg:grid-cols-3 gap-8";
      default:
        return "grid grid-cols-1 lg:grid-cols-3 gap-8";
    }
  };

  return (
    <EditPageContext.Provider value={{ isLocked, setIsLocked }}>
      <div className="space-y-8">
        <AutoPageHeader
          title={title}
          subtitle={subtitle}
          backLink={backLink}
          avatar={avatar}
          actions={
            <>
              {actions}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteButtonText}
                </Button>
              )}
            </>
          }
        />
        {fullWidth ? (
          children
        ) : (
          <div className={getGridClass()}>{children}</div>
        )}
      </div>
    </EditPageContext.Provider>
  );
}

interface EditPageSectionProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
  layout?: "half" | "wide";
}

export function EditPageSection({
  children,
  className = "",
  colSpan,
  layout = "wide",
}: EditPageSectionProps) {
  const getColSpanClass = (span?: number) => {
    if (layout === "half") {
      // For half layout, use 2-column grid
      switch (span) {
        case 1:
          return "lg:col-span-1";
        case 2:
          return "lg:col-span-1";
        case 3:
          return "lg:col-span-2";
        default:
          return "";
      }
    } else {
      // For wide layout, use 3-column grid
      switch (span) {
        case 1:
          return "lg:col-span-1";
        case 2:
          return "lg:col-span-2";
        case 3:
          return "lg:col-span-3";
        default:
          return "";
      }
    }
  };

  const colSpanClass = getColSpanClass(colSpan);
  return (
    <div className={`space-y-6 ${colSpanClass} ${className}`}>{children}</div>
  );
}

interface EditPageFormSectionProps {
  children: ReactNode;
  hideLockToggle?: boolean;
}

export function EditPageFormSection({
  children,
  hideLockToggle = false,
}: EditPageFormSectionProps) {
  const lockContext = useOptionalEditPageLock();
  const isLocked = lockContext?.isLocked ?? false;
  const setIsLocked = lockContext?.setIsLocked;

  // Listen for global unlock events (Cmd+L/Ctrl+L)
  useEffect(() => {
    const onToggle = () => {
      if (setIsLocked) setIsLocked(!isLocked);
    };
    document.addEventListener("global-toggle-lock", onToggle as EventListener);
    return () =>
      document.removeEventListener(
        "global-toggle-lock",
        onToggle as EventListener
      );
  }, [isLocked, setIsLocked]);

  return (
    <div
      className="bg-white dark:bg-[var(--card)] rounded-lg minimal-shadow minimal-border p-6 relative"
      onDoubleClick={() => {
        if (setIsLocked) setIsLocked(false);
      }}
    >
      {setIsLocked && !hideLockToggle && (
        <div className="absolute top-4 right-4 z-10">
          <LockToggle isLocked={isLocked} onToggle={setIsLocked} size="sm" />
        </div>
      )}
      {children}
    </div>
  );
}

interface EditPageRelationsSectionProps {
  children: ReactNode;
  title?: string;
}

export function EditPageRelationsSection({
  children,
  title,
}: EditPageRelationsSectionProps) {
  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-medium text-[var(--foreground)]">
          {title}
        </h3>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
