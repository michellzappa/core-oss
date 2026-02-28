"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { Project } from "@/lib/api/projects";
import LinkedData from "@/components/ui/composite/linked-data";
import { FolderOpen } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface LinkedProjectsProps {
  organizationId?: string | null;
}

export default function LinkedProjects({
  organizationId,
}: LinkedProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProjects() {
      if (!organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createBrowserSupabaseClient();
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("organization_id", organizationId)
          .eq("status", "Active")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setProjects(data || []);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setError("Failed to load projects");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, [organizationId]);

  const handleAddNew = () => {
    const url = organizationId
      ? `/dashboard/projects/new?organization_id=${organizationId}`
      : "/dashboard/projects/new";
    window.location.href = url;
  };

  if (!organizationId) {
    return null;
  }

  return (
    <LinkedData
      title="Active Projects"
      isLoading={isLoading}
      onAddNew={handleAddNew}
      addButtonText="Add Project"
    >
      {error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-8">
          <FolderOpen className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900">
            No active projects
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Get started by creating a new project for this organization.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50"
            >
              <div className="flex-1">
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="text-sm font-medium text-neutral-900 hover:text-blue-600"
                >
                  {project.title}
                </Link>
                {project.description && (
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-neutral-400">
                  {project.start_date && (
                    <span>Start: {formatDate(project.start_date)}</span>
                  )}
                  {project.end_date && (
                    <span>End: {formatDate(project.end_date)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </LinkedData>
  );
}
