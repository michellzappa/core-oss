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
    .from("projects")
    .select("title")
    .eq("id", id)
    .maybeSingle();
  
  const pageName = (data as any)?.title || "Project";
  return {
    title: generatePageTitle(pageName, "/dashboard/projects"),
  };
}

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const unwrappedParams = await params;
  const supabase = await createServerSupabaseClient();

  return (
    <EntityEditPage
      entity="projects"
      id={unwrappedParams.id}
      supabase={supabase}
    />
  );
}
