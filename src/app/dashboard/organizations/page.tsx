import type { Metadata } from "next";
import StaticEntityIndexPage from "@/components/features/entities/static-entity-index-page";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { generatePageTitle } from "@/lib/metadata-utils";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: generatePageTitle("Organizations", "/dashboard/organizations"),
  };
}

export default async function OrganizationsPage({
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
  const { data: organizations, error } = await supabase
    .from("organizations")
    .select(
      `
      *,
      contacts!inner(count)
    `
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching organizations:", error);
    throw new Error("Failed to fetch organizations");
  }

  // Transform the data to include contact count
  const items = (organizations || []).map((org: any) => ({
    ...org,
    contact_count: Array.isArray(org.contacts) ? org.contacts.length : 0,
  }));

  return (
    <StaticEntityIndexPage
      entity="organizations"
      supabase={supabase as any}
      initial={initial}
      items={items}
    />
  );
}
