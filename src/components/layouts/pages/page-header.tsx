"use client";
import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/primitives/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RouteBreadcrumb } from "./route-breadcrumb";

interface PageHeaderProps {
  title?: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  backLink?: string;
  avatar?: ReactNode;
}

/**
 * Consistent page header component that maintains UI structure across routes
 * This helps prevent flash when navigating between pages
 */
export function AutoPageHeader({
  title,
  subtitle,
  actions,
  children,
  backLink,
  avatar,
}: PageHeaderProps) {
  const pathname = usePathname();

  // Determine title from pathname if not provided
  const defaultTitle = getDefaultTitle(pathname);
  const displayTitle = title || defaultTitle;

  // Generate back link if not provided
  const finalBackLink = backLink || generateBackLink(pathname);

  return (
    <div className="mb-8 space-y-4">
      <RouteBreadcrumb />
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {finalBackLink && (
            <Link href={finalBackLink}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          )}
          <div className="flex items-center gap-3">
            {avatar && avatar}
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {displayTitle}
              </h1>
              {subtitle && (
                <p className="text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {children}
    </div>
  );
}

export function StaticPageHeader({
  title,
  subtitle,
  actions,
  children,
  backLink,
  avatar,
}: PageHeaderProps) {
  return (
    <div className="mb-8 space-y-4">
      <RouteBreadcrumb />
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {backLink && (
            <Link href={backLink}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          )}
          <div className="flex items-center gap-3">
            {avatar && avatar}
            <div>
              {title && (
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              )}
              {subtitle && (
                <p className="text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {children}
    </div>
  );
}

/**
 * Generate a back link based on the current pathname
 */
function generateBackLink(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  // If we're on an edit page, go back to the list page
  if (lastSegment === "edit") {
    // Remove "edit" and the ID to get to the list page
    segments.pop(); // Remove "edit"
    segments.pop(); // Remove the ID
    return `/${segments.join("/")}`;
  }

  // If we're on a new page, go back to the list page
  if (lastSegment === "new") {
    // Remove "new" to get to the list page
    segments.pop(); // Remove "new"
    return `/${segments.join("/")}`;
  }

  // Support edit routes like /dashboard/{entity}/{id}
  // If we're on a detail page under /dashboard (e.g., offers/[id]),
  // return the parent list page: /dashboard/{entity}
  if (segments.length >= 3 && segments[0] === "dashboard") {
    return `/${segments.slice(0, -1).join("/")}`;
  }

  // Don't show back button on dashboard or list pages
  return null;
}

/**
 * Helper to generate a default title based on the current route
 */
function getDefaultTitle(pathname: string): string {
  // Extract the last segment of the path
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1];

  // Handle special cases and formats
  if (!lastSegment) return "Dashboard";

  // Special case handling
  if (lastSegment === "new") {
    const parentSegment = segments[segments.length - 2];
    if (parentSegment) {
      return `New ${formatSegment(parentSegment).slice(0, -1)}`;
    }
  }

  // Check if it's an edit page
  if (lastSegment === "edit") {
    const parentSegment = segments[segments.length - 3];
    if (parentSegment) {
      return `Edit ${formatSegment(parentSegment).slice(0, -1)}`;
    }
  }

  return formatSegment(lastSegment);
}

/**
 * Format a URL segment into a readable title
 */
function formatSegment(segment: string): string {
  // Handle special cases
  const specialCases: Record<string, string> = {
    orgs: "Organizations",
    organizations: "Organizations",
    users: "Users",
    services: "Services",
    settings: "Settings",
    projects: "Projects",
    offers: "Offers",
  };

  if (specialCases[segment]) {
    return specialCases[segment];
  }

  // Capitalize first letter and add space before capital letters
  return segment
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}
