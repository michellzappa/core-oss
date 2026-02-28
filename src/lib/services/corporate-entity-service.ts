import { createServerSupabaseClient } from "@/lib/supabase-server";
import { CorporateEntity } from "@/lib/types";

class CorporateEntityService {
  async getAll(): Promise<CorporateEntity[]> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("corporate_entities")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching corporate entities:", error);
      throw new Error(`Error fetching corporate entities: ${error.message}`);
    }

    return data || [];
  }

  async getById(id: string): Promise<CorporateEntity | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("corporate_entities")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching corporate entity with id ${id}:`, error);
      throw new Error(`Error fetching corporate entity: ${error.message}`);
    }

    return data;
  }

  async create(corporateEntity: Partial<CorporateEntity>): Promise<CorporateEntity> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("corporate_entities")
      .insert(corporateEntity as any)
      .select()
      .single();

    if (error) {
      console.error("Error creating corporate entity:", error);
      throw new Error(`Error creating corporate entity: ${error.message}`);
    }

    return data;
  }

  async update(id: string, corporateEntity: Partial<CorporateEntity>): Promise<CorporateEntity> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await (supabase as any)
      .from("corporate_entities")
      .update(corporateEntity)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating corporate entity with id ${id}:`, error);
      throw new Error(`Error updating corporate entity: ${error.message}`);
    }

    return data;
  }

  async delete(id: string): Promise<void> {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("corporate_entities")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting corporate entity with id ${id}:`, error);
      throw new Error(`Error deleting corporate entity: ${error.message}`);
    }
  }

  async getDefault(): Promise<CorporateEntity | null> {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("corporate_entities")
      .select("*")
      .eq("is_default", true)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned"
      console.error("Error fetching default corporate entity:", error);
      throw new Error(`Error fetching default corporate entity: ${error.message}`);
    }

    return data || null;
  }
}

export const corporateEntityService = new CorporateEntityService(); 