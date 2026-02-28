"use client";

import { useCallback } from 'react';
import useSWR, { SWRConfiguration } from "swr";
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from "swr";
import { Project } from '@/lib/api/projects';
import { fetcher, postFetcher, putFetcher, deleteFetcher } from "@/lib/fetchers";
import { suspenseConfig } from "@/lib/swr-config";

// Define a type for project creation that makes non-required fields optional
type CreateProjectData = {
  title: string;
  description?: string;
  url?: string;
  specs?: string;
  technical?: string;
  research?: string;
  design?: string;
  organization_id?: string;
  offer_id?: string;
  evid?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
};

// Base API URL for projects
const PROJECTS_KEY = "/api/projects";

// Create project mutation
async function createProjectFetcher(url: string, { arg }: { arg: CreateProjectData }) {
  return postFetcher(url, arg);
}

// Update project mutation
async function updateProjectFetcher(url: string, { arg }: { arg: Partial<Project> }) {
  return putFetcher(url, arg);
}

// Delete project mutation
async function deleteProjectFetcher(url: string) {
  return deleteFetcher(url);
}

interface UseProjectsOptions {
  suspense?: boolean;
  enabled?: boolean; // Disable client fetching when server data is provided
}

export function useProjects(options: UseProjectsOptions = {}) {
  const enabled = options.enabled ?? true;
  const { mutate } = useSWRConfig();
  
  // Determine which configuration to use based on the suspense option
  const config: SWRConfiguration = options.suspense 
    ? suspenseConfig
    : {};
  
  // Fetch all projects with SWR
  const { data: projects = [], error, isLoading } = useSWR<Project[]>(
    enabled ? PROJECTS_KEY : null,
    fetcher,
    config
  );
  
  // Create project with useSWRMutation
  const { trigger: createProject, isMutating: isCreating } = useSWRMutation(
    PROJECTS_KEY, 
    createProjectFetcher, 
    {
      // Optimistically update the cache
      onSuccess: (newProject) => {
        mutate(PROJECTS_KEY, [...(projects || []), newProject], false);
      }
    }
  );

  // Update project with useSWRMutation
  const { trigger: updateProjectTrigger } = useSWRMutation(
    '', // We'll set the URL dynamically
    updateProjectFetcher
  );

  // Delete project with useSWRMutation
  const { trigger: deleteProjectTrigger } = useSWRMutation(
    '', // We'll set the URL dynamically
    deleteProjectFetcher
  );
  
  // Fetch a single project by ID
  const fetchProject = useCallback(async (id: string) => {
    if (!enabled) return null;
    const projectUrl = `${PROJECTS_KEY}/${id}`;
    try {
      return await fetcher(projectUrl);
    } catch (err) {
      console.error(`Error fetching project ${id}:`, err);
      return null;
    }
  }, [enabled]);

  // Update a project
  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await updateProjectTrigger(updates, { 
        populateCache: false,
        revalidate: false 
      });
      // Update cache after successful mutation
      if (enabled) {
        mutate(PROJECTS_KEY, projects?.map(project => project.id === id ? updatedProject : project), false);
      }
      return updatedProject;
    } catch (err) {
      console.error(`Error updating project ${id}:`, err);
      return null;
    }
  }, [projects, mutate, updateProjectTrigger, enabled]);

  // Delete a project
  const deleteProject = useCallback(async (id: string) => {
    try {
      await deleteProjectTrigger(undefined, { 
        populateCache: false,
        revalidate: false 
      });
      // Update cache after successful deletion
      if (enabled) {
        mutate(PROJECTS_KEY, projects?.filter(project => project.id !== id), false);
      }
      return true;
    } catch (err) {
      console.error(`Error deleting project ${id}:`, err);
      return false;
    }
  }, [projects, mutate, deleteProjectTrigger, enabled]);

  return {
    projects,
    isLoading,
    error: error?.message || null,
    isCreating,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
  };
} 