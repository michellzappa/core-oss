"use client";

import { Button } from "@/components/ui/primitives/button";
import { PlusIcon } from "lucide-react";
import NextLinkWithPrefetch from "@/components/layouts/navigation/next-link-with-prefetch";
import {
  PageLayout,
  PageContentSkeleton,
} from "@/components/layouts/pages/page-layout";
import { EntityErrorBoundary } from "@/components/error-boundaries/entity-error-boundary";
import { Suspense } from "react";
import EntityIndexClient from "./entity-index-client";

interface StaticEntityIndexWithToggleProps {
  entity: Parameters<typeof EntityIndexClient>[0]["entity"];
  items: Parameters<typeof EntityIndexClient>[0]["items"];
  initial?: Parameters<typeof EntityIndexClient>[0]["initial"];
  title: string;
  createLink: string;
  createButtonText: string;
}

export default function StaticEntityIndexWithToggle({
  entity,
  items,
  initial,
  title,
  createLink,
  createButtonText,
}: StaticEntityIndexWithToggleProps) {
  const showCreateButton = Boolean(createLink && createButtonText);

  const actions = showCreateButton ? (
    <div className="flex items-center gap-2">
      <NextLinkWithPrefetch href={createLink}>
        <Button className="flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>{createButtonText}</span>
        </Button>
      </NextLinkWithPrefetch>
    </div>
  ) : undefined;

  return (
    <PageLayout
      title={title}
      actions={actions}
      fallback={<PageContentSkeleton />}
      count={items?.length ?? 0}
    >
      <EntityErrorBoundary entityName={entity}>
        <Suspense fallback={<PageContentSkeleton />}>
          <EntityIndexClient
            entity={entity}
            items={items}
            initial={initial}
            hideHeader={true}
          />
        </Suspense>
      </EntityErrorBoundary>
    </PageLayout>
  );
}
