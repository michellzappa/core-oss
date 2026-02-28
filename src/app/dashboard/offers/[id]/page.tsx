import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { EntityErrorBoundary } from "@/components/error-boundaries/entity-error-boundary";
import { PageContentSkeleton } from "@/components/layouts/pages/page-layout";
import { Suspense } from "react";
import UnifiedEditPage from "@/components/forms/unified/unified-edit-page";
import { generatePageTitle } from "@/lib/metadata-utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("offers")
    .select("title")
    .eq("id", id)
    .maybeSingle();
  
  const pageName = (data as any)?.title || "Offer";
  return {
    title: generatePageTitle(pageName, "/dashboard/offers"),
  };
}

interface OfferPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OfferPageServer({ params }: OfferPageProps) {
  const unwrappedParams = await params;
  const { id } = unwrappedParams;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return notFound();
  }

  // Fetch offer
  const { data: offer, error: offerError } = await supabase
    .from("offers")
    .select(`*`)
    .eq("id", id)
    .single();

  if (offerError || !offer) {
    return notFound();
  }

  return (
    <EntityErrorBoundary entityName="Offer">
      <Suspense fallback={<PageContentSkeleton />}>
        <UnifiedEditPage entity="offer" id={id} />
      </Suspense>
    </EntityErrorBoundary>
  );
}
