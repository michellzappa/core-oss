import type { Metadata } from "next";
import StaticEntityIndexPage from "@/components/features/entities/static-entity-index-page";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { generatePageTitle } from "@/lib/metadata-utils";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: generatePageTitle("Offers", "/dashboard/offers"),
  };
}

export default async function OffersPage({
  searchParams,
}: {
  searchParams?: Promise<unknown>;
}) {
  const supabase = await createServerSupabaseClient();

  // Parse search params at the page level
  let initial: Record<string, string> = {};
  try {
    const search = createSearchParamsCache({
      q: parseAsString.withDefault(""),
      view: parseAsString.withDefault(""),
      f_status: parseAsString.withDefault(""),
      f_org: parseAsString.withDefault(""),
      f_contact: parseAsString.withDefault(""),
      f_currency: parseAsString.withDefault(""),
      f_country: parseAsString.withDefault(""),
      f_priority: parseAsString.withDefault(""),
      f_project: parseAsString.withDefault(""),
      f_is_overdue: parseAsString.withDefault(""),
      f_type: parseAsString.withDefault(""),
      f_group: parseAsString.withDefault(""),
      f_public: parseAsString.withDefault(""),
    });

    initial = await search.parse(searchParams ?? Promise.resolve({}));
  } catch (error) {
    console.error("Error parsing search params:", error);
    initial = {};
  }

  // Fetch data directly using Supabase (not cached functions)
  const { data: offers, error } = await supabase
    .from("offers")
    .select(
      `
      *,
      organization:organizations(name, legal_name, country),
      offer_services:offer_services(
        id,
        is_custom,
        custom_title,
        quantity,
        services:service_id(
          name,
          icon
        )
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching offers:", error);
    throw new Error("Failed to fetch offers");
  }

  // Fetch visit counts excluding @envisioning emails
  const offerIds = (offers || []).map((offer: any) => offer.id);
  let visitCounts: { offer_id: string; accessed_email?: string }[] = [];

  if (offerIds.length > 0) {
    const { data } = await supabase
      .from("offer_access_logs")
      .select("offer_id, accessed_email")
      .in("offer_id", offerIds);

    // Filter out @envisioning.com and @envisioning.io emails
    visitCounts = ((data as any[]) || []).filter(
      (log: any) =>
        !log.accessed_email ||
        (!log.accessed_email.endsWith("@envisioning.com") &&
          !log.accessed_email.endsWith("@envisioning.io")),
    );
  }

  // Create a map of offer_id to visit count
  const visitCountMap = new Map<string, number>();
  visitCounts.forEach((log) => {
    const count = visitCountMap.get(log.offer_id) || 0;
    visitCountMap.set(log.offer_id, count + 1);
  });

  // Transform the data to include services count and visit count
  const items = (offers || []).map((offer: any) => {
    const offerServices = offer.offer_services || [];

    const servicesCount = Array.isArray(offerServices)
      ? offerServices.length
      : 0;

    return {
      ...offer,
      services_count: servicesCount,
      client_visits: visitCountMap.get(offer.id) || 0,
    };
  });

  return (
    <StaticEntityIndexPage
      entity="offers"
      supabase={supabase as any}
      initial={initial}
      items={items}
    />
  );
}
