import { createServerSupabaseClient } from '@/lib/supabase-server';
import { Contact } from '@/lib/api/contacts';
import { Organization } from '@/lib/api/organizations';
import { Service } from '@/lib/api/services';
import { Offer } from '@/lib/api/offers';
import { Project } from '@/lib/api/projects';
import { unstable_cache } from 'next/cache';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbClient = any;

// Generic server data fetcher
async function fetchFromTable<T>(
  table: string,
  select: string = '*',
  filters?: Record<string, unknown>
): Promise<T[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase.from(table).select(select);

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    });
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching from ${table}:`, error);
    throw new Error(`Failed to fetch ${table}`);
  }

  return (data as T[]) || [];
}

// Contact data fetching with caching
export const getContactsServer = unstable_cache(
  async (supabase: DbClient, filters?: { organization_id?: string }): Promise<Contact[]> => {
    let query = supabase
      .from('contacts')
      .select(`
        *,
        organization:organizations(name, legal_name, country)
      `);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contacts:', error);
      throw new Error('Failed to fetch contacts');
    }

    return (data as Contact[]) || [];
  },
  ['contacts'],
  {
    revalidate: 60,
    tags: ['contacts']
  }
);

export const getContactServer = unstable_cache(
  async (supabase: DbClient, id: string): Promise<Contact | null> => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch contact');
    }

    return data;
  },
  ['contact'],
  {
    revalidate: 60,
    tags: ['contacts']
  }
);

// Organization data fetching with caching
export const getOrganizationsServer = unstable_cache(
  async (supabase: DbClient): Promise<Organization[]> => {
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select(`
        *,
        contacts!inner(count)
      `)
      .order('name');

    if (orgError) {
      console.error('Error fetching organizations:', orgError);
      throw new Error('Failed to fetch organizations');
    }

    const organizationsWithContactCounts = (organizations || []).map((org: any) => ({
      ...org,
      contact_count: Array.isArray(org.contacts) ? org.contacts.length : 0
    }));

    return organizationsWithContactCounts;
  },
  ['organizations'],
  {
    revalidate: 60,
    tags: ['organizations']
  }
);

export const getOrganizationServer = unstable_cache(
  async (supabase: DbClient, id: string): Promise<Organization | null> => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch organization');
    }

    return data;
  },
  ['organization'],
  {
    revalidate: 60,
    tags: ['organizations']
  }
);

// Service data fetching with caching
export const getServicesServer = unstable_cache(
  async (supabase: DbClient): Promise<Service[]> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching services:', error);
      throw new Error('Failed to fetch services');
    }

    return (data as Service[]) || [];
  },
  ['services'],
  {
    revalidate: 300,
    tags: ['services']
  }
);

export const getServiceServer = unstable_cache(
  async (supabase: DbClient, id: string): Promise<Service | null> => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch service');
    }

    return data;
  },
  ['service'],
  {
    revalidate: 300,
    tags: ['services']
  }
);

// Offer data fetching with caching
export const getOffersServer = unstable_cache(
  async (supabase: DbClient, filters?: { organization_id?: string }): Promise<Offer[]> => {
    let query = supabase
      .from('offers')
      .select(`
        *,
        organization:organizations(name, legal_name, country),
        offer_services(count)
      `);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching offers:', error);
      throw new Error('Failed to fetch offers');
    }

    const offersWithServicesCount = (data as Record<string, unknown>[])?.map(offer => ({
      ...offer,
      services_count: ((offer as Record<string, unknown>).offer_services as Record<string, unknown>[])?.[0]?.count || 0,
    })) || [];

    return offersWithServicesCount as unknown as Offer[];
  },
  ['offers'],
  {
    revalidate: 60,
    tags: ['offers']
  }
);

export const getOfferServer = unstable_cache(
  async (supabase: DbClient, id: string): Promise<Offer | null> => {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch offer');
    }

    return data;
  },
  ['offer'],
  {
    revalidate: 60,
    tags: ['offers']
  }
);

// Project data fetching with caching
export const getProjectsServer = unstable_cache(
  async (supabase: DbClient, filters?: { organization_id?: string }): Promise<Project[]> => {
    let query = supabase
      .from('projects')
      .select(`
        *,
        organization:organizations(name, legal_name, country)
      `);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      throw new Error('Failed to fetch projects');
    }

    return (data as Project[]) || [];
  },
  ['projects'],
  {
    revalidate: 60,
    tags: ['projects']
  }
);

export const getProjectServer = unstable_cache(
  async (supabase: DbClient, id: string): Promise<Project | null> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error('Failed to fetch project');
    }

    return data;
  },
  ['project'],
  {
    revalidate: 60,
    tags: ['projects']
  }
);

// Parallel data fetching for dashboard pages
export const getDashboardData = unstable_cache(
  async (supabase: DbClient) => {
    const [
      organizationsResult,
      contactsResult,
      offersResult,
      servicesResult,
      projectsResult,
    ] = await Promise.all([
      supabase
        .from('organizations')
        .select('*, contacts!inner(count)')
        .order('name'),
      supabase
        .from('contacts')
        .select('*, organization:organizations(name, legal_name, country)'),
      supabase
        .from('offers')
        .select('*, organization:organizations(name, legal_name, country), offer_services(count)'),
      supabase
        .from('services')
        .select('*')
        .order('name'),
      supabase
        .from('projects')
        .select('*, organization:organizations(name, legal_name, country)'),
    ]);

    if (organizationsResult.error) throw new Error('Failed to fetch organizations');
    if (contactsResult.error) throw new Error('Failed to fetch contacts');
    if (offersResult.error) throw new Error('Failed to fetch offers');
    if (servicesResult.error) throw new Error('Failed to fetch services');
    if (projectsResult.error) throw new Error('Failed to fetch projects');

    const organizations = (organizationsResult.data || []).map((org: any) => ({
      ...org,
      contact_count: Array.isArray(org.contacts) ? org.contacts.length : 0
    }));

    const offers = (offersResult.data || []).map((offer: any) => ({
      ...offer,
      services_count: ((offer as Record<string, unknown>).offer_services as Record<string, unknown>[])?.[0]?.count || 0
    }));

    return {
      organizations,
      contacts: contactsResult.data || [],
      offers,
      services: servicesResult.data || [],
      projects: projectsResult.data || [],
    };
  },
  ['dashboard-data'],
  {
    revalidate: 30,
    tags: ['organizations', 'contacts', 'offers', 'services', 'projects']
  }
);

// Cache tags for invalidation
export const CACHE_TAGS = {
  ORGANIZATIONS: 'organizations',
  CONTACTS: 'contacts',
  OFFERS: 'offers',
  PROJECTS: 'projects',
  SERVICES: 'services',
  DASHBOARD: 'dashboard',
  SETTINGS: 'settings'
} as const;

// Generic entity query functions
export async function getEntityWithRelations(
  supabase: DbClient,
  entityType: string,
  id: string,
  relations: Record<string, any> = {}
) {
  const selectFields = Object.keys(relations).join(', ');
  const query = selectFields
    ? supabase.from(entityType).select(`*, ${selectFields}`).eq('id', id)
    : supabase.from(entityType).select('*').eq('id', id);

  const { data, error } = await query.single();

  if (error) {
    console.error(`Error fetching ${entityType}:`, error);
    throw new Error(`Failed to fetch ${entityType}`);
  }

  return data;
}

export async function getEntitiesWithRelations(
  supabase: DbClient,
  entityType: string,
  relations: Record<string, any> = {},
  filters: Record<string, any> = {},
  orderBy: { column: string; ascending?: boolean } = { column: 'created_at', ascending: false }
) {
  const selectFields = Object.keys(relations).join(', ');
  let query = selectFields
    ? supabase.from(entityType).select(`*, ${selectFields}`)
    : supabase.from(entityType).select('*');

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });

  query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching ${entityType}:`, error);
    throw new Error(`Failed to fetch ${entityType}`);
  }

  return data || [];
}

