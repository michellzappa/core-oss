"use client";

import { useState, useEffect } from 'react';
import { Organization } from '@/lib/api/organizations';
import { getOrganizations, createOrganization as createOrganizationAction } from '@/lib/actions/organizations';

// Define a type for organization creation that makes owner_id optional
type CreateOrganizationData = Omit<Organization, 'id' | 'created_at' | 'updated_at' | 'owner_id'> & {
  owner_id?: string;
};

interface UseOrganizationsOptions {
  enabled?: boolean;
}

export function useOrganizations(options: UseOrganizationsOptions = {}) {
  const enabled = options.enabled ?? true;
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Fetch organizations using Server Action
  const fetchOrganizations = async () => {
    if (!enabled) return;
    try {
      setIsValidating(true);
      setError(null);
      
      const result = await getOrganizations();
      
      if (result.success && result.data) {
        setOrganizations(result.data as Organization[]);
      } else {
        setError(result.error || 'Failed to fetch organizations');
        setOrganizations([]);
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch organizations');
      setOrganizations([]);
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;
    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  // Refresh function
  const refreshOrganizations = () => {
    if (!enabled) return;
    fetchOrganizations();
  };

  // Create organization function using Server Action
  const createOrganization = async (data: CreateOrganizationData) => {
    try {
      // Create FormData from the organization data
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const result = await createOrganizationAction(null, formData);
      
      if (result.success && result.data) {
        // Add the new organization to the list
        setOrganizations(prev => [...prev, result.data as Organization]);
        return result.data as Organization;
      } else {
        throw new Error(result.error || 'Failed to create organization');
      }
    } catch (err) {
      console.error('Error creating organization:', err);
      throw err;
    }
  };

  // Fetch single organization
  const fetchOrganization = async (id: string) => {
    // This would need to be implemented with the getOrganization Server Action
    // For now, return from the cached list
    return organizations.find(org => org.id === id) || null;
  };

  // Update organization function (placeholder)
  const updateOrganization = async () => {
    // This would need to be implemented with the updateOrganization Server Action
    // For now, just refresh the list
    await refreshOrganizations();
  };

  // Delete organization function (placeholder)
  const deleteOrganization = async () => {
    // This would need to be implemented with the deleteOrganization Server Action
    // For now, just refresh the list
    await refreshOrganizations();
  };

  return {
    organizations,
    isLoading,
    error,
    isValidating,
    createOrganization,
    fetchOrganization,
    updateOrganization,
    deleteOrganization,
    refreshOrganizations,
  };
} 