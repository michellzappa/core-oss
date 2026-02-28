import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Type-safe action response interface
export interface ActionResponse<T = unknown> {
  data: T | null;
  error: string | null;
  success: boolean;
  submittedData?: Record<string, unknown>;
}

// Create standardized action responses
export function createActionResponse<T>(
  data: T | null,
  error: string | null = null,
  submittedData?: Record<string, unknown>
): ActionResponse<T> {
  return {
    data,
    error,
    success: error === null,
    submittedData,
  };
}

// Handle errors consistently across all Server Actions
export function handleActionError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === "string") {
    return error;
  }
  
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  
  return "An unexpected error occurred";
}

// Validate form data using Zod schemas
export function validateFormData<S extends z.ZodTypeAny>(
  formData: FormData,
  schema: S
): { success: true; data: z.infer<S> } | { success: false; error: string; submittedData?: Record<string, unknown> } {
  try {
    // Convert FormData to object
    const data: Record<string, unknown> = {};
    
    for (const [rawKey, value] of formData.entries()) {
      const key = rawKey.endsWith("[]") ? rawKey.slice(0, -2) : rawKey;
      // Normalize scalar value
      let normalized: unknown = value;
      if (value === "none") normalized = null;
      else if (value === "true" || value === "on") normalized = true;
      else if (value === "false") normalized = false;
      else if (value === "") normalized = ""; // preserve empty strings

      // Aggregate repeated keys into arrays (checkbox groups, multi-selects)
      if (key in data) {
        const existing = data[key];
        if (Array.isArray(existing)) {
          existing.push(String(normalized));
          data[key] = existing;
        } else {
          data[key] = [String(existing), String(normalized)];
        }
      } else {
        data[key] = normalized;
      }
    }
    
    // Handle unchecked checkboxes - set common boolean fields to false if they're missing
    const commonBooleanFields = [
      'is_agency', 'is_recurring', 'allow_multiple', 'is_default',
      'event_timeline', 'budget_availability', 'stakeholder_buy_in', 'previous_engagement', 'project_fit',
      // Offers toggles
      'is_accepted'
    ];
    for (const field of commonBooleanFields) {
      if (!(field in data)) {
        data[field] = false;
      }
    }

    // Handle array fields that might come as strings
    const arrayFields = ['contact_ids'];
    for (const field of arrayFields) {
      if (field in data) {
        const value = data[field];
        if (typeof value === 'string') {
          // Try to parse as JSON if it's a string
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              data[field] = parsed;
            } else {
              data[field] = [];
            }
          } catch {
            // If not valid JSON, treat as empty array
            data[field] = [];
          }
        } else if (!Array.isArray(value)) {
          data[field] = [];
        }
      } else {
        data[field] = [];
      }
    }

    // Handle object fields that might come as strings (like characteristics)
    const objectFields = ['characteristics'];
    for (const field of objectFields) {
      if (field in data) {
        const value = data[field];
        if (typeof value === 'string') {
          // Try to parse as JSON if it's a string
          try {
            const parsed = JSON.parse(value);
            if (typeof parsed === 'object' && parsed !== null) {
              data[field] = parsed;
            } else {
              data[field] = {};
            }
          } catch {
            // If not valid JSON, treat as empty object
            data[field] = {};
          }
        } else if (typeof value !== 'object' || value === null) {
          data[field] = {};
        }
      } else {
        data[field] = {};
      }
    }
    
    // Validate with Zod
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data as z.infer<S> };
    } else {
      const errorMessage = result.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return { success: false, error: errorMessage, submittedData: data };
    }
  } catch (error) {
    return { success: false, error: handleActionError(error) };
  }
}

// Helper function to handle successful actions with navigation
export function handleSuccessAction(
  message: string,
  redirectPath: string,
  revalidatePaths: string[] = []
) {
  // Revalidate specified paths
  revalidatePaths.forEach((path) => revalidatePath(path));
  
  // Redirect to the specified path
  redirect(redirectPath);
}

// Helper function to handle failed actions
export function handleFailedAction(error: string, submittedData?: Record<string, unknown>): ActionResponse<null> {
  return createActionResponse(null, error, submittedData);
}

// Helper function to convert "none" values to null for optional fields
export function sanitizeFormData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === "none") {
      sanitized[key] = null;
    } else if (value === "") {
      // Keep empty strings as empty strings for validation
      sanitized[key] = "";
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Helper function to handle foreign key constraint errors
export function isForeignKeyConstraintError(error: unknown): boolean {
  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;
    return (
      errorObj.code === "FOREIGN_KEY_CONSTRAINT" ||
      String(errorObj.message || "").includes("foreign key constraint")
    );
  }
  return false;
}

// Helper function to check for duplicate constraint errors
export function isDuplicateConstraintError(error: unknown, constraintName?: string): boolean {
  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;
    if (errorObj.code === "23505") {
      if (constraintName) {
        const message = String(errorObj.message || "");
        return message.includes(constraintName);
      }
      return true;
    }
  }
  return false;
}

// Helper function to get user-friendly message for duplicate constraint errors
export function getDuplicateConstraintMessage(error: unknown, fieldName: string): string | null {
  if (isDuplicateConstraintError(error)) {
    const errorObj = error as Record<string, unknown>;
    const message = String(errorObj.message || "");
    
    if (message.includes("users_email_key") || message.includes("email")) {
      return `A contact with this ${fieldName} already exists. Please use a different ${fieldName} or update the existing contact.`;
    }
    
    return `A record with this ${fieldName} already exists. Please use a different ${fieldName}.`;
  }
  return null;
} 