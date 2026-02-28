import { ApiService } from '../api-service';
import { createServerSupabaseClient } from '../supabase-server';
import type { Organization } from './organizations';

export interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description?: string;
  organization_id?: string;
  start_date?: string;
  end_date?: string;
  status: 'Active' | 'Paused' | 'Archived';
  url?: string;
  organization?: Organization;
  [key: string]: unknown;
}

class ProjectService extends ApiService<Project> {
  constructor() {
    super('projects');
  }

  async getById(id: string): Promise<Project | null> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data as Project;
  }

  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const safeUpdates = { ...updates };
    if ('updated_at' in safeUpdates) delete safeUpdates.updated_at;
    if ('created_at' in safeUpdates) delete safeUpdates.created_at;
    if ('id' in safeUpdates) delete safeUpdates.id;

    try {
      return await super.update(id, safeUpdates);
    } catch (error) {
      console.error(`Error updating project with ID: ${id}`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await super.delete(id);
    } catch (error) {
      console.error(`Error deleting project with ID: ${id}`, error);
      throw error;
    }
  }

  async create(data: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'organization'>): Promise<Project> {
    try {
      const projectData = {
        ...data,
        status: data.status || 'Active'
      };

      const supabase = await createServerSupabaseClient();
      const { data: project, error } = await (supabase as any)
        .from('projects')
        .insert(projectData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return project as Project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }
}

export const projectService = new ProjectService();
