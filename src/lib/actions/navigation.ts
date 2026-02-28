"use server";

import { organizationService } from "@/lib/api/organizations";
import { contactService } from "@/lib/api/contacts";
import { projectService } from "@/lib/api/projects";
import { offerService } from "@/lib/api/offers";
import { serviceService } from "@/lib/api/services";
import { getOfferDisplayLabel } from "@/lib/utils";

interface ContentItem {
  id: string;
  name: string;
  href: string;
  description?: string;
  status?: string;
  imageUrl?: string;
  fallback?: string;
}

export interface CommandPaletteInitialData {
  organizations: ContentItem[];
  contacts: ContentItem[];
  projects: ContentItem[];
  offers: ContentItem[];
  services: ContentItem[];
}

export async function getCommandPaletteInitialData(): Promise<CommandPaletteInitialData> {
  const [organizations, contacts, projects, offers, services] = await Promise.all([
    organizationService.getAll(),
    contactService.getAll(),
    projectService.getAll(),
    offerService.getAll(),
    serviceService.getAll(),
  ]);

  return {
    organizations: organizations.map((org) => ({
      id: org.id,
      name: (org as unknown as { name?: string; legal_name?: string }).name ||
        (org as unknown as { legal_name?: string }).legal_name ||
        "Unnamed Organization",
      href: `/dashboard/organizations/${org.id}`,
      description: (org as unknown as { legal_name?: string; country?: string }).legal_name ||
        (org as unknown as { country?: string }).country,
      imageUrl: (org as unknown as { profile_image_url?: string })?.profile_image_url || undefined,
      fallback: (org as unknown as { name?: string; legal_name?: string }).name ||
        (org as unknown as { legal_name?: string }).legal_name ||
        "?",
    })),
    contacts: contacts.map((c) => ({
      id: c.id,
      name: (c as unknown as { name?: string }).name as string,
      href: `/dashboard/contacts/${c.id}`,
      description: (c as unknown as { email?: string; company_role?: string }).email ||
        (c as unknown as { company_role?: string }).company_role,
      imageUrl: (c as unknown as { profile_image_url?: string })?.profile_image_url || undefined,
      fallback: (c as unknown as { name?: string }).name as string,
    })),
    projects: projects.map((project) => ({
      id: project.id,
      name: (project as unknown as { title?: string }).title as string,
      href: `/dashboard/projects/${project.id}`,
      description: (project as unknown as { status?: string }).status as string,
      status: (project as unknown as { status?: string }).status as string,
    })),
    offers: offers.map((offer) => ({
      id: offer.id,
      name: getOfferDisplayLabel(offer as Parameters<typeof getOfferDisplayLabel>[0]),
      href: `/dashboard/offers/${offer.id}`,
      description: (offer as unknown as { status?: string }).status as string,
      status: (offer as unknown as { status?: string }).status as string,
    })),
    services: services.map((s) => ({
      id: s.id,
      name: (s as unknown as { name?: string }).name as string,
      href: `/dashboard/services/${s.id}`,
      description: (s as unknown as { description?: string }).description as string,
    })),
  };
}
