import { ApiService } from "../api-service";

export interface Organization {
  id: string;
  created_at: string;
  name: string;
  legal_name?: string;
  address?: string;
  postcode?: string;
  city?: string;
  country?: string;
  vat_id?: string;
  tax_id?: string;
  website?: string;
  industry?: string;
  size?: string;
  founded?: string;
  hq_location?: string;
  company_type?: string;
  linkedin_url?: string;
  logo_image_url?: string;
  profile_image_url?: string;
  is_agency?: boolean;
  contact_count?: number;
  [key: string]: unknown;
}

class OrganizationService extends ApiService<Organization> {
  constructor() {
    super("organizations");
  }

  async getById(id: string): Promise<Organization | null> {
    try {
      return await super.getById(id);
    } catch (error) {
      console.error(`Error getting organization with ID: ${id}`, error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<Organization>): Promise<Organization> {
    const safeUpdates = { ...updates };
    if ("updated_at" in safeUpdates) delete safeUpdates.updated_at;
    if ("created_at" in safeUpdates) delete safeUpdates.created_at;
    if ("id" in safeUpdates) delete safeUpdates.id;

    try {
      return await super.update(id, safeUpdates);
    } catch (error) {
      console.error(`Error updating organization with ID: ${id}`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await super.delete(id);
    } catch (error: unknown) {
      console.error(`Error deleting organization with ID: ${id}`, error);

      if ((error as Record<string, unknown>)?.code === "23503") {
        const tableMatch = (error as Error)?.message?.match(/table "([^"]+)"/);
        const tableName = tableMatch ? tableMatch[1] : "related data";

        let userMessage = "Cannot delete this organization because it has related data.";

        if (tableName === "contacts") {
          userMessage = "Cannot delete this organization because it has associated contacts. Please reassign or remove the contacts first.";
        } else if (tableName === "offers") {
          userMessage = "Cannot delete this organization because it has associated offers. Please remove the offers first.";
        } else if (tableName === "projects") {
          userMessage = "Cannot delete this organization because it has associated projects. Please remove the projects first.";
        }

        const userError = new Error(userMessage);
        (userError as unknown as Record<string, unknown>).code = "FOREIGN_KEY_CONSTRAINT";
        (userError as unknown as Record<string, unknown>).error = userMessage;
        throw userError;
      }

      throw error;
    }
  }

  async create(data: Omit<Organization, "id" | "created_at">): Promise<Organization> {
    try {
      return await super.create(data);
    } catch (error) {
      console.error("Error creating organization:", error);
      throw error;
    }
  }
}

export const organizationService = new OrganizationService();
