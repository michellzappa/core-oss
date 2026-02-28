import { Metadata } from "next";
import { Suspense } from "react";
import { EntityErrorBoundary } from "@/components/error-boundaries/entity-error-boundary";
import { PageContentSkeleton } from "@/components/layouts/pages/page-layout";
import EntityCreatePage from "@/components/features/entities/entity-create-page";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  getEntitiesWithRelations,
  getCorporateEntitiesWrapper,
  getDefaultCorporateEntityWrapper,
  getPaymentTermsWrapper,
  getDeliveryConditionsWrapper,
  getOfferLinkPresetsWrapper,
} from "@/lib/server-data";

export const metadata: Metadata = {
  title: "Create New Offer | Core",
  description: "Create a new offer",
};

interface OfferCreatePageProps {
  searchParams: Promise<{
    organization_id?: string;
  }>;
}

export default async function OfferCreatePage({
  searchParams,
}: OfferCreatePageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  const defaultExpiryDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  const [
    organizations,
    corporateEntities,
    defaultCorporate,
    paymentTerms,
    deliveryConditions,
    linkPresets,
  ] = await Promise.all([
    getEntitiesWithRelations(supabase, 'organizations', {}, {}, { column: 'name', ascending: true }),
    getCorporateEntitiesWrapper(supabase),
    getDefaultCorporateEntityWrapper(supabase),
    getPaymentTermsWrapper(supabase),
    getDeliveryConditionsWrapper(supabase),
    getOfferLinkPresetsWrapper(supabase),
  ]);

  const organizationOptions = organizations.map((o: any) => ({
    id: o.id,
    name: o.name,
  }));
  const currencyOptions = [{ code: "EUR", symbol: "€" }];
  const corporateEntityOptions = corporateEntities.map((e: any) => ({
    id: e.id,
    name: e.name,
  }));
  const corporateEntityDefaultId =
    defaultCorporate?.id || corporateEntities[0]?.id;

  const defaultValues: Record<string, unknown> = {
    organization_id: params.organization_id || "",
    currency: "EUR",
    discount_type: "none",
    global_discount_percentage: 0,
    status: "sent",
    created_at: today,
    valid_until: defaultExpiryDate,
    organization_options: organizationOptions,
    currency_options: currencyOptions,
    corporate_entity_options: corporateEntityOptions,
    corporate_entity_default_id: corporateEntityDefaultId,
    corporate_entity_id: corporateEntityDefaultId,
    payment_term_options: paymentTerms,
    delivery_condition_options: deliveryConditions,
    offer_link_options: linkPresets,
    offer_selected_link_ids: [],
  };

  return (
    <EntityErrorBoundary entityName="Offer">
      <Suspense fallback={<PageContentSkeleton />}>
        <EntityCreatePage entity="offers" defaults={defaultValues} />
      </Suspense>
    </EntityErrorBoundary>
  );
}
