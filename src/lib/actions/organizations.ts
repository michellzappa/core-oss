"use server";

import { revalidatePath } from "next/cache";
import { organizationService } from "@/lib/api/organizations";
import { organizationCreateSchema, organizationUpdateSchema } from "@/lib/validation/schemas";
import {
  createActionResponse,
  handleActionError,
  validateFormData,
  handleFailedAction,
  isForeignKeyConstraintError,
  type ActionResponse,
} from "./utils";

// Create a new organization
export async function createOrganization(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    // Validate form data
    const validation = validateFormData(formData, organizationCreateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error, validation.submittedData);
    }

    // Create the organization (validation.data is already properly typed)
    const createData = {
      ...validation.data,
      // Fix boolean fields
      is_agency: Boolean(validation.data.is_agency),
    };
    await organizationService.create(createData);

    // Revalidate paths
    revalidatePath("/dashboard/organizations");

    // Return success response instead of redirecting
    return createActionResponse({ success: true, message: "Organization created successfully" });
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Update an existing organization
export async function updateOrganization(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    // Get the organization ID from form data
    const organizationId = formData.get("id") as string;
    if (!organizationId) {
      return handleFailedAction("Organization ID is required");
    }

    // Validate form data
    const validation = validateFormData(formData, organizationUpdateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error, validation.submittedData);
    }

    // Update the organization (validation.data is already properly typed)
    const updateData = {
      ...validation.data,
      // Convert null values to undefined for the service
      legal_name: validation.data.legal_name || undefined,
      address: validation.data.address || undefined,
      postcode: validation.data.postcode || undefined,
      city: validation.data.city || undefined,
      country: validation.data.country || undefined,
      website: validation.data.website || undefined,
      industry: validation.data.industry || undefined,
      size: validation.data.size || undefined,
      vat_id: validation.data.vat_id || undefined,
      tax_id: validation.data.tax_id || undefined,
      founded: validation.data.founded || undefined,
      hq_location: validation.data.hq_location || undefined,
      company_type: validation.data.company_type || undefined,
      linkedin_url: validation.data.linkedin_url || undefined,
      logo_image_url: validation.data.logo_image_url || undefined,
      // Fix boolean fields
      is_agency: validation.data.is_agency !== undefined ? Boolean(validation.data.is_agency) : undefined,
    };
    await organizationService.update(organizationId, updateData as any);

    // Revalidate paths
    revalidatePath("/dashboard/organizations");
    revalidatePath(`/dashboard/organizations/${organizationId}`);

    // Return success response instead of redirecting
    return createActionResponse({ success: true, message: "Organization updated successfully" });
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Delete an organization
export async function deleteOrganization(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<{ success: boolean } | null>> {
  try {
    const organizationId = formData.get("id") as string;
    if (!organizationId) {
      return handleFailedAction("Organization ID is required");
    }

        await organizationService.delete(organizationId);
    
    // Revalidate paths
    revalidatePath("/dashboard/organizations");
    
    return createActionResponse({ success: true, message: "Organization deleted successfully" });
  } catch (error) {
    // Handle foreign key constraint errors specifically
    if (isForeignKeyConstraintError(error)) {
      return createActionResponse(null, 
        "Cannot delete this organization because it has related data (contacts, offers, etc.)."
      );
    }
    
    return createActionResponse(null, handleActionError(error));
  }
}

// Get an organization by ID (for edit forms)
export async function getOrganization(id: string): Promise<ActionResponse<unknown>> {
  try {
    const organization = await organizationService.getById(id);
    
    if (!organization) {
      return handleFailedAction("Organization not found");
    }
    
    return createActionResponse(organization);
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Get all organizations (for list pages)
export async function getOrganizations(filters?: Record<string, string>): Promise<ActionResponse<unknown[] | null>> {
  try {
    const organizations = await organizationService.getAll(filters);
    return createActionResponse(organizations);
  } catch (error) {
    return createActionResponse(null, handleActionError(error));
  }
} 