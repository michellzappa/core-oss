"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Generic form configuration
export interface FormConfig {
  schema: z.ZodSchema<Record<string, unknown>>;
  fields: FormField[];
  defaultValues: Record<string, unknown>;
  entityName: string;
  apiEndpoint: string;
  backLink: string;
  mode: 'create' | 'edit';
}

// Form field definition
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'number' | 'date' | 'toggle' | 'section' | 'custom';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
  };
  rows?: number;
  section?: string;
  customRenderer?: (props: CustomFieldProps) => React.ReactNode;
}

export interface CustomFieldProps {
  field: FormField;
  form: Record<string, unknown>;
  error?: string;
}

// Form state
export interface FormState {
  isLoading: boolean;
  error: string | null;
  data: Record<string, unknown> | null;
}

// Hook for unified form handling
export function useUnifiedForm(config: FormConfig, initialData?: Record<string, unknown>) {
  const router = useRouter();
  const [state, setState] = useState<FormState>({
    isLoading: false,
    error: null,
    data: initialData || null,
  });

  const form = useForm({
    resolver: zodResolver(config.schema),
    defaultValues: initialData || config.defaultValues,
  });

  const handleSubmit = async (data: Record<string, unknown>) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const url = config.mode === 'edit' && initialData?.id
        ? `${config.apiEndpoint}/${initialData.id}`
        : config.apiEndpoint;

      const method = config.mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${config.mode} ${config.entityName}`);
      }

      const result = await response.json();
      
      toast.success(`${config.entityName} ${config.mode === 'create' ? 'created' : 'updated'} successfully`);
      
      // Navigate back
      router.push(config.backLink);
      router.refresh();

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      throw error;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id || config.mode !== 'edit') return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(`${config.apiEndpoint}/${initialData.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete ${config.entityName}`);
      }

      toast.success(`${config.entityName} deleted successfully`);
      router.push(config.backLink);
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    form,
    state,
    handleSubmit,
    handleDelete,
  };
}

// Utility function to create form configurations
export function createFormConfig(
  schema: z.ZodSchema<Record<string, unknown>>,
  fields: FormField[],
  entityName: string,
  apiEndpoint: string,
  backLink: string,
  defaultValues: Record<string, unknown> = {}
): FormConfig {
  return {
    schema,
    fields,
    entityName,
    apiEndpoint,
    backLink,
    defaultValues,
    mode: 'create',
  };
}

// Utility function to create edit form configurations
export function createEditFormConfig(
  schema: z.ZodSchema<Record<string, unknown>>,
  fields: FormField[],
  entityName: string,
  apiEndpoint: string,
  backLink: string,
  initialData: Record<string, unknown>
): FormConfig {
  return {
    schema,
    fields,
    entityName,
    apiEndpoint,
    backLink,
    defaultValues: initialData,
    mode: 'edit',
  };
} 