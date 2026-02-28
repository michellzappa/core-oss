"use client";

import { useEffect, useMemo, useState } from "react";
import LinkedItems, {
  type LinkedItem,
} from "@/components/ui/composite/linked-items";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Building2, FileText } from "lucide-react";
import { getOfferDisplayLabel } from "@/lib/utils";

interface ContactRelationsPanelProps {
  contactId: string;
}

export default function ContactRelationsPanel({
  contactId,
}: ContactRelationsPanelProps) {
  const [organization, setOrganization] = useState<LinkedItem | null>(null);
  const [offers, setOffers] = useState<LinkedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    async function load() {
      try {
        // Fetch the contact with its organization
        const { data: contact } = await supabase
          .from("contacts")
          .select("id, organization_id, organization:organizations(id, name)")
          .eq("id", contactId)
          .single();

        const contactRow = contact as any;
        if (contactRow?.organization && typeof contactRow.organization === "object") {
          const org = contactRow.organization as { id: string; name: string };
          setOrganization({
            id: org.id,
            name: org.name,
            href: `/dashboard/organizations/${org.id}`,
          });
        } else {
          setOrganization(null);
        }

        // Fetch offers where this contact is the contact_id
        const { data: contactOffers } = await supabase
          .from("offers")
          .select("id, title, status, organization:organizations(id, name, legal_name), valid_until")
          .eq("contact_id", contactId)
          .order("created_at", { ascending: false });

        setOffers(
          ((contactOffers || []) as any[]).map((offer) => ({
            id: offer.id,
            name: getOfferDisplayLabel(offer),
            href: `/dashboard/offers/${offer.id}`,
            tag: offer.status,
          })),
        );
      } catch (error) {
        console.error("Error loading contact relations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [contactId, supabase]);

  return (
    <div className="space-y-4">
      {organization && (
        <LinkedItems
          config={{
            title: "Organization",
            items: [organization],
            createNewHref: organization.href,
            createNewLabel: "View Organization",
            emptyMessage: "No organization",
            isLoading,
            icon: Building2,
          }}
        />
      )}

      <LinkedItems
        config={{
          title: "Offers",
          items: offers,
          createNewHref: `/dashboard/offers/new?contact_id=${contactId}`,
          createNewLabel: "Add Offer",
          emptyMessage: "No offers",
          isLoading,
          icon: FileText,
        }}
      />
    </div>
  );
}
