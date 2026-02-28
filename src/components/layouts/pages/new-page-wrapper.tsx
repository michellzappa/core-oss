"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/primitives/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface NewPageWrapperProps {
  children: ReactNode;
}

export default function NewPageWrapper({ children }: NewPageWrapperProps) {
  const pathname = usePathname();

  // Check if this is a "new" page by path segment (avoids false match: "newsletter" contains "new")
  const pathParts = pathname.split("/").filter(Boolean);
  const isNewPage =
    pathParts.includes("new") && !pathname.includes("/offers/new");

  if (isNewPage) {
    const newIndex = pathParts.indexOf("new");
    // Use the segment before "new" for nested routes (e.g. services/testimonials/new -> testimonials)
    const entityName =
      newIndex > 0
        ? pathParts[newIndex - 1]
        : pathParts.findIndex((p) => p === "dashboard" || p === "website") >= 0 &&
            pathParts.length >= 2
          ? pathParts[1]
          : "item";
    const rootIndex = pathParts.findIndex(
      (part) => part === "dashboard" || part === "website"
    );
    const rootSegment = rootIndex >= 0 ? pathParts[rootIndex] : "dashboard";
    const backLink =
      newIndex > 0
        ? "/" + pathParts.slice(0, newIndex).join("/")
        : `/${rootSegment}/${entityName}`;

    // Convert to singular form for titles (testimonials -> testimonial, logos -> logo)
    const singularEntityName = entityName.replace(/s$/, "");

    // Generate title
    const title = `New ${
      singularEntityName.charAt(0).toUpperCase() + singularEntityName.slice(1)
    }`;

    // For "new" pages, apply full-width styling with proper page structure
    return (
      <div className="-m-8 p-8 bg-[var(--background)]">
        <div className="max-w-none">
          {/* Page Header */}
          <div className="mb-8 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link href={backLink}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                  <p className="text-muted-foreground mt-1">
                    Create new {entityName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content with white card background */}
          <div className="bg-white dark:bg-[var(--card)] rounded-lg minimal-shadow minimal-border p-6">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // For other pages, render normally
  return <>{children}</>;
}