// Predefined relation patterns for entities
export const entityRelations = {
  contacts: {
    'organization:organizations(name)': true
  },
  organizations: {
    'contacts!inner(count)': true
  },
  projects: {
    'organization:organizations(name, legal_name, country)': true,
  },
  offers: {
    'organization:organizations(name, legal_name, country)': true,
    'offer_services(count)': true
  },
  services: {},
};

// Wrapper functions
export async function getContactsServerWrapper(supabase: DbClient, filters?: { organization_id?: string }): Promise<Contact[]> {
  return getContactsServer(supabase, filters);
}

export async function getContactServerWrapper(supabase: DbClient, id: string): Promise<Contact | null> {
  return getContactServer(supabase, id);
}

export async function getOrganizationsServerWrapper(supabase: DbClient): Promise<Organization[]> {
  return getOrganizationsServer(supabase);
}

export async function getOrganizationServerWrapper(supabase: DbClient, id: string): Promise<Organization | null> {
  return getOrganizationServer(supabase, id);
}

export async function getServicesServerWrapper(supabase: DbClient): Promise<Service[]> {
  return getServicesServer(supabase);
}

export async function getServiceServerWrapper(supabase: DbClient, id: string): Promise<Service | null> {
  return getServiceServer(supabase, id);
}

export async function getOffersServerWrapper(supabase: DbClient, filters?: { organization_id?: string }): Promise<Offer[]> {
  return getOffersServer(supabase, filters);
}

