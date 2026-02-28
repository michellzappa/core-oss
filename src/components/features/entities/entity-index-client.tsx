"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useQueryStates, parseAsString } from "nuqs";
import type { FilterValue } from "@/components/ui/composite/table-filters";
import DataTable, { Column } from "@/components/ui/composite/data-table";
import {
  Building2,
  FileText,
  Users as UsersIcon,
  ExternalLink,
  Euro,
  Linkedin,
  Plus,
  Copy,
  Check,
  X,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/primitives/button";
import { StatusPill } from "@/components/ui/feedback/status-pill";
import {
  formatDate,
  formatCurrency,
  getOfferDisplayLabel,
} from "@/lib/utils";
import { ProfileImage } from "@/components/ui/data-display/profile-image";
import { ContactCharacteristics } from "@/components/ui/data-display/contact-characteristics";
import { getCountryNameAndFlag } from "@/lib/countries";
import { getIndustryName } from "@/lib/industries";
import { Package } from "lucide-react";
import {
  getProjectFilters,
  getContactFilters,
  getServiceFilters,
  STATUS_EXCLUDED_DELIMITER,
} from "@/components/ui/composite/table-filters";
import {
  getOrganizationFilters,
} from "@/components/ui/composite/table-filters";
import { useFilterOptions } from "@/hooks/use-filter-options";
import { useRouter } from "next/navigation";
// Import Server Actions for delete operations
import { deleteContact } from "@/lib/actions/contacts";
import { deleteOrganization } from "@/lib/actions/organizations";
import { deleteService } from "@/lib/actions/services";
import { deleteProject } from "@/lib/actions/projects";
import { deleteOffer } from "@/lib/actions/offers";

interface BaseItem {
  id: string;
  [key: string]: unknown;
}

function renderOrganizationNameWithFlag(organization: any) {
  if (!organization?.name) return null;
  const flag = organization?.country
    ? getCountryNameAndFlag(String(organization.country)).flag
    : null;
  return (
    <span className="truncate inline-flex items-center gap-1">
      <span className="truncate">{String(organization.name)}</span>
      {flag && <span>{flag}</span>}
    </span>
  );
}

// Component for offer action buttons (copy and accepted indicator)
function OfferActions({
  offerLink,
  isAccepted,
}: {
  offerLink: string;
  isAccepted: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(offerLink);
      setCopied(true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-1">
      <span
        className="inline-flex h-8 w-8 items-center justify-center text-neutral-400"
        title={isAccepted ? "Accepted" : "Not accepted"}
      >
        {isAccepted ? (
          <Check className="h-4 w-4 text-[#16a34a]" />
        ) : (
          <X className="h-4 w-4 text-neutral-300" />
        )}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
        onClick={handleCopy}
        title="Copy offer link to clipboard"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export interface EntityIndexClientProps<T extends BaseItem = BaseItem> {
  entity:
    | "organizations"
    | "contacts"
    | "projects"
    | "services"
    | "offers";
  items: T[];
  initial?: Partial<Record<string, string>>;
  hideHeader?: boolean;
}

export default function EntityIndexClient<T extends BaseItem = BaseItem>({
  entity,
  items,
  initial,
  hideHeader = false,
}: EntityIndexClientProps<T>) {
  const router = useRouter();

  const [
    {
      q,
      f_status,
      f_status_excluded,
      f_org,
      f_contact,
      f_currency,
      f_country,
      f_project,
      f_type,
      f_group,
      f_public,
    },
    setParams,
  ] = useQueryStates({
    q: parseAsString.withDefault(initial?.q || ""),
    // Filter params (namespaced with f_ to avoid collisions)
    f_status: parseAsString.withDefault(initial?.f_status || ""),
    f_status_excluded: parseAsString.withDefault(
      initial?.f_status_excluded || "",
    ),
    f_org: parseAsString.withDefault(initial?.f_org || ""),
    f_contact: parseAsString.withDefault(initial?.f_contact || ""),
    f_currency: parseAsString.withDefault(initial?.f_currency || ""),
    f_country: parseAsString.withDefault(initial?.f_country || ""),
    f_project: parseAsString.withDefault(initial?.f_project || ""),
    f_type: parseAsString.withDefault(initial?.f_type || ""),
    f_group: parseAsString.withDefault(initial?.f_group || ""),
    f_public: parseAsString.withDefault(initial?.f_public || ""),
  });

  // Build effective filter values from URL for controlled DataTable
  const urlFilters: FilterValue[] = useMemo(() => {
    const filters: FilterValue[] = [];
    if (f_status) filters.push({ key: "status", value: f_status });
    if (f_status_excluded) {
      filters.push({
        key: "status_excluded",
        value: f_status_excluded
          .split(STATUS_EXCLUDED_DELIMITER)
          .filter(Boolean),
      });
    }
    if (f_org) filters.push({ key: "organization_id", value: f_org });
    if (f_contact) filters.push({ key: "contact_id", value: f_contact });
    if (f_currency) filters.push({ key: "currency", value: f_currency });
    if (f_country) filters.push({ key: "country", value: f_country });
    if (f_project) filters.push({ key: "project_id", value: f_project });
    if (f_type) filters.push({ key: "type", value: f_type });
    if (f_group) filters.push({ key: "group", value: f_group });
    if (f_public) filters.push({ key: "public", value: f_public });
    return filters;
  }, [
    f_status,
    f_status_excluded,
    f_org,
    f_contact,
    f_currency,
    f_country,
    f_project,
    f_type,
    f_group,
    f_public,
  ]);

  const handleFilterValuesChange = useCallback(
    (filters: FilterValue[]) => {
      const updates: Record<string, string | null> = {};
      filters.forEach((filter) => {
        if (filter.key === "status_excluded" && Array.isArray(filter.value)) {
          updates["f_status_excluded"] = filter.value.join(
            STATUS_EXCLUDED_DELIMITER,
          );
        } else {
          updates[`f_${filter.key}`] = String(filter.value);
        }
      });
      if (!filters.some((f) => f.key === "status_excluded")) {
        updates["f_status_excluded"] = null;
      }
      setParams(updates);
    },
    [setParams],
  );

  // Get the appropriate delete function based on entity type
  const getDeleteFunction = useCallback(() => {
    switch (entity) {
      case "contacts":
        return deleteContact;
      case "organizations":
        return deleteOrganization;
      case "services":
        return deleteService;
      case "projects":
        return deleteProject;
      case "offers":
        return deleteOffer;
      default:
        return null;
    }
  }, [entity]);

  const handleDelete = async (item: any) => {
    // Optimistically remove from local list so Table reflects immediately
    const previous = localItems;
    setLocalItems((prev) => prev.filter((it) => it.id !== item.id));

    try {
      const deleteFunction = getDeleteFunction();
      if (!deleteFunction) {
        throw new Error(`No delete function found for entity: ${entity}`);
      }

      // Create a FormData object with the item ID for the Server Action
      const formData = new FormData();
      formData.append("id", item.id);

      // Call the Server Action
      const result = await deleteFunction(null, formData);

      if (!result.success) {
        throw new Error(result.error || "Failed to delete");
      }

      // Refresh the page to update the data
      router.refresh();
    } catch (err) {
      // Restore on failure
      setLocalItems(previous);
      throw err;
    }
  };

  // Keep a local copy for optimistic UI
  const [localItems, setLocalItems] = useState<T[]>(items);
  useEffect(() => setLocalItems(items), [items]);

  const { options: filterOptions } = useFilterOptions();

  const handleRowClick = useCallback(
    (item: T) => {
      router.push(`/dashboard/${entity}/${item.id}`);
    },
    [entity, router],
  );

  const handleEdit = useCallback(
    (item: T) => {
      router.push(`/dashboard/${entity}/${item.id}`);
    },
    [entity, router],
  );

  const { columns, searchFields, createLink, createButtonText, empty } =
    useMemo(() => {
      if (entity === "organizations") {
        const columns: Column<any>[] = [
          {
            key: "name",
            header: "Organization",
            sortable: true,
            width: "300px",
            cell: (organization: any) => (
              <div className="flex items-center gap-3">
                <ProfileImage
                  src={organization.profile_image_url as string}
                  alt={organization.name as string}
                  size="md"
                  fallback={organization.name as string}
                />
                <div className="flex flex-col gap-1">
                  <Link
                    href={`/dashboard/organizations/${organization.id}`}
                    className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)]"
                  >
                    {String(organization.name)}
                  </Link>
                  {organization.legal_name &&
                    organization.legal_name !== organization.name && (
                      <span className="text-sm text-[var(--muted-foreground)] truncate max-w-[200px]">
                        {String(organization.legal_name)}
                      </span>
                    )}
                </div>
              </div>
            ),
          },
          {
            key: "industry",
            header: "Industry",
            sortable: true,
            width: "180px",
            cell: (organization: any) => {
              const name = getIndustryName(
                (organization.industry as string) || null,
              );
              const display =
                name === "Not specified" || name === "" ? "-" : name;
              return (
                <span className="text-sm text-[var(--foreground)]">
                  {display}
                </span>
              );
            },
          },
          {
            key: "country",
            header: "Country",
            sortable: true,
            width: "150px",
            cell: (organization: any) => {
              if (!organization.country)
                return (
                  <span className="text-sm text-[var(--muted-foreground)]">
                    -
                  </span>
                );
              const { name, flag } = getCountryNameAndFlag(
                String(organization.country),
              );
              return (
                <span className="text-sm text-[var(--foreground)] flex items-center gap-2">
                  <span>{flag}</span>
                  <span>{name}</span>
                </span>
              );
            },
          },
          {
            key: "contact_count",
            header: "Contacts",
            sortable: true,
            width: "100px",
            cell: (organization: any) => (
              <span className="text-sm font-medium text-[var(--foreground)]">
                {Number(organization.contact_count || 0)}
              </span>
            ),
          },
          {
            key: "created_at",
            header: "Created",
            sortable: true,
            width: "120px",
            cell: (organization: any) => (
              <span className="text-sm text-[var(--foreground)]">
                {organization.created_at
                  ? formatDate(String(organization.created_at))
                  : "-"}
              </span>
            ),
          },
        ];
        return {
          columns,
          searchFields: ["name", "legal_name", "industry", "country", "city"],
          createLink: "/dashboard/organizations/new",
          createButtonText: "Add Organization",
          empty: {
            icon: <Building2 />,
            title: "No organizations",
            desc: "Get started by creating a new organization.",
          },
        } as const;
      }

      if (entity === "contacts") {
        const columns: Column<any>[] = [
          {
            key: "name",
            header: "Contact",
            sortable: true,
            width: "300px",
            cell: (c: any) => (
              <div className="flex items-center gap-3">
                <ProfileImage
                  src={c.profile_image_url as string}
                  alt={String(c.name)}
                  size="md"
                  fallback={String(c.name)}
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/contacts/${c.id}`}
                      className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)]"
                    >
                      {String(c.name)}
                    </Link>
                    {c.linkedin_url && (
                      <Link
                        href={String(c.linkedin_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Linkedin className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                  {c.email && (
                    <span className="text-sm text-[var(--muted-foreground)] truncate max-w-[200px]">
                      {String(c.email)}
                    </span>
                  )}
                </div>
              </div>
            ),
          },
          {
            key: "organization",
            header: "Organization",
            sortable: true,
            width: "200px",
            cell: (c: any) => {
              if (!c.organization_id)
                return <span className="text-muted-foreground">-</span>;
              const displayName =
                c.organization?.name || `Organization ID: ${c.organization_id}`;
              const flag = c.organization?.country
                ? getCountryNameAndFlag(String(c.organization.country)).flag
                : null;
              return (
                <Link
                  href={`/dashboard/organizations/${c.organization_id}`}
                  className="text-sm text-foreground hover:text-primary inline-flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {flag && <span>{flag}</span>}
                  <span className="truncate">{displayName}</span>
                </Link>
              );
            },
          },
          {
            key: "country",
            header: "Country",
            sortable: true,
            width: "150px",
            cell: (c: any) => {
              if (!c.country)
                return (
                  <span className="text-[var(--muted-foreground)]">-</span>
                );
              const { name, flag } = getCountryNameAndFlag(String(c.country));
              return (
                <span className="text-sm text-[var(--foreground)] flex items-center gap-2">
                  <span>{flag}</span>
                  <span>{name}</span>
                </span>
              );
            },
          },
          {
            key: "characteristics",
            header: "Characteristics",
            sortable: false,
            width: "200px",
            cell: (c: any) => (
              <ContactCharacteristics
                characteristics={c.characteristics}
                maxDisplay={2}
                size="sm"
                showCount={true}
              />
            ),
          },
        ];
        return {
          columns,
          searchFields: [
            "name",
            "email",
            "company_role",
            "country",
            "characteristics",
          ],
          createLink: "/dashboard/contacts/new",
          createButtonText: "Add Contact",
          empty: {
            icon: <Building2 />,
            title: "No contacts",
            desc: "Get started by creating a new contact.",
          },
        } as const;
      }

      if (entity === "projects") {
        const columns: Column<any>[] = [
          {
            key: "title",
            header: "Project",
            sortable: true,
            width: "280px",
            cell: (p: any) => (
              <Link
                href={`/dashboard/projects/${p.id}`}
                className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)]"
              >
                {String(p.title)}
              </Link>
            ),
          },
          {
            key: "organization",
            header: "Organization",
            sortable: true,
            width: "220px",
            cell: (p: any) =>
              p.organization?.name ? (
                <Link
                  href={`/dashboard/organizations/${p.organization_id}`}
                  className="text-sm text-foreground hover:text-primary inline-flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {p.organization?.country && (
                    <span>
                      {
                        getCountryNameAndFlag(String(p.organization.country))
                          .flag
                      }
                    </span>
                  )}
                  <span className="truncate">
                    {String(p.organization.name)}
                  </span>
                </Link>
              ) : (
                <span className="text-muted-foreground">-</span>
              ),
          },
          {
            key: "status",
            header: "Status",
            sortable: true,
            width: "140px",
            cell: (p: any) => (
              <StatusPill
                value={String(p.status || "")}
                type="project-status"
              />
            ),
          },
          {
            key: "start_date",
            header: "Start Date",
            sortable: true,
            width: "120px",
            cell: (p: any) => (
              <span className="text-sm text-[var(--foreground)]">
                {p.start_date ? formatDate(String(p.start_date)) : "-"}
              </span>
            ),
          },
          {
            key: "end_date",
            header: "End Date",
            sortable: true,
            width: "120px",
            cell: (p: any) => (
              <span className="text-sm text-[var(--foreground)]">
                {p.end_date ? formatDate(String(p.end_date)) : "-"}
              </span>
            ),
          },
        ];
        return {
          columns,
          searchFields: ["title", "status"],
          createLink: "/dashboard/projects/new",
          createButtonText: "Add Project",
          empty: {
            icon: <FileText />,
            title: "No projects",
            desc: "Get started by creating a new project.",
          },
        } as const;
      }

      if (entity === "services") {
        const columns: Column<any>[] = [
          {
            key: "name",
            header: "Service",
            sortable: true,
            width: "300px",
            cell: (s: any) => {
              const IconComponent =
                (s.icon &&
                  (LucideIcons as Record<string, any>)[String(s.icon)]) ||
                (LucideIcons as Record<string, any>)["Package"];
              return (
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/services/${s.id}`}
                    className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)] inline-flex items-center gap-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="truncate">{String(s.name)}</span>
                  </Link>
                  {s.summary && (
                    <div className="text-xs text-[var(--muted-foreground)] truncate">
                      {String(s.summary)}
                    </div>
                  )}
                </div>
              );
            },
          },
          {
            key: "price",
            header: "Price",
            sortable: true,
            width: "120px",
            cell: (s: any) => {
              const amount = Number(s.price || 0);
              const formatted = formatCurrency(amount, "EUR", undefined, {
                currencyDisplay: "narrowSymbol",
                maximumFractionDigits: 0,
              });
              return (
                <span className="text-sm text-[var(--foreground)] font-medium">
                  {formatted}
                </span>
              );
            },
          },
          {
            key: "group_type",
            header: "Group",
            sortable: true,
            width: "120px",
            cell: (s: any) => (
              <StatusPill
                value={String(s.group_type || "Unknown")}
                type="service-group"
              />
            ),
          },
          {
            key: "category",
            header: "Category",
            sortable: true,
            width: "140px",
            cell: (s: any) =>
              s.category ? (
                <StatusPill
                  value={String(s.category)}
                  type="service-category"
                />
              ) : (
                <span className="text-sm text-[var(--muted-foreground)]">
                  -
                </span>
              ),
          },
        ];
        return {
          columns,
          searchFields: [
            "name",
            "summary",
            "description",
            "group_type",
            "category",
          ],
          createLink: "/dashboard/services/new",
          createButtonText: "Add Service",
          empty: {
            icon: <Package />,
            title: "No services",
            desc: "Get started by creating a new service.",
          },
        } as const;
      }

      // offers
      const columns: Column<any>[] = [
        {
          key: "title",
          header: "Title",
          sortable: true,
          width: "300px",
          cell: (o: any) => {
            const organization = (o as any).organization;
            const hasOrganizationName = Boolean(organization?.name);
            const offerServices = Array.isArray((o as any).offer_services)
              ? ((o as any).offer_services as any[])
              : [];
            const servicesMeta = offerServices
              .map((service: any) => {
                const label =
                  service?.is_custom && service?.custom_title
                    ? String(service.custom_title)
                    : service?.services?.name
                      ? String(service.services.name)
                      : null;
                if (!label) return null;
                const iconName = service?.services?.icon as
                  | string
                  | undefined;
                return {
                  id: String(service.id ?? `${o.id}-${label}`),
                  label,
                  iconName,
                };
              })
              .filter(Boolean) as {
              id: string;
              label: string;
              iconName?: string;
            }[];

            return (
              <div className="flex flex-col gap-1">
                <Link
                  href={`/dashboard/offers/${o.id}`}
                  className="text-sm font-semibold text-[var(--foreground)] hover:text-[var(--primary)]"
                >
                  {hasOrganizationName
                    ? renderOrganizationNameWithFlag(organization)
                    : String(getOfferDisplayLabel(o))}
                </Link>
                {servicesMeta.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-muted-foreground">
                    {servicesMeta.map((service) => {
                      const IconComponent =
                        service.iconName &&
                        (LucideIcons as Record<string, any>)[
                          service.iconName
                        ];

                      return (
                        <span key={service.id} title={service.label}>
                          {IconComponent ? (
                            <IconComponent className="h-3.5 w-3.5" />
                          ) : (
                            <Package className="h-3.5 w-3.5" />
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          },
        },
        {
          key: "email",
          header: "",
          sortable: false,
          width: "120px",
          cell: (o: any) => {
            // Build the offer link
            const offerLink = `https://www.envisioning.com/private/offer/${o.id}`;

            return (
              <OfferActions
                offerLink={offerLink}
                isAccepted={Boolean(o.is_accepted)}
              />
            );
          },
        },
        {
          key: "total_amount",
          header: "Amount",
          sortable: true,
          width: "140px",
          cell: (o: any) => {
            const amount = Number(o.total_amount || 0);
            const formatted = formatCurrency(amount, "EUR", undefined, {
              currencyDisplay: "narrowSymbol",
              maximumFractionDigits: 0,
              minimumFractionDigits: 0,
              useGrouping: true,
            });
            return (
              <span className="text-sm text-[var(--foreground)] font-medium">
                {formatted}
              </span>
            );
          },
        },
        {
          key: "created_at",
          header: "Created",
          sortable: true,
          width: "130px",
          cell: (o: any) => (
            <span className="text-sm text-muted-foreground">
              {o.created_at ? formatDate(String(o.created_at)) : "-"}
            </span>
          ),
        },
        {
          key: "client_visits",
          header: "Visits",
          sortable: true,
          width: "100px",
          cell: (o: any) => (
            <span className="text-sm text-[var(--foreground)] font-medium">
              {Number(o.client_visits || 0)}
            </span>
          ),
        },
        {
          key: "offer_title",
          header: "Title",
          sortable: true,
          width: "260px",
          cell: (o: any) => (
            <span className="text-sm text-[var(--foreground)] truncate">
              {String(getOfferDisplayLabel(o))}
            </span>
          ),
        },
      ];
      return {
        columns,
        searchFields: ["title", "status", "organization.name"],
        createLink: "/dashboard/offers/new",
        createButtonText: "Add Offer",
        empty: {
          icon: <FileText />,
          title: "No offers",
          desc: "Get started by creating a new offer.",
        },
      } as const;
    }, [entity]);

  const filters = useMemo(() => {
    if (entity === "organizations")
      return getOrganizationFilters();
    if (entity === "projects")
      return getProjectFilters({ organizations: filterOptions.organizations });
    if (entity === "contacts")
      return getContactFilters({ organizations: filterOptions.organizations });
    if (entity === "services") return getServiceFilters();
    return [];
  }, [entity, filterOptions]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <DataTable
          title=""
          data={localItems}
          columns={columns}
          initialSortDirection="desc"
          searchQuery={q}
          onSearchQueryChange={(value) => setParams({ q: value })}
          filterValues={urlFilters}
          onFilterValuesChange={handleFilterValuesChange}
          createLink={hideHeader ? undefined : createLink}
          createButtonText={hideHeader ? undefined : createButtonText}
          emptyStateIcon={empty.icon}
          emptyStateTitle={empty.title}
          emptyStateDescription={empty.desc}
          searchPlaceholder={
            entity === "organizations"
              ? "Search organizations..."
              : entity === "projects"
                ? "Search projects..."
                : entity === "services"
                  ? "Search services..."
                  : entity === "contacts"
                    ? "Search contacts..."
                    : entity === "offers"
                      ? "Search offers..."
                      : "Search..."
          }
          searchFields={[...searchFields]}
          onRowClick={handleRowClick}
          onEdit={handleEdit}
          onDelete={handleDelete}
          hideTitle={true}
          filters={filters}
          filterType={
            entity === "organizations"
              ? "organization"
              : entity === "contacts"
                ? "contact"
                : entity === "offers"
                  ? "offer"
                  : entity === "projects"
                    ? "project"
                    : entity === "services"
                      ? "service"
                      : "generic"
          }
        />
      </div>
    </div>
  );
}
