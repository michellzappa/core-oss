import { createServerSupabaseClient } from './supabase-server';

export interface BaseEntity {
  id: string;
  created_at: string;
}

export type TableName =
  | 'organizations'
  | 'contacts'
  | 'projects'
  | 'offers'
  | 'services'
  | 'offer_services'
  | 'corporate_entities'
  | 'settings_payment_terms'
  | 'settings_delivery_conditions'
  | 'settings_offer_links'
  | 'offer_selected_links';

export class ApiService<T extends BaseEntity> {
  private tableName: TableName;

  constructor(tableName: TableName) {
    this.tableName = tableName;
  }

  async getAll(filters?: Record<string, unknown>): Promise<T[]> {
    const supabase = await createServerSupabaseClient();

    let query = supabase.from(this.tableName).select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value as any);
      });
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      throw error;
    }

    return data as T[];
  }

  async getById(id: string): Promise<T | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error(`Error fetching ${this.tableName} by ID:`, error);
      throw error;
    }

    return data as T;
  }

  async create(item: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item as any)
      .select()
      .single();

    if (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }

    return data as T;
  }

  async update(id: string, item: Partial<T>): Promise<T> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await (supabase as any)
      .from(this.tableName)
      .update(item)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }

    return data as T;
  }

  async delete(id: string): Promise<void> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }
}
