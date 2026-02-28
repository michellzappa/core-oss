import React, { ReactNode } from "react";
import { PageLayout, PageContentSkeleton } from "./page-layout";
import { Button } from "@/components/ui/primitives/button";
import { PlusIcon } from "lucide-react";
import NextLinkWithPrefetch from "../navigation/next-link-with-prefetch";

interface ListPageWrapperProps {
  title?: string;
  subtitle?: string;
  createLink?: string;
  createButtonText?: string;
  headerContent?: ReactNode;
  children: ReactNode;
  prefetchDataFn?: () => Promise<void>;
  viewToggle?: ReactNode;
  count?: number;
  hideCard?: boolean;
}

/**
 * Consistent wrapper for list pages (users, organizations, etc.)
 * Maintains the same structure and provides smooth transitions
 */
export default function ListPageWrapper({
  title,
  subtitle,
  createLink,
  createButtonText = "Create New",
  headerContent,
  children,
  prefetchDataFn,
  viewToggle,
  count,
  hideCard = false,
}: ListPageWrapperProps) {
  // Actions for the page header
  const actions = (
    <div className="flex items-center gap-2">
      {viewToggle}
      {createLink && (
        <NextLinkWithPrefetch href={createLink} prefetchData={prefetchDataFn}>
          <Button className="bg-black text-white hover:bg-black/90">
            <PlusIcon className="h-4 w-4 mr-2" />
            {createButtonText}
          </Button>
        </NextLinkWithPrefetch>
      )}
    </div>
  );

  return (
    <PageLayout
      title={title}
      subtitle={subtitle}
      actions={actions}
      headerContent={headerContent}
      fallback={<PageContentSkeleton />}
      count={count}
      hideCard={hideCard}
    >
      {children}
    </PageLayout>
  );
}
