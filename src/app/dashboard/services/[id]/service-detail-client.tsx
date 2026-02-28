"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Edit, Trash2, Package, ExternalLink } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Service } from "@/lib/api/services";
import { formatServicePrice, formatDateTime } from "@/lib/utils";
import { PageLoader } from "@/components/ui/primitives/page-loader";
import { ConfirmDialog } from "@/components/ui/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetchers";

interface ServiceDetailClientProps {
  id: string;
}

interface ExtendedService extends Service {
  updated_at?: string;
}

export default function ServiceDetailClient({ id }: ServiceDetailClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const {
    data: service,
    error: fetchError,
    isLoading,
  } = useSWR<ExtendedService>(`/api/services/${id}`, fetcher);

  const handleDelete = async () => {
    if (!id) return;
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      router.push("/dashboard/services");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error(`Error deleting service ${id}:`, err);
    }
  };

  if (isLoading) {
    return <PageLoader variant="block" />;
  }

  if (error || fetchError || !service) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
        {error ||
          (fetchError instanceof Error ? fetchError.message : "Service not found")}
      </div>
    );
  }

  // Split description into bullet points
  const descriptionBullets = service.description
    ? service.description.split("\n").filter((line) => line.trim() !== "")
    : [];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/dashboard/services")}
            className="mr-4 back-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">
            Service Details
          </h1>
        </div>
        <div className="flex space-x-2">
          <Link
            href={`/dashboard/services/${id}`}
            className="inline-flex items-center px-4 py-2 border border-[var(--gray-300)] rounded-md shadow-sm text-sm font-medium text-[var(--foreground)] bg-[var(--background)] hover:bg-[var(--gray-50)]"
          >
            <Edit className="h-4 w-4 mr-2 text-[var(--gray-500)]" />
            Edit
          </Link>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2 text-red-500" />
            Delete
          </button>
        </div>
      </div>

      <div className="bg-card minimal-shadow minimal-border rounded-md overflow-hidden">
        <div className="px-6 py-5 border-b border-[var(--gray-200)]">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-16 w-16 bg-[var(--gray-200)] rounded-full flex items-center justify-center text-[var(--foreground)]">
              {(() => {
                // Prefer Lucide icon names first
                if (service.icon) {
                  const IconComponent = (
                    LucideIcons as unknown as Record<
                      string,
                      React.ComponentType<{ className?: string }>
                    >
                  )[service.icon];
                  if (IconComponent) {
                    return <IconComponent className="h-8 w-8" />;
                  }
                }
                // Fallback to image URL if present
                if (service.icon && !imageError) {
                  return (
                    <div className="relative h-8 w-8">
                      <Image
                        src={service.icon}
                        alt={service.name}
                        fill
                        className="object-contain"
                        onError={() => setImageError(true)}
                      />
                    </div>
                  );
                }
                // Final fallback
                return <Package className="h-8 w-8" />;
              })()}
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-medium text-[var(--foreground)]">
                {service.name || "Unnamed Service"}
              </h2>
              <p className="text-[var(--gray-500)]">
                {service.summary || "No summary provided"}
              </p>
              <div className="mt-1 flex items-center">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-muted text-muted-foreground`}
                >
                  {service.is_recurring ? "Recurring (Yearly)" : "One-time"}
                </span>
                {service.price && (
                  <span className="ml-2 text-[var(--gray-500)]">
                    {formatServicePrice(service.price)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">
              Service Information
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-[var(--gray-500)]">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">
                  {descriptionBullets.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {descriptionBullets.map((bullet, index) => (
                        <li key={index}>{bullet}</li>
                      ))}
                    </ul>
                  ) : (
                    "No description provided"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--gray-500)]">
                  Type
                </dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-muted text-muted-foreground`}
                  >
                    {service.is_recurring ? "Recurring (Yearly)" : "One-time"}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--gray-500)]">
                  Group
                </dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">
                  <span
                    className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-muted text-muted-foreground`}
                  >
                    {service.group_type || "Optional"}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[var(--gray-500)]">
                  Category
                </dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">
                  {service.category ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-muted text-muted-foreground capitalize">
                      {service.category}
                    </span>
                  ) : (
                    <span className="text-[var(--gray-500)]">Not set</span>
                  )}
                </dd>
              </div>
              {service.price && (
                <div>
                  <dt className="text-sm font-medium text-[var(--gray-500)]">
                    Price
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--foreground)]">
                    {formatServicePrice(service.price)}
                  </dd>
                </div>
              )}
              {service.url && (
                <div>
                  <dt className="text-sm font-medium text-[var(--gray-500)]">
                    URL
                  </dt>
                  <dd className="mt-1 text-sm text-[var(--foreground)]">
                    <a
                      href={
                        service.url.startsWith("http")
                          ? service.url
                          : `https://${service.url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      {service.url}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-[var(--gray-500)]">
                  Created
                </dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">
                  {formatDateTime(service.created_at)}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">
              Usage Information
            </h3>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-[var(--gray-500)]">
                  Service ID
                </dt>
                <dd className="mt-1 text-sm text-[var(--foreground)] font-mono">
                  {service.id}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Delete service?"
        description="This will permanently delete this service. This action cannot be undone."
        confirmLabel="Delete"
        isDestructive
        onConfirm={async () => {
          await handleDelete();
          setIsDeleteDialogOpen(false);
        }}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteDialogOpen(false);
          }
        }}
      />
    </div>
  );
}
