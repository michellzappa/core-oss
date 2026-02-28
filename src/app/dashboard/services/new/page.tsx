import { Metadata } from "next";
import { Suspense } from "react";
import { EntityErrorBoundary } from "@/components/error-boundaries/entity-error-boundary";
import EntityCreatePage from "@/components/features/entities/entity-create-page";
import { PageContentSkeleton } from "@/components/layouts/pages/page-layout";

export const metadata: Metadata = {
  title: "Create New Service | Core",
  description: "Create a new service",
};

export default function NewServicePage() {
  return (
    <EntityErrorBoundary entityName="Service">
      <Suspense fallback={<PageContentSkeleton />}>
        <EntityCreatePage
          entity="services"
          defaults={{
            // Billing Type: default to One-time (first option)
            is_recurring: "false",
            // Multiple Selection: default to Single selection (first option)
            allow_multiple: "false",
            // Default Selection: default to Not pre-selected (first option)
            is_default: "false",
            // Service Group: default to Optional
            group_type: "Optional",
            // Category: default to No category
            category: "none",
          }}
        />
      </Suspense>
    </EntityErrorBoundary>
  );
}
