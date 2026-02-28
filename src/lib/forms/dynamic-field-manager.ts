import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { UnifiedFormField } from "@/components/forms/unified/unified-form";

export interface RelationshipConfig {
  entityType: string;
  displayField: string;
  valueField?: string;
  filter?: Record<string, unknown>;
  orderBy?: string;
  transform?: (item: Record<string, unknown>) => { value: string; label: string };
}

export interface DynamicFieldConfig {
  fieldName: string;
  relationship: RelationshipConfig;
  required?: boolean;
  placeholder?: string;
  allowEmpty?: boolean;
  formatOptions?: (data: Record<string, unknown>[]) => Array<{ value: string; label: string }>;
  dependsOn?: string; // Field name this depends on
}

export class DynamicFieldManager {
  private static instance: DynamicFieldManager;
  private cache: Map<string, { data: Record<string, unknown>[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DynamicFieldManager {
    if (!DynamicFieldManager.instance) {
      DynamicFieldManager.instance = new DynamicFieldManager();
    }
    return DynamicFieldManager.instance;
  }

  async fetchRelatedData(config: RelationshipConfig): Promise<Record<string, unknown>[]> {
    const cacheKey = `${config.entityType}_${JSON.stringify(config.filter || {})}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const supabase = createBrowserSupabaseClient();
      let query = supabase.from(config.entityType).select('*');
      
      if (config.filter) {
        Object.entries(config.filter).forEach(([key, value]) => {
          // Skip empty strings, null, and undefined values
          if (value !== undefined && value !== null && value !== '') {
            query = query.eq(key, value);
          }
        });
      }
      
      if (config.orderBy) {
        query = query.order(config.orderBy);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching ${config.entityType}:`, error);
        console.error('Query details:', { config, filter: config.filter });
        return [];
      }
      
      const result = data || [];
      this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error(`Error fetching ${config.entityType}:`, error);
      console.error('Query details:', { config, filter: config.filter });
      return [];
    }
  }

  async createOptionsFromData(data: Record<string, unknown>[], config: RelationshipConfig, formatOptions?: (data: Record<string, unknown>[]) => Array<{ value: string; label: string }>): Promise<Array<{ value: string; label: string }>> {
    if (formatOptions) {
      return formatOptions(data);
    }
    
    if (config.transform) {
      return data.map(config.transform);
    }
    
    return data.map(item => ({
      value: config.valueField ? (item[config.valueField] as string) : (item.id as string),
      label: (item[config.displayField] as string) || 'Unknown'
    }));
  }

  async getDynamicFieldOptions(fieldName: string, configs: DynamicFieldConfig[]): Promise<Record<string, Array<{ value: string; label: string }>>> {
    const options: Record<string, Array<{ value: string; label: string }>> = {};
    
    const config = configs.find(c => c.fieldName === fieldName);
    if (!config) return options;
    
    const data = await this.fetchRelatedData(config.relationship);
    const fieldOptions = await this.createOptionsFromData(data, config.relationship, config.formatOptions);
    
    if (config.allowEmpty) {
      fieldOptions.unshift({ value: '__placeholder__', label: config.placeholder || 'Select an option' });
    }
    
    options[fieldName] = fieldOptions;
    return options;
  }

  async updateFormFieldsWithOptions(
    baseFields: UnifiedFormField[],
    configs: DynamicFieldConfig[]
  ): Promise<UnifiedFormField[]> {
    const updatedFields = [...baseFields];
    
    for (const config of configs) {
      const fieldIndex = updatedFields.findIndex(f => f.name === config.fieldName);
      if (fieldIndex === -1) continue;
      
      const data = await this.fetchRelatedData(config.relationship);
      const options = await this.createOptionsFromData(data, config.relationship, config.formatOptions);
      
      if (config.allowEmpty) {
        options.unshift({ value: '__placeholder__', label: config.placeholder || 'Select an option' });
      }
      
      updatedFields[fieldIndex] = {
        ...updatedFields[fieldIndex],
        options,
        required: config.required ?? updatedFields[fieldIndex].required,
        placeholder: config.placeholder ?? updatedFields[fieldIndex].placeholder,
      };
    }
    
    return updatedFields;
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheForEntity(entityType: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(entityType));
    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Predefined relationship configurations
export const RELATIONSHIP_CONFIGS = {
  // Organizations for Contacts
  CONTACT_ORGANIZATION: {
    entityType: 'organizations',
    displayField: 'name',
    valueField: 'id',
    orderBy: 'name',
    transform: (org: Record<string, unknown>) => ({
      value: org.id as string,
      label: `${org.name as string}${org.legal_name && org.legal_name !== org.name ? ` (${org.legal_name as string})` : ''}`
    })
  },
  
  // Organizations for Users (legacy - should be updated to use CONTACT_ORGANIZATION)
  USER_ORGANIZATION: {
    entityType: 'organizations',
    displayField: 'name',
    valueField: 'id',
    orderBy: 'name',
    transform: (org: Record<string, unknown>) => ({
      value: org.id as string,
      label: `${org.name as string}${org.legal_name && org.legal_name !== org.name ? ` (${org.legal_name as string})` : ''}`
    })
  },
  
  // Contacts filtered by organization
  CONTACTS_BY_ORGANIZATION: (organizationId: string) => ({
    entityType: 'contacts',
    displayField: 'name',
    valueField: 'id',
    filter: { organization_id: organizationId },
    orderBy: 'name',
    transform: (contact: Record<string, unknown>) => ({
      value: contact.id as string,
      label: `${contact.name as string}${contact.company_role ? ` - ${contact.company_role as string}` : ''}`
    })
  })
} as const;