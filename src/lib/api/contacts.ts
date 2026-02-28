import { ApiService } from '../api-service';
import { createServerSupabaseClient } from "@/lib/supabase-server";

export interface Contact {
  id: string;
  created_at: string;
  updated_at: string;
  email: string | null;
  name: string;
  organization_id: string | null;
  linkedin_url: string | null;
  company_role: string | null;
  headline: string | null;
  location: string | null;
  country: string | null;
  corporate_email: string | null;
  profile_image_url: string | null;
  organization?: {
    id: string;
    name: string;
    country?: string;
  };
  [key: string]: unknown;
}

export interface CreateContactInput {
  email?: string | null;
  name?: string;
  organization_id?: string | null;
  linkedin_url?: string | null;
  company_role?: string | null;
  headline?: string | null;
  location?: string | null;
  country?: string | null;
  corporate_email?: string | null;
  profile_image_url?: string | null;
  [key: string]: unknown;
}

export const contactService = new class ContactService extends ApiService<Contact> {
  constructor() {
    super('contacts');
  }

  async getAll(filters?: Record<string, string>): Promise<Contact[]> {
    const supabase = await createServerSupabaseClient();

    let query = supabase.from('contacts').select(`
      *,
      organization:organizations(
        id,
        name,
        country
      )
    `);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching contacts:`, error);
      throw error;
    }

    return data as Contact[];
  }

  async create(item: CreateContactInput): Promise<Contact> {
    const contactWithDefaults = {
      ...item,
      name: item.name || (item.email && typeof item.email === 'string' ? item.email.split("@")[0] : 'Unnamed Contact'),
    };

    const supabase = await createServerSupabaseClient();

    const { data, error } = await (supabase as any)
      .from('contacts')
      .insert(contactWithDefaults)
      .select()
      .single();

    if (error) {
      console.error(`Error creating contact:`, error);
      throw error;
    }

    return data as Contact;
  }

  async getById(id: string): Promise<Contact | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        organization:organizations (
          id,
          name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('ContactService: Error fetching contact:', error);
      throw error;
    }

    return data as Contact;
  }

  async getByOrganizationId(organizationId: string): Promise<Contact[]> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        organization:organizations(
          id,
          name,
          country
        )
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching contacts for organization ${organizationId}:`, error);
      throw error;
    }

    return data as Contact[];
  }
}();
