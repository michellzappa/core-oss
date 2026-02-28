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
    .from("contacts")
    .select("name")
    .eq("id", id)
    .maybeSingle();
  
  const pageName = (data as any)?.name || "Contact";
  return {
    title: generatePageTitle(pageName, "/dashboard/contacts"),
  };
}

interface ContactPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContactPage({ params }: ContactPageProps) {
  const unwrappedParams = await params;
  const supabase = await createServerSupabaseClient();

  return (
    <EntityEditPage
      entity="contacts"
      id={unwrappedParams.id}
      supabase={supabase}
    />
  );
}
