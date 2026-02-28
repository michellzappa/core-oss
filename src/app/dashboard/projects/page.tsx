import type { Metadata } from "next";
import StaticEntityIndexPage from "@/components/features/entities/static-entity-index-page";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createSearchParamsCache, parseAsString } from "nuqs/server";
import { generatePageTitle } from "@/lib/metadata-utils";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: generatePageTitle("Projects", "/dashboard/projects"),
  };
}

export default async function ProjectsPage({
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
  const { data: projects, error } = await supabase
    .from("projects")
    .select(
      `
      *,
      organization:organizations(name, legal_name, country)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects");
  }

  const items = projects || [];

  return (
    <StaticEntityIndexPage
      entity="projects"
      supabase={supabase as any}
      initial={initial}
      items={items}
    />
  );
}
