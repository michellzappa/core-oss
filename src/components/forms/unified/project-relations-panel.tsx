"use client";

import { useEffect, useMemo, useState } from "react";
import LinkedItems, {
  type LinkedItem,
} from "@/components/ui/composite/linked-items";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Building2, FileText, Package } from "lucide-react";
import { getOfferDisplayLabel } from "@/lib/utils";

interface ProjectRelationsPanelProps {
  projectId: string;
}

interface DerivedService {
  id: string;
  service_id?: string;
  name: string;
  price: number;
  currency: string;
  offer_title?: string;
  is_custom: boolean;
  group_type?: string;
}

export default function ProjectRelationsPanel({
  projectId,
}: ProjectRelationsPanelProps) {
  const [organization, setOrganization] = useState<LinkedItem | null>(null);
  const [offers, setOffers] = useState<LinkedItem[]>([]);
  const [derivedServices, setDerivedServices] = useState<DerivedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  useEffect(() => {
    async function load() {
      try {
        // Fetch the project with its organization
        const { data: project } = await supabase
          .from("projects")
          .select(
            "id, organization_id, organization:organizations(id, name)",
          )
          .eq("id", projectId)
          .single();

        const projectRow = project as any;
        if (projectRow?.organization && typeof projectRow.organization === "object") {
          const org = projectRow.organization as { id: string; name: string };
          setOrganization({
            id: org.id,
            name: org.name,
            href: `/dashboard/organizations/${org.id}`,
          });

          // Fetch offers linked to the same organization
          const { data: orgOffers } = await supabase
            .from("offers")
            .select(
              "id, title, status, organization:organizations(id, name, legal_name), valid_until",
            )
            .eq("organization_id", org.id)
            .order("created_at", { ascending: false });

          setOffers(
            ((orgOffers || []) as any[]).map((offer) => ({
              id: offer.id,
              name: getOfferDisplayLabel(offer),
              href: `/dashboard/offers/${offer.id}`,
              tag: offer.status,
            })),
          );

          // Fetch derived services from the organization's offers
          const { data: offersWithServices } = await supabase
            .from("offers")
            .select(
              `
              id,
              title,
              currency,
              offer_services(
                id,
                service_id,
                custom_title,
                is_custom,
                price,
                quantity,
                services(name, summary, group_type)
              )
            `,
            )
            .eq("organization_id", org.id)
            .eq("is_accepted", true);

          if (offersWithServices && offersWithServices.length > 0) {
            const servicesList: DerivedService[] = [];
            offersWithServices.forEach((offer: any) => {
              if (offer.offer_services) {
                offer.offer_services.forEach((offerService: any) => {
                  if (offerService.is_custom) {
                    servicesList.push({
                      id: offerService.id,
                      name: offerService.custom_title,
                      price: offerService.price,
                      currency: offer.currency,
                      offer_title: offer.title,
                      is_custom: true,
                      group_type: "Custom",
                    });
                  } else if (offerService.services) {
                    servicesList.push({
                      id: `offer-service-${offerService.id}`,
                      service_id: offerService.service_id,
                      name: offerService.services.name,
                      price: offerService.price,
                      currency: offer.currency,
                      offer_title: offer.title,
                      is_custom: false,
                      group_type:
                        offerService.services.group_type || "Other",
                    });
                  }
                });
              }
            });

            // Sort services by group type
            const groupOrder: Record<string, number> = {
              base: 1,
              research: 2,
              optional: 3,
              license: 100,
            };

            const sorted = [...servicesList].sort((a, b) => {
              const orderA =
                groupOrder[(a.group_type || "").toLowerCase()] || 50;
              const orderB =
                groupOrder[(b.group_type || "").toLowerCase()] || 50;
              if (orderA !== orderB) return orderA - orderB;
              return a.name.localeCompare(b.name);
            });

            setDerivedServices(sorted);
          }
        } else {
          setOrganization(null);
        }
      } catch (error) {
        console.error("Error loading project relations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [projectId, supabase]);

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
          createNewHref: organization
            ? `/dashboard/offers/new?organization_id=${organization.id}`
            : "/dashboard/offers/new",
          createNewLabel: "Add Offer",
          emptyMessage: "No offers",
          isLoading,
          icon: FileText,
        }}
      />

      {derivedServices.length > 0 && (
        <LinkedItems
          config={{
            title: "Deliverables",
            items: derivedServices.map((service) => ({
              id: service.id,
              name: service.name,
              tag: service.group_type || "Other",
              href: service.is_custom
                ? "#"
                : `/dashboard/services/${service.service_id || service.id}`,
            })),
            createNewHref: "",
            createNewLabel: "",
            emptyMessage: "No services",
            isLoading,
            icon: Package,
          }}
        />
      )}
    </div>
  );
}
