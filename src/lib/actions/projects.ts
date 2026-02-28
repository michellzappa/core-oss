"use server";

import { revalidatePath } from "next/cache";
import { projectService } from "@/lib/api/projects";
import { projectCreateSchema, projectUpdateSchema } from "@/lib/validation/schemas";
import {
  createActionResponse,
  handleActionError,
  validateFormData,
  handleFailedAction,
  isForeignKeyConstraintError,
  type ActionResponse,
} from "./utils";

// Create a new project
export async function createProject(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    // Validate form data
    const validation = validateFormData(formData, projectCreateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error, validation.submittedData);
    }

    // Create the project (validation.data is already properly typed)
    const project = await projectService.create(validation.data);

    // Revalidate paths
    revalidatePath("/dashboard/projects");

    // Return success response instead of redirecting
    return createActionResponse(project, null);
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Update an existing project
export async function updateProject(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<unknown>> {
  try {
    // Get the project ID from form data
    const projectId = formData.get("id") as string;
    if (!projectId) {
      return handleFailedAction("Project ID is required");
    }

    // Validate form data
    const validation = validateFormData(formData, projectUpdateSchema);
    if (!validation.success) {
      return handleFailedAction(validation.error, validation.submittedData);
    }

    // Update the project (validation.data is already properly typed)
    const updateData = {
      ...validation.data,
      // Convert null values to undefined for the service
      description: validation.data.description || undefined,
      url: validation.data.url || undefined,
      organization_id: validation.data.organization_id || undefined,
      start_date: validation.data.start_date || undefined,
      end_date: validation.data.end_date || undefined,
    };
    const project = await projectService.update(projectId, updateData);

    // Revalidate paths
    revalidatePath("/dashboard/projects");
    revalidatePath(`/dashboard/projects/${projectId}`);

    // Return success response instead of redirecting
    return createActionResponse(project, null);
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Delete a project
export async function deleteProject(
  prevState: ActionResponse<unknown> | null,
  formData: FormData
): Promise<ActionResponse<{ success: boolean } | null>> {
  try {
    const projectId = formData.get("id") as string;
    if (!projectId) {
      return handleFailedAction("Project ID is required");
    }

        await projectService.delete(projectId);
    
    // Revalidate paths
    revalidatePath("/dashboard/projects");
    
    return createActionResponse({ success: true });
  } catch (error) {
    // Handle foreign key constraint errors specifically
    if (isForeignKeyConstraintError(error)) {
      return createActionResponse(null, 
        "Cannot delete this project because it has related data."
      );
    }
    
    return createActionResponse(null, handleActionError(error));
  }
}

// Get a project by ID (for edit forms)
export async function getProject(id: string): Promise<ActionResponse<unknown>> {
  try {
    const project = await projectService.getById(id);
    
    if (!project) {
      return handleFailedAction("Project not found");
    }
    
    return createActionResponse(project);
  } catch (error) {
    return handleFailedAction(handleActionError(error));
  }
}

// Get all projects (for list pages)
export async function getProjects(filters?: Record<string, string>): Promise<ActionResponse<unknown[] | null>> {
  try {
    const projects = await projectService.getAll(filters);
    return createActionResponse(projects);
  } catch (error) {
    return createActionResponse(null, handleActionError(error));
  }
} 