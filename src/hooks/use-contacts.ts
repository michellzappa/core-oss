"use client";

import { useState, useEffect, useCallback } from 'react';
import { fetcher } from '@/lib/fetchers';

// Contact interface
export interface Contact {
  id: string;
  name: string;
  email?: string;
  company_role?: string;
  organization_id?: string;
  notes?: string;
  linkedin_url?: string;
  last_contact_date?: string;
  phone?: string;
  headline?: string;
  location?: string;
  country?: string;
  connection_count?: number;
  profile_image_url?: string;
  corporate_email?: string;
  created_at: string;
  updated_at?: string;
}

interface UseContactsOptions {
  suspense?: boolean;
  organizationId?: string; // Filter contacts by organization
  enabled?: boolean; // Disable client fetching when server data is provided
}

export function useContacts(options: UseContactsOptions = {}) {
  const enabled = options.enabled ?? true;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Fetch contacts using API route
  const fetchContacts = useCallback(async () => {
    if (!enabled) return;
    try {
      setIsValidating(true);
      setError(null);
      
      const url = options.organizationId 
        ? `/api/contacts?organization_id=${options.organizationId}`
        : '/api/contacts';
      
      const result = await fetcher(url);
      setContacts(result);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts');
      setContacts([]);
    } finally {
      setIsLoading(false);
      setIsValidating(false);
    }
  }, [options.organizationId, enabled]);

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;
    fetchContacts();
  }, [fetchContacts, enabled]);

  // Refresh function
  const refreshContacts = () => {
    if (!enabled) return;
    fetchContacts();
  };

  // Create contact function (placeholder - would need to be implemented with Server Action)
  const createContact = async () => {
    // This would need to be implemented with the createContact Server Action
    // For now, just refresh the list
    await refreshContacts();
  };

  // Fetch single contact
  const fetchContact = async (id: string) => {
    // This would need to be implemented with the getContactServer Server Action
    // For now, return from the cached list
    return contacts.find(contact => contact.id === id) || null;
  };

  // Update contact function (placeholder)
  const updateContact = async () => {
    // This would need to be implemented with the updateContact Server Action
    // For now, just refresh the list
    await refreshContacts();
  };

  // Delete contact function (placeholder)
  const deleteContact = async () => {
    // This would need to be implemented with the deleteContact Server Action
    // For now, just refresh the list
    await refreshContacts();
  };

  return {
    contacts,
    isLoading,
    error,
    isValidating,
    createContact,
    fetchContact,
    updateContact,
    deleteContact,
    refreshContacts,
  };
} 