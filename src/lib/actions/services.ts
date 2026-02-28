"use server";

import { serviceService } from "@/lib/api/services";
import { revalidateTag } from "next/cache";
import { serviceCreateSchema, serviceUpdateSchema } from "@/lib/validation/schemas";
import { z } from "zod";
import {
  createActionResponse,
  handleActionError,
  validateFormData,
  handleFailedAction,
  isForeignKeyConstraintError,
  type ActionResponse,
} from "./utils";

// Create a new service
export async function createService(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    // Validate form data
    const validation = validateFormData(formData, serviceCreateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error);
    }

    // Create the service (validation.data is already properly typed)
    const { category, is_public: _isPublic, ...rest } = validation.data;
    const createData = {
      ...rest,
      // Fix boolean fields
      is_recurring: Boolean(validation.data.is_recurring),
      allow_multiple: Boolean(validation.data.allow_multiple),
      is_default: Boolean(validation.data.is_default),
      category: category ?? null,
    };
    const service = await serviceService.create(createData as any);

    // Revalidate paths
    revalidateTag('services', 'max');

    // Return success response instead of redirecting
    return createActionResponse(service, null);
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Update an existing service
export async function updateService(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    // Get the service ID from form data
    const serviceId = formData.get("id") as string;
    if (!serviceId) {
      return handleFailedAction("Service ID is required");
    }

    // Validate form data
    const validation = validateFormData(formData, serviceUpdateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error);
    }

    // Update the service (validation.data is already properly typed)
    const { category, is_public: _isPublic, ...rest } = validation.data;
    const updateData = {
      ...rest,
      // Fix boolean fields
      is_recurring: validation.data.is_recurring !== undefined ? Boolean(validation.data.is_recurring) : undefined,
      allow_multiple: validation.data.allow_multiple !== undefined ? Boolean(validation.data.allow_multiple) : undefined,
      is_default: validation.data.is_default !== undefined ? Boolean(validation.data.is_default) : undefined,
      category: category === undefined ? undefined : category,
    };
    const service = await serviceService.update(serviceId, updateData as any);

    // Revalidate paths
    revalidateTag('services', 'max');
    revalidateTag(`/dashboard/services/${serviceId}`, 'max');

    // Return success response instead of redirecting
    return createActionResponse(service, null);
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Delete a service
export async function deleteService(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<{ success: boolean } | null>> {
  try {
    const serviceId = formData.get("id") as string;
    if (!serviceId) {
      return handleFailedAction("Service ID is required");
    }

        await serviceService.delete(serviceId);
    
    // Revalidate paths
    revalidateTag('services', 'max');
    
    return createActionResponse({ success: true });
  } catch (error) {
    // Handle foreign key constraint errors specifically
    if (isForeignKeyConstraintError(error)) {
      return createActionResponse(null, 
        "Cannot delete this service because it has related data (offers, etc.)."
      );
    }
    
    return createActionResponse(null, handleActionError(error));
  }
}

// Get a service by ID (for edit forms)
export async function getService(id: string): Promise<ActionResponse<unknown>> {
  try {
    const service = await serviceService.getById(id);
    
    if (!service) {
      return handleFailedAction("Service not found");
    }
    
    return createActionResponse(service);
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Get all services (for list pages)
export async function getServices(filters?: Record<string, string>): Promise<ActionResponse<unknown[] | null>> {
  try {
    const services = await serviceService.getAll(filters);
    return createActionResponse(services);
  } catch (error) {
    return createActionResponse(null, handleActionError(error));
  }
} 

export async function createServiceAction(formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    
    // Parse and validate the data
    const validatedData = serviceCreateSchema.parse(rawData);
    
    // Create the service
    const created = await serviceService.create(validatedData as any);
    
    // Revalidate cache tags
    revalidateTag('services', 'max');
    
    return { success: true, data: created } as const;
  } catch (error) {
    console.error('Error creating service:', error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid form data', details: error.errors };
    }
    
    return { success: false, error: 'Failed to create service' };
  }
}

export async function updateServiceAction(serviceId: string, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    
    // Parse and validate the data
    const validatedData = serviceUpdateSchema.parse(rawData);
    
    // Update the service
    const updated = await serviceService.update(serviceId, validatedData as any);
    
    // Revalidate cache tags
    revalidateTag('services', 'max');
    
    return { success: true, data: updated } as const;
  } catch (error) {
    console.error('Error updating service:', error);
    
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid form data', details: error.errors };
    }
    
    return { success: false, error: 'Failed to update service' };
  }
}

export async function deleteServiceAction(serviceId: string) {
  try {
    // Delete the service
    await serviceService.delete(serviceId);
    
    // Revalidate cache tags
    revalidateTag('services', 'max');
    
    return { success: true } as const;
  } catch (error) {
    console.error('Error deleting service:', error);
    return { success: false, error: 'Failed to delete service' };
  }
} 