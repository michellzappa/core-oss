import { Metadata } from "next";
import EntityEditPage from "@/components/features/entities/entity-edit-page";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Service Details | Core",
  description: "View and edit service details",
};

interface ServicePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ServicePage({ params }: ServicePageProps) {
  const unwrappedParams = await params;
  const supabase = await createServerSupabaseClient();

  return (
    <EntityEditPage
      entity="services"
      id={unwrappedParams.id}
      supabase={supabase}
    />
  );
}
