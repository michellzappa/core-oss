import type { Metadata } from "next";
import EntityEditPage from "@/components/features/entities/entity-edit-page";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generatePageTitle } from "@/lib/metadata-utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  
  const pageName = (data as any)?.name || "Organization";
  return {
    title: generatePageTitle(pageName, "/dashboard/organizations"),
  };
}

interface OrganizationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const unwrappedParams = await params;
  const supabase = await createServerSupabaseClient();

  return (
    <EntityEditPage
      entity="organizations"
      id={unwrappedParams.id}
      supabase={supabase}
    />
  );
}
