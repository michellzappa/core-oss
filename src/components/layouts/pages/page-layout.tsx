import React, { ReactNode, Suspense } from "react";
import { StaticPageHeader } from "./static-page-header";

interface PageLayoutProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  // For additional content below the header but above the main content
  headerContent?: ReactNode;
  // Main content area - will be wrapped in Suspense
  children: ReactNode;
  // Loading fallback for the main content
  fallback?: ReactNode;
  // Option to hide the content card wrapper
  hideCard?: boolean;
  // Count to display after title
  count?: number;
}

/**
 * Consistent page layout with a predictable structure
 * This helps maintain UI consistency across routes and prevents flashing
 */
export function PageLayout({
  title,
  subtitle,
  actions,
  headerContent,
  children,
  fallback,
  hideCard = false,
  count,
}: PageLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Server header to avoid client boundary when auto back link/title isn't needed */}
      {(title || subtitle || actions || headerContent) && (
        <div className="mb-8 space-y-4">
          <StaticPageHeader
            title={title}
            subtitle={subtitle}
            actions={actions}
            count={count}
          >
            {headerContent}
          </StaticPageHeader>
        </div>
      )}

      {/* Main content - can be loaded with Suspense */}
      {hideCard ? (
        fallback ? (
          <Suspense fallback={fallback}>{children}</Suspense>
        ) : (
          children
        )
      ) : (
        <div className="rounded-md bg-card">
          {fallback ? (
            <Suspense fallback={fallback}>{children}</Suspense>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Default skeleton loader for page content
 */
export function PageContentSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
      <div className="space-y-3">
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full"></div>
        <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}
