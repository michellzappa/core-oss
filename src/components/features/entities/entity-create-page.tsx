import { Suspense } from "react";
import { EntityErrorBoundary } from "@/components/error-boundaries/entity-error-boundary";
import {
  EditPageLayout,
  EditPageSection,
  EditPageFormSection,
} from "@/components/layouts/pages/edit-page-layout";
import { PageContentSkeleton } from "@/components/layouts/pages/page-layout";
import UnifiedFormClient from "@/components/forms/unified/unified-form-client";
import ServicesPanel from "@/components/forms/unified/services-panel";

type EntityType =
  | "organizations"
  | "contacts"
  | "projects"
  | "services"
  | "offers";

interface EntityCreatePageProps {
  entity: EntityType;
  defaults?: Record<string, unknown>;
  title?: string;
}

export default function EntityCreatePage({
  entity,
  defaults = {},
  title,
}: EntityCreatePageProps) {
  const titleMap: Record<EntityType, string> = {
    organizations: "Create Organization",
    contacts: "Create Contact",
    projects: "Create Project",
    services: "Create Service",
    offers: "Create Offer",
  };

  const entityTypeMap: Record<
    EntityType,
    keyof typeof import("@/lib/forms/form-configs").formConfigs
  > = {
    organizations: "organization",
    contacts: "contact",
    projects: "project",
    services: "service",
    offers: "offer",
  };

  const computedTitle = title || titleMap[entity];
  const entityType = entityTypeMap[entity];
  const isOffer = entity === "offers";
  const isContact = entity === "contacts";

  return (
    <EntityErrorBoundary entityName={computedTitle.replace("Create ", "")}>
      <Suspense fallback={<PageContentSkeleton />}>
        {isOffer ? (
          <EditPageLayout
            title={computedTitle}
            layout="half"
            defaultLocked={false}
          >
            <EditPageSection colSpan={1} layout="half">
              <EditPageFormSection hideLockToggle>
                <UnifiedFormClient
                  entityType={entityType}
                  defaultValues={defaults}
                  mode="create"
                  title={computedTitle}
                  layoutVariant="half"
                />
              </EditPageFormSection>
            </EditPageSection>
            <EditPageSection colSpan={1} layout="half">
              <div>
                <ServicesPanel
                  currency={(defaults.currency as string) || "EUR"}
                  discountType={(defaults.discount_type as string) || "none"}
                  globalDiscountPercentage={
                    (defaults.global_discount_percentage as number) || 0
                  }
                  mode="create"
                />
              </div>
            </EditPageSection>
          </EditPageLayout>
        ) : (
          // Non-offer creates: NewPageWrapper already provides the outer card,
          // so render the form directly to avoid a nested card.
          <div className="space-y-6">
            <UnifiedFormClient
              entityType={entityType}
              defaultValues={defaults}
              mode="create"
              title={computedTitle}
              layoutVariant="wide"
            />
          </div>
        )}
      </Suspense>
    </EntityErrorBoundary>
  );
}
