"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { offerService } from "@/lib/api/offers";
import type { Offer } from "@/lib/api/offers";
import { offerCreateSchema, offerUpdateSchema } from "@/lib/validation/schemas";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  createActionResponse,
  handleActionError,
  validateFormData,
  handleFailedAction,
  isForeignKeyConstraintError,
  type ActionResponse,
} from "./utils";

// Create a new offer
export async function createOffer(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    const supabase = await createServerSupabaseClient();

    // Validate form data
    const validation = validateFormData(formData, offerCreateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error);
    }

    // Debug: log incoming selected links on create
    try {
      const dbg = (validation.data as Record<string, unknown>)?.offer_selected_link_ids as unknown;
      console.log("[createOffer] offer_selected_link_ids (validated):", dbg);
    } catch {}

    // Read mirrored services
    let services: Array<Record<string, unknown>> = [];
    const servicesHidden = formData.get("services_hidden");
    if (servicesHidden && typeof servicesHidden === "string") {
      try {
        services = JSON.parse(servicesHidden);
      } catch {}
    }

    // Derive an automatic title based on organization and year
    const dataRecord = validation.data as Record<string, unknown>;
    const organizationId = dataRecord.organization_id as string | undefined;
    let organizationName: string | undefined;

    if (organizationId) {
      try {
        const { data: org } = await supabase
          .from("organizations")
          .select("name, legal_name")
          .eq("id", organizationId)
          .maybeSingle();
        if (org) {
          organizationName = (org as { name?: string | null }).name
            || (org as { legal_name?: string | null }).legal_name
            || undefined;
        }
      } catch (e) {
        console.warn("[createOffer] Failed to fetch organization name for title:", e);
      }
    }

    const createdRaw = (dataRecord.created_at as string | null | undefined) ?? undefined;
    const createdDate =
      createdRaw && !Number.isNaN(Date.parse(createdRaw))
        ? new Date(createdRaw)
        : new Date();
    const year = createdDate.getFullYear();
    const computedTitle = organizationName
      ? `${organizationName} ${year}`
      : `Offer ${year}`;

    // Compute total using ONLY global discount (ignore per-item discounts)
    // Note: calculated after normalizing services for numeric safety

    // Create the offer with services
    // Normalize null service_id to undefined to satisfy type
    const normalized = (services as Array<{
      service_id?: string | null;
      quantity: number;
      price: number;
      discount_percentage?: number;
      is_custom?: boolean;
      custom_title?: string | null;
      custom_description?: string | null;
    }>).map((s) => ({
      service_id: s.service_id ?? undefined,
      quantity: Number(s.quantity ?? 1),
      price: Number(s.price ?? 0),
      discount_percentage:
        typeof s.discount_percentage === "number"
          ? s.discount_percentage
          : undefined,
      is_custom: Boolean(s.is_custom),
      custom_title: s.custom_title ?? undefined,
      custom_description: s.custom_description ?? undefined,
    }));

    const subtotal = normalized.reduce(
      (sum, s) => sum + Number(s.price) * Number(s.quantity),
      0
    );
    const globalPct = Number(
      (validation.data as Record<string, unknown>)?.global_discount_percentage || 0
    );
    const discountedTotal = subtotal * (1 - (globalPct > 0 ? globalPct / 100 : 0));

    // Remove helper-only fields that are not DB columns
    const { offer_selected_link_ids: _ignoreLinks, ...offerToCreate } = validation.data as Record<string, unknown>;
    // Ensure discounted total is persisted
    (offerToCreate as Record<string, unknown>).total_amount = Math.max(0, Math.round(discountedTotal));
    // Always persist the auto-generated title (no manual title field in UI)
    (offerToCreate as Record<string, unknown>).title = computedTitle;
    void _ignoreLinks; // keep for clarity; value is intentionally discarded

    const result = await offerService.createOfferWithServices(
      offerToCreate as unknown as Omit<Offer, 'id' | 'created_at' | 'updated_at'>,
      normalized
    );

    // Persist selected links if provided (from hidden field or parsed array)
    const linkIdsRaw = (validation.data as Record<string, unknown>).offer_selected_link_ids as string[] | undefined;
    if (Array.isArray(linkIdsRaw) && linkIdsRaw.length > 0) {
      try {
        console.log("[createOffer] Persisting selected links:", linkIdsRaw);
        await offerService.setSelectedLinks(result.offer.id, linkIdsRaw);
      } catch (e) {
        console.warn('Failed to set selected links for offer:', e);
      }
    }

    // Revalidate paths and redirect
    revalidatePath("/dashboard/offers");
    redirect("/dashboard/offers");
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Update an existing offer
export async function updateOffer(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get the offer ID from form data
    const offerId = formData.get("id") as string;
    if (!offerId) {
      return handleFailedAction("Offer ID is required");
    }

    // Validate form data
    const validation = validateFormData(formData, offerUpdateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error);
    }

    // Fetch existing offer + services once so we can re-use for title + totals
    let withServices:
      | { offer: Offer; services: Array<Record<string, unknown>> }
      | null = null;
    try {
      const fetched = await offerService.getOfferWithServices(offerId);
      withServices = fetched
        ? (fetched as unknown as {
            offer: Offer;
            services: Array<Record<string, unknown>>;
          })
        : null;
    } catch (e) {
      console.warn("[updateOffer] Failed to load offer with services:", e);
    }

    // Update the offer
    console.log('[updateOffer] incoming payload (validated):', validation.data);
    // Sanitize nulls to undefined to satisfy Partial<Offer>
    const sanitizedData = Object.fromEntries(
      Object.entries(validation.data as Record<string, unknown>).map(
        ([key, value]) => [key, value === null ? undefined : value]
      )
    ) as Partial<Offer>;
    // Ensure helper-only fields are not sent to DB
    delete (sanitizedData as Record<string, unknown>).offer_selected_link_ids;

    // If no explicit title provided, auto-generate "<Organization name> <year>"
    if (!sanitizedData.title) {
      let organizationId = sanitizedData.organization_id as string | undefined;
      if (!organizationId && withServices?.offer?.organization_id) {
        organizationId = withServices.offer.organization_id;
      }

      let organizationName: string | undefined;
      if (organizationId) {
        try {
          const { data: org } = await supabase
            .from("organizations")
            .select("name, legal_name")
            .eq("id", organizationId)
            .maybeSingle();
          if (org) {
            organizationName = (org as { name?: string | null }).name
              || (org as { legal_name?: string | null }).legal_name
              || undefined;
          }
        } catch (e) {
          console.warn("[updateOffer] Failed to fetch organization name for title:", e);
        }
      }

      const createdRaw =
        (sanitizedData.created_at as string | undefined) ??
        (withServices?.offer?.created_at as string | undefined);
      const createdDate =
        createdRaw && !Number.isNaN(Date.parse(createdRaw))
          ? new Date(createdRaw)
          : new Date();
      const year = createdDate.getFullYear();

      sanitizedData.title = organizationName
        ? `${organizationName} ${year}`
        : `Offer ${year}`;
    }
    
    // Recalculate total using ONLY global discount based on existing services
    try {
      if (!withServices) {
        const fetched = await offerService.getOfferWithServices(offerId);
        withServices = fetched
          ? (fetched as unknown as {
              offer: Offer;
              services: Array<Record<string, unknown>>;
            })
          : null;
      }
      if (withServices) {
        const services = withServices.services || [];
        const subtotal = services.reduce((sum: number, s: any) => sum + Number(s.price || 0) * Number(s.quantity || 0), 0);
        const pct = typeof sanitizedData.global_discount_percentage === 'number'
          ? sanitizedData.global_discount_percentage
          : Number((withServices.offer as any).global_discount_percentage || 0);
        const discountedTotal = subtotal * (1 - (pct > 0 ? pct / 100 : 0));
        sanitizedData.total_amount = Math.max(0, Math.round(discountedTotal));
      }
    } catch (e) {
      console.warn('[updateOffer] Failed to recalculate discounted total; proceeding without change:', e);
    }

    console.log('[updateOffer] sanitized payload to update():', sanitizedData);
    await offerService.update(offerId, sanitizedData);

    // Update selected links: accept either aggregated checkbox array or JSON string
    let linkIds: string[] | null = null;
    const rawLinks = formData.getAll('offer_selected_link_ids') as unknown[];
    if (rawLinks && rawLinks.length > 0) {
      linkIds = rawLinks.map(String);
      console.log('[updateOffer] checkbox offer_selected_link_ids:', linkIds);
    } else {
      const linkIdsHidden = formData.get('offer_selected_link_ids');
      console.log('[updateOffer] raw offer_selected_link_ids from FormData:', linkIdsHidden);
      if (typeof linkIdsHidden === 'string' && linkIdsHidden.trim().length > 0) {
        try {
          const parsed = JSON.parse(linkIdsHidden);
          if (Array.isArray(parsed)) linkIds = parsed as string[];
          console.log('[updateOffer] parsed offer_selected_link_ids:', linkIds);
        } catch {}
      }
    }
    if (Array.isArray(linkIds)) {
      try {
        console.log('[updateOffer] Persisting selected links:', linkIds);
        await offerService.setSelectedLinks(offerId, linkIds);
      } catch (e) {
        console.warn('Failed to update selected links for offer:', e);
      }
    }

    // Revalidate paths and redirect
    revalidatePath("/dashboard/offers");
    revalidatePath(`/dashboard/offers/${offerId}`);
    redirect("/dashboard/offers");
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Delete an offer
export async function deleteOffer(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<{ success: boolean } | null>> {
  try {
    const offerId = formData.get("id") as string;
    if (!offerId) {
      return handleFailedAction("Offer ID is required");
    }

        await offerService.delete(offerId);
    
    // Revalidate paths
    revalidatePath("/dashboard/offers");
    
    return createActionResponse({ success: true });
  } catch (error) {
    // Handle foreign key constraint errors specifically
    if (isForeignKeyConstraintError(error)) {
      return createActionResponse(null, 
        "Cannot delete this offer because it has related data."
      );
    }
    
    return createActionResponse(null, handleActionError(error));
  }
}

// Get an offer by ID (for edit forms)
export async function getOffer(id: string): Promise<ActionResponse<unknown>> {
  try {
    const offer = await offerService.getById(id);
    
    if (!offer) {
      return handleFailedAction("Offer not found");
    }
    
    return createActionResponse(offer);
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Get all offers (for list pages)
export async function getOffers(): Promise<ActionResponse<unknown[] | null>> {
  try {
    const offers = await offerService.getAll();
    return createActionResponse(offers);
  } catch (error) {
    return createActionResponse(null, handleActionError(error));
  }
}

// Get offers by organization ID
export async function getOffersByOrganization(organizationId: string): Promise<ActionResponse<unknown[] | null>> {
  try {
    const offers = await offerService.getByOrganizationId(organizationId);
    return createActionResponse(offers);
  } catch (error) {
    return createActionResponse(null, handleActionError(error));
  }
} 