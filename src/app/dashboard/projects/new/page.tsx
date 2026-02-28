import type { Metadata } from "next";
import { Suspense } from "react";
import { EntityErrorBoundary } from "@/components/error-boundaries/entity-error-boundary";
import { PageContentSkeleton } from "@/components/layouts/pages/page-layout";
import EntityCreatePage from "@/components/features/entities/entity-create-page";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generatePageTitle } from "@/lib/metadata-utils";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: generatePageTitle("New Project", "/dashboard/projects/new"),
  };
}

interface NewProjectPageProps {
  searchParams: Promise<{
    organization_id?: string;
  }>;
}

export default async function NewProjectPage({
  searchParams,
}: NewProjectPageProps) {
  const params = await searchParams;
  const supabase = await createServerSupabaseClient();

  let organizationOptions: Array<{ id: string; name: string }> = [];

  if (params.organization_id) {
    // Load specific organization
    const { data: organization } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("id", params.organization_id)
      .single();

    if (organization) {
      organizationOptions = [{ id: (organization as any).id, name: (organization as any).name }];
    }
  }

  return (
    <EntityErrorBoundary entityName="Project">
      <Suspense fallback={<PageContentSkeleton />}>
        <EntityCreatePage
          entity="projects"
          defaults={{
            status: "Active",
            organization_id: params.organization_id || "",
            organization_options: organizationOptions,
          }}
        />
      </Suspense>
    </EntityErrorBoundary>
  );
}
