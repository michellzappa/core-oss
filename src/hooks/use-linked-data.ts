"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { LinkedItem } from "@/components/ui/composite/linked-items";
import { getOfferDisplayLabel } from "@/lib/utils";

export interface UseLinkedDataOptions {
  organizationId?: string;
  userId?: string;
  contactId?: string;
}

export interface UnlinkResult {
  success: boolean;
  error?: string;
}

export function useLinkedData(options: UseLinkedDataOptions) {
  const { organizationId } = options;
  const [linkedContacts, setLinkedContacts] = useState<LinkedItem[]>([]);
  const [linkedProjects, setLinkedProjects] = useState<LinkedItem[]>([]);
  const [linkedOffers, setLinkedOffers] = useState<LinkedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cast to any to work around Supabase Database type `never` inference
  const supabase = useMemo(() => createBrowserSupabaseClient() as any, []);

  const fetchLinkedData = useCallback(async () => {
    if (!organizationId) {
      setLinkedContacts([]);
      setLinkedProjects([]);
      setLinkedOffers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const { data: contacts } = await supabase
        .from("contacts")
        .select("id, name, email, company_role")
        .eq("organization_id", organizationId)
        .order("name");

      setLinkedContacts(
        ((contacts as any[]) || []).map((contact) => ({
          id: contact.id,
          name: contact.name,
          href: `/dashboard/contacts/${contact.id}`,
          subtitle: contact.email,
        }))
      );

      const { data: projects } = await supabase
        .from("projects")
        .select("id, title, status")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      setLinkedProjects(
        ((projects as any[]) || []).map((project) => ({
          id: project.id,
          name: project.title,
          href: `/dashboard/projects/${project.id}`,
          tag: project.status,
        }))
      );

      const { data: offers } = await supabase
        .from("offers")
        .select("id, title, status")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      setLinkedOffers(
        ((offers as any[]) || []).map((offer) => ({
          id: offer.id,
          name: getOfferDisplayLabel(offer),
          href: `/dashboard/offers/${offer.id}`,
          tag: offer.status,
        }))
      );
    } catch (error) {
      console.error("Error fetching linked data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, supabase]);

  useEffect(() => {
    fetchLinkedData();
  }, [fetchLinkedData]);

  const unlinkContactFromOrganization = useCallback(
    async (contactToUnlinkId: string): Promise<UnlinkResult> => {
      if (!organizationId) {
        return { success: false, error: "Missing organization context" };
      }

      try {
        const { error } = await supabase
          .from("contacts")
          .update({ organization_id: null })
          .eq("id", contactToUnlinkId)
          .eq("organization_id", organizationId);

        if (error) {
          console.error("Failed to unlink contact:", error);
          return { success: false, error: error.message };
        }

        await fetchLinkedData();
        return { success: true };
      } catch (error) {
        console.error("Unexpected error unlinking contact:", error);
        return { success: false, error: "Unexpected error unlinking contact" };
      }
    },
    [organizationId, supabase, fetchLinkedData]
  );

  const unlinkProjectFromOrganization = useCallback(
    async (projectToUnlinkId: string): Promise<UnlinkResult> => {
      if (!organizationId) {
        return { success: false, error: "Missing organization context" };
      }

      try {
        const { error } = await supabase
          .from("projects")
          .update({ organization_id: null })
          .eq("id", projectToUnlinkId)
          .eq("organization_id", organizationId);

        if (error) {
          console.error("Failed to unlink project:", error);
          return { success: false, error: error.message };
        }

        await fetchLinkedData();
        return { success: true };
      } catch (error) {
        console.error("Unexpected error unlinking project:", error);
        return { success: false, error: "Unexpected error unlinking project" };
      }
    },
    [organizationId, supabase, fetchLinkedData]
  );

  return {
    linkedContacts,
    linkedProjects,
    linkedOffers,
    isLoading,
    refresh: fetchLinkedData,
    unlinkContactFromOrganization,
    unlinkProjectFromOrganization,
  };
}
