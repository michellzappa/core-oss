"use client";

import { ReactNode, useState, createContext } from "react";
import { usePathname } from "next/navigation";
import { AutoPageHeader } from "./page-header";
import { Button } from "@/components/ui/primitives/button";
import { Trash2 } from "lucide-react";

interface CreatePageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onDelete?: () => void;
  deleteButtonText?: string;
  backLink?: string;
}

export function CreatePageLayout({
  title,
  subtitle,
  children,
  onDelete,
  deleteButtonText = "Delete",
  backLink,
}: CreatePageLayoutProps) {
  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);
  // Provide the same lock context API for create pages so clients can call useEditPageLock safely
  const EditPageContext = createContext<
    { isLocked: boolean; setIsLocked: (b: boolean) => void } | undefined
  >(undefined);
  const [isLocked, setIsLocked] = useState(false);

  // Check if this is a "new" page by path segment (avoids false match: "newsletter" contains "new")
  const isNewPage =
    pathParts.includes("new") && !pathname.includes("/offers/new");

  return (
    <EditPageContext.Provider value={{ isLocked, setIsLocked }}>
      <div className="space-y-8">
        {/* Only show PageHeader if this is not a "new" page */}
        {!isNewPage && (
          <AutoPageHeader
            title={title}
            subtitle={subtitle}
            backLink={backLink}
            actions={
              onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={onDelete}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleteButtonText}
                </Button>
              )
            }
          />
        )}
        {/* Full width layout for create pages */}
        <div className="w-full">{children}</div>
      </div>
    </EditPageContext.Provider>
  );
}

interface CreatePageSectionProps {
  children: ReactNode;
  className?: string;
}

export function CreatePageSection({
  children,
  className = "",
}: CreatePageSectionProps) {
  return <div className={`space-y-6 ${className}`}>{children}</div>;
}

interface CreatePageFormSectionProps {
  children: ReactNode;
}

export function CreatePageFormSection({
  children,
}: CreatePageFormSectionProps) {
  return <div>{children}</div>;
}

interface CreatePageRelationsSectionProps {
  children: ReactNode;
  title?: string;
}

export function CreatePageRelationsSection({
  children,
  title,
}: CreatePageRelationsSectionProps) {
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
