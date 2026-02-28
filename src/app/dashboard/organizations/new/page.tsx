import type { Metadata } from "next";
import { Suspense } from "react";
import { EntityErrorBoundary } from "@/components/error-boundaries/entity-error-boundary";
import { PageContentSkeleton } from "@/components/layouts/pages/page-layout";
import EntityCreatePage from "@/components/features/entities/entity-create-page";
import { generatePageTitle } from "@/lib/metadata-utils";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: generatePageTitle("New Organization", "/dashboard/organizations/new"),
  };
}

export default function NewOrganizationPage() {
  return (
    <EntityErrorBoundary entityName="Organization">
      <Suspense fallback={<PageContentSkeleton />}>
        <EntityCreatePage entity="organizations" />
      </Suspense>
    </EntityErrorBoundary>
  );
}
