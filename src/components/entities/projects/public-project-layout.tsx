"use client";

import React from "react";
import { formatDateLong, getOfferDisplayLabel } from "@/lib/utils";
import { Calendar } from "lucide-react";
import * as LucideIcons from "lucide-react";

interface PublicProjectLayoutProps {
  project: {
    id: string;
    title: string;
    description?: string | null;
    status: string;
    start_date?: string | null;
    end_date?: string | null;
    url?: string | null;
    organization?: {
      id: string;
      name: string;
      legal_name?: string | null;
      country?: string | null;
      website?: string | null;
    } | null;
  };
  offers: Array<{
    id: string;
    title: string;
    status: string;
    total_amount: number;
    currency: string;
    deliverables: Array<{
      id: string;
      title: string;
      summary?: string | null;
      quantity: number;
      price: number;
      group_type: string;
      is_recurring: boolean;
      icon?: string | null;
    }>;
  }>;
}

function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    Planning:
      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200",
    Active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Paused:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Review: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Archived:
      "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  };

  const color = statusColors[status] || "bg-neutral-100 text-neutral-800";
  const displayStatus = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {displayStatus}
    </span>
  );
}

export default function PublicProjectLayout({
  project,
  offers,
}: PublicProjectLayoutProps) {
  // Helper function to rank service groups (same order as offer page)
  const groupRank = (group: string) => {
    const g = String(group || "").toLowerCase();
    if (g === "base") return 0;
    if (g === "research") return 1;
    if (g.startsWith("optional")) return 2;
    if (g === "custom") return 3;
    if (g.startsWith("license")) return 4;
    return 100;
  };

  // Get appropriate icon for service
  const getServiceIcon = (
    serviceName: string,
    groupType?: string,
    iconName?: string,
  ) => {
    if (iconName && (LucideIcons as any)[iconName]) {
      const Icon = (LucideIcons as any)[iconName] as React.ComponentType<{
        size?: number;
        className?: string;
      }>;
      return <Icon size={16} className="flex-shrink-0 text-neutral-500" />;
    }
    const name = (serviceName || "").toLowerCase();
    const group = groupType;
    if (name.includes("database") || name.includes("storage"))
      return <LucideIcons.Database size={16} className="flex-shrink-0 text-neutral-500" />;
    if (name.includes("server") || name.includes("hosting"))
      return <LucideIcons.Server size={16} className="flex-shrink-0 text-neutral-500" />;
    if (name.includes("development") || name.includes("code"))
      return <LucideIcons.Code size={16} className="flex-shrink-0 text-neutral-500" />;
    if (name.includes("license") || name.includes("subscription"))
      return <LucideIcons.Lock size={16} className="flex-shrink-0 text-neutral-500" />;
    switch (group) {
      case "Base":
        return <LucideIcons.Database size={16} className="flex-shrink-0 text-neutral-500" />;
      case "Optional":
        return <LucideIcons.CreditCard size={16} className="flex-shrink-0 text-neutral-500" />;
      case "License":
        return <LucideIcons.Lock size={16} className="flex-shrink-0 text-neutral-500" />;
      case "Research":
        return <LucideIcons.Lightbulb size={16} className="flex-shrink-0 text-neutral-500" />;
      default:
        return <LucideIcons.FileText size={16} className="flex-shrink-0 text-neutral-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6">
        {/* Header Section */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                {project.title}
              </h1>
              {project.organization && (
                <p className="text-lg text-neutral-600 dark:text-neutral-400">
                  {project.organization.name}
                </p>
              )}
            </div>
            <StatusBadge status={project.status} />
          </div>

          {/* Project Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-400">
            {project.start_date && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  {formatDateLong(project.start_date)}
                  {project.end_date && ` - ${formatDateLong(project.end_date)}`}
                </span>
              </div>
            )}
          </div>

          {project.url && (
            <div>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                {project.url}
              </a>
            </div>
          )}
        </div>

        {/* Project Overview */}
        {project.description && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Project Overview
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        )}

        {/* Offer Deliverables */}
        {offers.length > 0 && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
              Offer Deliverables
            </h2>

            <div className="space-y-6">
              {offers.map((offer) => {
                const deliverablesByGroup = offer.deliverables.reduce(
                  (acc: Record<string, typeof offer.deliverables>, d) => {
                    const g = d.group_type || "Other";
                    if (!acc[g]) acc[g] = [];
                    acc[g].push(d);
                    return acc;
                  },
                  {},
                );

                const sortedGroupEntries = Object.entries(
                  deliverablesByGroup,
                ).sort((a, b) => {
                  const ra = groupRank(a[0]);
                  const rb = groupRank(b[0]);
                  if (ra !== rb) return ra - rb;
                  return a[0].localeCompare(b[0]);
                });

                return (
                  <div
                    key={offer.id}
                    className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-neutral-900 dark:text-white">
                          {getOfferDisplayLabel(offer)}
                        </h3>
                      </div>
                      <StatusBadge status={offer.status} />
                    </div>

                    {sortedGroupEntries.length > 0 && (
                      <div className="space-y-4">
                        {sortedGroupEntries.map(
                          ([groupName, groupDeliverables]) => (
                            <div key={groupName} className="space-y-2">
                              <h4 className="text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wide">
                                {groupName}
                              </h4>
                              <div className="space-y-2">
                                {groupDeliverables.map((deliverable: any) => (
                                  <div
                                    key={deliverable.id}
                                    className="flex items-start gap-2 text-sm bg-neutral-50 dark:bg-neutral-900 rounded p-3"
                                  >
                                    <div className="mt-0.5">
                                      {getServiceIcon(
                                        deliverable.title,
                                        deliverable.group_type,
                                        deliverable.icon,
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-baseline gap-2">
                                        <span className="font-medium text-neutral-900 dark:text-white">
                                          {deliverable.quantity}×{" "}
                                          {deliverable.title}
                                        </span>
                                        {deliverable.is_recurring && (
                                          <span className="text-xs text-neutral-500">
                                            (recurring)
                                          </span>
                                        )}
                                      </div>
                                      {deliverable.summary && (
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                                          {deliverable.summary}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-neutral-500 dark:text-neutral-400 pt-4">
          <p>Project Portal</p>
        </div>
      </div>
    </div>
  );
}