export async function getOfferServerWrapper(supabase: DbClient, id: string): Promise<Offer | null> {
  return getOfferServer(supabase, id);
}

export async function getProjectsServerWrapper(supabase: DbClient, filters?: { organization_id?: string }): Promise<Project[]> {
  return getProjectsServer(supabase, filters);
}

export async function getProjectServerWrapper(supabase: DbClient, id: string): Promise<Project | null> {
  return getProjectServer(supabase, id);
}

export async function getDashboardDataWrapper(supabase: DbClient) {
  return getDashboardData(supabase);
}

// Wrapper for offer selected links query
export async function getOfferSelectedLinksWrapper(supabase: DbClient, offerId: string): Promise<string[]> {
  const { data: linkRows } = await supabase
    .from("offer_selected_links")
    .select("link_id")
    .eq("offer_id", offerId);
  return (linkRows || []).map((r: { link_id: string }) => r.link_id);
}

// Wrapper for corporate entity service
export async function getCorporateEntitiesWrapper(supabase: DbClient) {
  const { data, error } = await supabase
    .from("corporate_entities")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching corporate entities:", error);
    return [];
  }

  return data || [];
}

// Wrapper for default corporate entity
export async function getDefaultCorporateEntityWrapper(supabase: DbClient) {
  const { data, error } = await supabase
    .from("corporate_entities")
    .select("*")
    .eq("is_default", true)
    .single();

  if (error) {
    console.error("Error fetching default corporate entity:", error);
    return null;
  }

  return data;
}

// Wrapper for payment terms
export async function getPaymentTermsWrapper(supabase: DbClient) {
  const { data, error } = await supabase
    .from("settings_payment_terms")
    .select("*")
    .eq("is_active", true)
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching payment terms:", error);
    return [];
  }

  return data || [];
}

// Wrapper for delivery conditions
export async function getDeliveryConditionsWrapper(supabase: DbClient) {
  const { data, error } = await supabase
    .from("settings_delivery_conditions")
    .select("*")
    .eq("is_active", true)
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching delivery conditions:", error);
    return [];
  }

  return data || [];
}

// Wrapper for offer link presets
export async function getOfferLinkPresetsWrapper(supabase: DbClient) {
  const { data, error } = await supabase
    .from("settings_offer_links")
    .select("*")
    .eq("is_active", true)
    .order("title", { ascending: true });

  if (error) {
    console.error("Error fetching offer link presets:", error);
    return [];
  }

  return data || [];
}
