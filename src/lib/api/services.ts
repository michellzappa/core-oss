import { ApiService } from '../api-service';

export interface Service {
  id: string;
  name: string;
  summary: string;
  description: string;
  price: number;
  is_recurring: boolean;
  recurring_interval: string | null;
  created_at: string;
  url: string | null;
  icon: string | null;
  group_type: 'Base' | 'Research' | 'Optional' | 'License' | null;
  category: string | null;
  allow_multiple: boolean;
  is_default: boolean;
  [key: string]: unknown;
}

export class ServiceService extends ApiService<Service> {
  constructor() {
    super('services');
  }

  async update(id: string, updates: Partial<Service> & Record<string, unknown>): Promise<Service> {
    try {
      const safeUpdates: Partial<Service> = {
        name: updates.name,
        summary: updates.summary,
        description: updates.description,
        price: updates.price,
        is_recurring: updates.is_recurring,
        url: updates.url,
        icon: updates.icon,
        recurring_interval: updates.is_recurring ? 'yearly' : null,
        group_type: updates.group_type,
        category: updates.category,
        allow_multiple: updates.allow_multiple,
        is_default: updates.is_default,
      };

      const filteredUpdates = Object.fromEntries(
        Object.entries(safeUpdates).filter(([, v]) => v !== undefined)
      ) as Partial<Service>;

      return await super.update(id, filteredUpdates);
    } catch (error) {
      console.error(`Error updating service with ID: ${id}`, error);
      throw error;
    }
  }

  async create(data: Omit<Service, 'id' | 'created_at'> & Record<string, unknown>): Promise<Service> {
    try {
      const safeData = {
        name: data.name,
        summary: data.summary,
        description: data.description,
        price: data.price,
        is_recurring: data.is_recurring || false,
        url: data.url,
        icon: data.icon,
        recurring_interval: data.is_recurring ? 'yearly' : null,
        group_type: data.group_type || 'Optional',
        category: data.category ?? null,
        allow_multiple: data.allow_multiple || false,
        is_default: data.is_default || false,
      };

      return await super.create(safeData);
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async getRecurringServices(): Promise<Service[]> {
    return this.getAll({ is_recurring: true });
  }

  async getOneTimeServices(): Promise<Service[]> {
    return this.getAll({ is_recurring: false });
  }

  async getDefaultServices(): Promise<Service[]> {
    return this.getAll({ is_default: true });
  }
}

export const serviceService = new ServiceService();
