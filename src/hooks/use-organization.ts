"use client";

import useSWR, { SWRConfiguration } from "swr";
import useSWRMutation from 'swr/mutation';
import { Organization } from "@/lib/api/organizations";
import { fetcher, putFetcher } from "@/lib/fetchers";
import { suspenseConfig } from "@/lib/swr-config";

// Base API URL for organizations
const ORGANIZATIONS_BASE_URL = "/api/organizations";

// Update organization mutation
async function updateOrganizationFetcher(url: string, { arg }: { arg: Partial<Organization> }) {
  return putFetcher(url, arg);
}

interface UseOrganizationOptions {
  suspense?: boolean;
}

export function useOrganization(id?: string, options: UseOrganizationOptions = {}) {
  // Only create a key if id is provided
  const organizationKey = id ? `${ORGANIZATIONS_BASE_URL}/${id}` : null;
  
  // Determine which configuration to use based on the suspense option
  const config: SWRConfiguration = options.suspense 
    ? { ...suspenseConfig } 
    : {
      // Don't fetch if id is not provided
      revalidateIfStale: !!id,
      revalidateOnFocus: !!id,
      revalidateOnReconnect: !!id
    };
  
  // Fetch organization data with SWR
  const { 
    data: organization, 
    error, 
    isLoading,
    mutate: mutateOrganization
  } = useSWR<Organization | null>(
    organizationKey, 
    fetcher, 
    config
  );
  
  // Update organization with useSWRMutation
  const { trigger: updateOrganization, isMutating: isUpdating } = useSWRMutation(
    organizationKey,
    updateOrganizationFetcher,
    {
      // Update local data immediately without waiting for the backend
      onSuccess: (updatedOrg) => {
        mutateOrganization(updatedOrg, false);
      }
    }
  );
  
  return { 
    organization, 
    isLoading, 
    error: error?.message || null,
    updateOrganization,
    isUpdating
  };
} 