import { unstable_cache } from 'next/cache';
import type { SupabaseClient } from '@supabase/supabase-js';

const STATIC_CACHE_CONFIG = {
  revalidate: 300,
  tags: ['static-data']
};

export const getStaticContacts = unstable_cache(
  async (supabase: SupabaseClient, organizationId?: string) => {
    let query = supabase
      .from('contacts')
      .select(`
        *,
        organization:organizations(name, legal_name, country)
      `)
      .order('name', { ascending: true });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;
    if (error) throw new Error('Failed to fetch contacts');
    return data || [];
  },
  ['static-contacts'],
  STATIC_CACHE_CONFIG
);

export const getStaticOrganizations = unstable_cache(
  async (supabase: SupabaseClient) => {
    const { data, error } = await supabase
      .from('organizations')
      .select(`
        *,
        contacts!inner(count)
      `)
      .order('name', { ascending: true });

    if (error) throw new Error('Failed to fetch organizations');

    return (data || []).map(org => ({
      ...org,
      contact_count: Array.isArray(org.contacts) ? org.contacts.length : 0
    }));
  },
  ['static-organizations'],
  STATIC_CACHE_CONFIG
);

export const getStaticOffers = unstable_cache(
  async (supabase: SupabaseClient, organizationId?: string) => {
    let query = supabase
      .from('offers')
      .select(`
        *,
        organization:organizations(name, legal_name, country),
        offer_services(count)
      `)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;
    if (error) throw new Error('Failed to fetch offers');

    return (data || []).map(offer => ({
      ...offer,
      services_count: (offer as any).offer_services?.[0]?.count || 0
    }));
  },
  ['static-offers'],
  STATIC_CACHE_CONFIG
);

export const getStaticProjects = unstable_cache(
  async (supabase: SupabaseClient, organizationId?: string) => {
    let query = supabase
      .from('projects')
      .select(`
        *,
        organization:organizations(name, legal_name, country)
      `)
      .order('created_at', { ascending: false });

    if (organizationId) {
      query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;
    if (error) throw new Error('Failed to fetch projects');
    return data || [];
  },
  ['static-projects'],
  STATIC_CACHE_CONFIG
);

export const getStaticServices = unstable_cache(
  async (supabase: SupabaseClient) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw new Error('Failed to fetch services');
    return data || [];
  },
  ['static-services'],
  {
    ...STATIC_CACHE_CONFIG,
    revalidate: 3600
  }
);

export async function invalidateStaticCache(entityType: string) {
  console.log(`Invalidating static cache for ${entityType}`);
}

export async function refreshStaticData(entityType: string, supabase: SupabaseClient) {
  try {
    switch (entityType) {
      case 'contacts':
        await getStaticContacts(supabase);
        break;
      case 'organizations':
        await getStaticOrganizations(supabase);
        break;
      case 'offers':
        await getStaticOffers(supabase);
        break;
      case 'projects':
        await getStaticProjects(supabase);
        break;
      case 'services':
        await getStaticServices(supabase);
        break;
    }
  } catch (error) {
    console.error(`Background refresh failed for ${entityType}:`, error);
  }
}
