"use server";

import { contactService, type CreateContactInput, type Contact } from "@/lib/api/contacts";
import { revalidateTag } from "next/cache";
import { contactCreateSchema, contactUpdateSchema } from "@/lib/validation/schemas";
import {
  createActionResponse,
  handleActionError,
  validateFormData,
  handleFailedAction,
  isForeignKeyConstraintError,
  getDuplicateConstraintMessage,
  type ActionResponse,
} from "./utils";

// Create a new contact
export async function createContact(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    // Validate form data
    const validation = validateFormData(formData, contactCreateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error);
    }

    // Create the contact
    const contactData: CreateContactInput = {
      ...validation.data,
    };

    await contactService.create(contactData);

    // Revalidate paths
    revalidateTag('contacts', 'max');
    revalidateTag('organizations', 'max'); // Since contacts affect org contact counts
    
    // Return success response instead of redirecting
    return createActionResponse({ success: true, message: "Contact created successfully" });
  } catch (error) {
    // Handle duplicate email constraint error specifically
    const duplicateMessage = getDuplicateConstraintMessage(error, "email address");
    if (duplicateMessage) {
      return handleFailedAction(duplicateMessage);
    }
    
    return handleFailedAction(handleActionError(error));
  }
}

// Update an existing contact
export async function updateContact(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    // Get the contact ID from form data
    const contactId = formData.get("id") as string;
    if (!contactId) {
      return handleFailedAction("Contact ID is required");
    }

    // Validate form data
    const validation = validateFormData(formData, contactUpdateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error);
    }

    // Update the contact
    const contactData: Partial<Contact> = {
      ...validation.data,
    };

    await contactService.update(contactId, contactData);

    // Revalidate paths
    revalidateTag('contacts', 'max');
    revalidateTag('organizations', 'max'); // Since contacts affect org contact counts
    
    return createActionResponse({ success: true, message: "Contact updated successfully" });
  } catch (error) {
    // Handle duplicate email constraint error specifically
    const duplicateMessage = getDuplicateConstraintMessage(error, "email address");
    if (duplicateMessage) {
      return handleFailedAction(duplicateMessage);
    }
    
    return handleFailedAction(handleActionError(error));
  }
}

// Delete a contact
export async function deleteContact(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    const contactId = formData.get("id") as string;
    if (!contactId) {
      return handleFailedAction("Contact ID is required");
    }

    await contactService.delete(contactId);

    // Revalidate paths
    revalidateTag('contacts', 'max');
    revalidateTag('organizations', 'max'); // Since contacts affect org contact counts
    
    return createActionResponse({ success: true, message: "Contact deleted successfully" });
  } catch (error) {
    if (isForeignKeyConstraintError(error)) {
      return handleFailedAction("Cannot delete contact because it is referenced by other records");
    }
    return handleFailedAction(handleActionError(error));
  }
}
