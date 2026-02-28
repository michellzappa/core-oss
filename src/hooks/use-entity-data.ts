import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';
import { instantConfig } from '@/lib/swr-config';

interface UseEntityDataOptions {
  entity: string;
  initialData?: unknown[];
  revalidateOnMount?: boolean;
  refreshInterval?: number;
}

export function useEntityData({
  entity,
  initialData,
  revalidateOnMount = false,
  refreshInterval = 0,
}: UseEntityDataOptions) {
  const { data, error, isLoading, mutate } = useSWR(
    `entities/${entity}`,
    fetcher,
    {
      ...instantConfig,
      fallbackData: initialData,
      revalidateOnMount,
      refreshInterval,
    }
  );

  return {
    data: (data as unknown[]) || [],
    error,
    isLoading,
    mutate,
    isEmpty: !isLoading && (!data || data.length === 0),
  };
}

// Specific hooks for each entity type
export function useOrganizations(initialData?: any[]) {
  return useEntityData({ entity: 'organizations', initialData });
}

export function useContacts(initialData?: any[]) {
  return useEntityData({ entity: 'contacts', initialData });
}

export function useOffers(initialData?: any[]) {
  return useEntityData({ entity: 'offers', initialData });
}

export function useProjects(initialData?: any[]) {
  return useEntityData({ entity: 'projects', initialData });
}

export function useServices(initialData?: any[]) {
  return useEntityData({ entity: 'services', initialData });
}
