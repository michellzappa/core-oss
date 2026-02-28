import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  getEntitiesWithRelations,
  getEntityWithRelations,
  getCorporateEntitiesWrapper,
  getDefaultCorporateEntityWrapper,
  getPaymentTermsWrapper,
  getDeliveryConditionsWrapper,
  getOfferLinkPresetsWrapper,
  getOfferSelectedLinksWrapper,
} from "@/lib/server-data";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import UnifiedFormClient from "./unified-form-client";
import { formConfigs } from "@/lib/forms/form-configs";
import {
  EditPageLayout,
  EditPageSection,
  EditPageFormSection,
  EditPageRelationsSection,
} from "@/components/layouts/pages/edit-page-layout";
import OrganizationRelationsPanel from "./organization-relations-panel";
import ContactRelationsPanel from "./contact-relations-panel";
import ProjectRelationsPanel from "./project-relations-panel";
import ServicesPanel from "./services-panel";

interface UnifiedEditPageProps {
  entity:
    | "organization"
    | "contact"
    | "project"
    | "service"
    | "offer";
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase?: any; // Optional prop for external Supabase client
}

export default async function UnifiedEditPage({
  entity,
  id,
  supabase: externalSupabase,
}: UnifiedEditPageProps) {
  // Use external Supabase client if provided, otherwise create one
  const supabase = externalSupabase || (await createServerSupabaseClient());

  // Get the form configuration for this entity
  const config = formConfigs[entity];
  if (!config) {
    notFound();
  }

  // Fetch the entity data
  let entityData: Record<string, unknown> | null = null;
  try {
    switch (entity) {
      case "contact":
        entityData = await getEntityWithRelations(supabase, "contacts", id, {
          "organization:organizations(name, legal_name, country)": true,
        });
        break;
      case "organization":
        entityData = await getEntityWithRelations(
          supabase,
          "organizations",
          id
        );
        break;
      case "service":
        entityData = await getEntityWithRelations(supabase, "services", id);
        break;
      case "project":
        entityData = await getEntityWithRelations(supabase, "projects", id, {
          "organization:organizations(name, legal_name, country)": true,
        });
        break;
      case "offer": {
        const { data, error } = await supabase
          .from("offers")
          .select(
            `*, organization:organizations(id, name, legal_name, country), offer_services(count)`
          )
          .eq("id", id)
          .single();
        if (error) throw error;
        entityData = data;
        break;
      }
      default:
        notFound();
    }
  } catch (error) {
    console.error(`Error fetching ${entity} data:`, error);
    notFound();
  }

  if (!entityData) {
    notFound();
  }

  // Prepare form default values - use the entity data directly
  const formDefaultValues = entityData as Record<string, unknown>;

  // Fetch additional data based on entity type
  const additionalData = await (async () => {
    const base = {};

    if (entity === "contact") {
      const [organizations, projects] = await Promise.all([
        getEntitiesWithRelations(supabase, "organizations", {}, {}, { column: "name", ascending: true }),
        getEntitiesWithRelations(supabase, "projects", {
          "organization:organizations(name, legal_name, country)": true,
        }),
      ]);
      const organization_options = organizations.map((o: any) => ({
        id: o.id,
        name: o.name,
      }));
      const project_options = projects.map((p: any) => ({
        id: p.id,
        title: p.title,
        organization_id: (p as { organization_id?: string }).organization_id,
        organization_name: (p as { organization?: { name?: string } })
          .organization?.name,
      }));
      return {
        ...base,
        organization_options,
        project_options,
      };
    }
    if (entity === "organization") {
      const [contacts, projects] = await Promise.all([
        getEntitiesWithRelations(supabase, "contacts", {
          "organization:organizations(name)": true,
        }),
        getEntitiesWithRelations(supabase, "projects", {
          "organization:organizations(name, legal_name, country)": true,
        }),
      ]);
      const contact_options = contacts.map((c: any) => ({
        id: c.id,
        name: c.name,
        organization_id: (c as { organization_id?: string }).organization_id,
      }));
      const project_options = projects.map((p: any) => ({
        id: p.id,
        title: p.title,
        organization_id: (p as { organization_id?: string }).organization_id,
        organization_name: (p as { organization?: { name?: string } })
          .organization?.name,
      }));
      return {
        ...base,
        contact_options,
        project_options,
      };
    }
    if (entity === "project") {
      // For projects, ensure we always load the specific organization that is already associated
      const projectData = entityData as any;
      const organization_options: Array<{ id: string; name: string }> = [];

      // Handle organization - prefer relation data, but fallback to fetching if ID exists
      if (projectData.organization) {
        organization_options.push({
          id: projectData.organization.id,
          name:
            projectData.organization.name ||
            projectData.organization.legal_name ||
            "Unknown",
        });
      } else if (projectData.organization_id) {
        // Fallback: fetch organization directly if relation wasn't loaded
        try {
          const { data: org } = await supabase
            .from("organizations")
            .select("id, name, legal_name")
            .eq("id", projectData.organization_id)
            .single();
          if (org) {
            organization_options.push({
              id: org.id,
              name: org.name || org.legal_name || "Unknown",
            });
          }
        } catch (error) {
          console.error("Failed to fetch organization for project:", error);
        }
      }

      return {
        ...base,
        organization_options,
      };
    }
    if (entity === "offer") {
      const [
        corporateEntities,
        defaultCorporate,
        paymentTerms,
        deliveryConditions,
        linkPresets,
        offer_selected_link_ids,
        organizations,
      ] = await Promise.all([
        getCorporateEntitiesWrapper(supabase),
        getDefaultCorporateEntityWrapper(supabase),
        getPaymentTermsWrapper(supabase),
        getDeliveryConditionsWrapper(supabase),
        getOfferLinkPresetsWrapper(supabase),
        getOfferSelectedLinksWrapper(supabase, id),
        getEntitiesWithRelations(supabase, "organizations", {}, {}, { column: "name", ascending: true }),
      ]);

      const currency_options = [{ code: "EUR", symbol: "\u20AC" }];
      const corporate_entity_options = corporateEntities.map((e: any) => ({
        id: e.id,
        name: e.name,
      }));
      const existingId = (entityData as { corporate_entity_id?: string | null })
        .corporate_entity_id;
      const corporate_entity_default_id =
        defaultCorporate?.id || corporateEntities[0]?.id;
      const withDefault = existingId
        ? {}
        : { corporate_entity_id: corporate_entity_default_id };
      const organization_options = organizations.map((o: any) => ({
        id: o.id,
        name: o.name,
      }));

      // Normalize created_at into a date string for the form (YYYY-MM-DD)
      const createdRaw = (entityData as { created_at?: string }).created_at;
      const createdDate =
        createdRaw && !Number.isNaN(Date.parse(createdRaw))
          ? new Date(createdRaw).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

      return {
        ...base,
        ...withDefault,
        created_at: createdDate,
        organization_options,
        currency_options,
        corporate_entity_options,
        corporate_entity_default_id,
        payment_term_options: paymentTerms,
        delivery_condition_options: deliveryConditions,
        offer_link_options: linkPresets,
        offer_selected_link_ids,
      };
    }
    return base;
  })();

  // Merge entity data with additional data
  const mergedDefaultValues = {
    ...formDefaultValues,
    ...additionalData,
  };

  // Determine layout and sidebar component based on entity type
  const isOffer = entity === "offer";
  const shouldShowSidebar = !isOffer && entity !== "service";

  const getSidebarComponent = () => {
    switch (entity) {
      case "organization":
        return <OrganizationRelationsPanel organizationId={id} />;
      case "contact":
        return <ContactRelationsPanel contactId={id} />;
      case "project":
        return <ProjectRelationsPanel projectId={id} />;
      default:
        return null;
    }
  };

  const title =
    (entityData?.name as string) ||
    (entityData?.title as string) ||
    `Edit ${config.entityName}`;

  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <EditPageLayout
        title={title}
        backLink={`/dashboard/${entity === "offer" ? "offers" : entity + "s"}`}
        layout={isOffer ? "half" : "wide"}
        defaultLocked={true}
      >
        {/* Left column - Form */}
        <EditPageSection
          colSpan={isOffer ? 1 : shouldShowSidebar ? 2 : 3}
          layout={isOffer ? "half" : "wide"}
        >
          <EditPageFormSection>
            <UnifiedFormClient
              entityType={entity}
              defaultValues={mergedDefaultValues}
              mode="edit"
              title={title}
              layoutVariant={isOffer ? "half" : "wide"}
            />
          </EditPageFormSection>
        </EditPageSection>

        {/* Right column - Sidebar components */}
        {isOffer && (
          <EditPageSection colSpan={1} layout="half">
            <div className="bg-white dark:bg-[var(--card)] rounded-lg minimal-shadow minimal-border p-6">
              <ServicesPanel
                currency="EUR"
                discountType={entityData?.discount_type as string}
                globalDiscountPercentage={
                  entityData?.global_discount_percentage as number
                }
                taxPercentage={entityData?.tax_percentage as number}
                taxReason={entityData?.tax_reason as string}
                mode="edit"
              />
            </div>
          </EditPageSection>
        )}

        {shouldShowSidebar && (
          <EditPageSection colSpan={1} layout="wide">
            <EditPageRelationsSection>
              {getSidebarComponent()}
            </EditPageRelationsSection>
          </EditPageSection>
        )}
      </EditPageLayout>
    </Suspense>
  );
}
