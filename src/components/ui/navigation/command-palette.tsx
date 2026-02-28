"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/navigation/command";
import { usePathname } from "next/navigation";
import { getDashboardNavigation } from "@/lib/navigation-config";
import { useContacts } from "@/hooks/use-contacts";
import { fetcher } from "@/lib/fetchers";
import { ProfileImage } from "@/components/ui/data-display/profile-image";
import { SETTINGS_GROUPS } from "@/components/features/settings/settings.config";
import { getOfferDisplayLabel } from "@/lib/utils";
import { Settings } from "lucide-react";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: {
    organizations: ContentItem[];
    contacts: ContentItem[];
    projects: ContentItem[];
    offers: ContentItem[];
    services: ContentItem[];
  };
}

interface ContentItem {
  id: string;
  name: string;
  href: string;
  description?: string;
  status?: string;
  imageUrl?: string;
  fallback?: string;
}

interface ApiOrganization {
  id: string;
  name?: string;
  legal_name?: string;
  country?: string;
  profile_image_url?: string | null;
}

interface ApiProject {
  id: string;
  title: string;
  status?: string;
}

interface ApiOffer {
  id: string;
  title?: string;
  status?: string;
}

interface ApiService {
  id: string;
  name: string;
  description?: string;
}

export function CommandPalette({
  open,
  onOpenChange,
  initialData,
}: CommandPaletteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = React.useState("");

  const navigationItems = React.useMemo(() => {
    return getDashboardNavigation();
  }, []);

  const [contentData, setContentData] = React.useState<{
    organizations: ContentItem[];
    contacts: ContentItem[];
    projects: ContentItem[];
    offers: ContentItem[];
    services: ContentItem[];
  }>({
    organizations: initialData?.organizations ?? [],
    contacts: initialData?.contacts ?? [],
    projects: initialData?.projects ?? [],
    offers: initialData?.offers ?? [],
    services: initialData?.services ?? [],
  });

  const { contacts } = useContacts({ enabled: !initialData });

  React.useEffect(() => {
    if (!initialData && contacts.length > 0) {
      setContentData((prev) => ({
        ...prev,
        contacts: contacts.map((contact) => ({
          id: contact.id,
          name: contact.name,
          href: `/dashboard/contacts/${contact.id}`,
          description: contact.email || contact.company_role,
          imageUrl: contact.profile_image_url || undefined,
          fallback: contact.name,
        })),
      }));
    }
  }, [contacts, initialData]);

  React.useEffect(() => {
    if (initialData) return;

    const fetchContentData = async () => {
      try {
        const [organizations, projects, offers, services] = await Promise.all([
          fetcher("/api/organizations"),
          fetcher("/api/projects"),
          fetcher("/api/offers"),
          fetcher("/api/services"),
        ]);

        setContentData((prev) => ({
          ...prev,
          organizations: (organizations as ApiOrganization[]).map((org) => ({
            id: org.id,
            name: org.name || org.legal_name || "Unnamed Organization",
            href: `/dashboard/organizations/${org.id}`,
            description: org.legal_name || org.country,
            imageUrl: org.profile_image_url || undefined,
            fallback: org.name || org.legal_name || "?",
          })),
          projects: (projects as ApiProject[]).map((project) => ({
            id: project.id,
            name: project.title,
            href: `/dashboard/projects/${project.id}`,
            description: project.status,
            status: project.status,
          })),
          offers: (offers as ApiOffer[]).map((offer) => ({
            id: offer.id,
            name: getOfferDisplayLabel(
              offer as Parameters<typeof getOfferDisplayLabel>[0],
            ),
            href: `/dashboard/offers/${offer.id}`,
            description: offer.status,
            status: offer.status,
          })),
          services: (services as ApiService[]).map((service) => ({
            id: service.id,
            name: service.name,
            href: `/dashboard/services/${service.id}`,
            description: service.description,
          })),
        }));
      } catch (err) {
        console.error("Error fetching content data:", err);
      }
    };

    fetchContentData();
  }, [initialData]);

  const handleSelect = (value: string) => {
    router.push(value);
    onOpenChange?.(false);
    setSearch("");
  };

  const filteredNavigation = React.useMemo(
    () =>
      navigationItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search, navigationItems],
  );

  const filteredContent = React.useMemo(
    () =>
      Object.entries(contentData).reduce(
        (acc, [key, items]) => {
          const filtered = items.filter(
            (item) =>
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.description?.toLowerCase().includes(search.toLowerCase()) ||
              item.status?.toLowerCase().includes(search.toLowerCase()),
          );
          if (filtered.length > 0) {
            (acc as Record<string, ContentItem[]>)[key] = filtered;
          }
          return acc;
        },
        {} as Record<string, ContentItem[]>,
      ),
    [search, contentData],
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="relative flex items-center w-full">
        <CommandInput
          placeholder="Search"
          value={search}
          onValueChange={setSearch}
        />
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute right-3 px-2 py-1 text-xs text-muted-foreground border border-border rounded hover:bg-accent transition-colors"
        >
          Esc
        </button>
      </div>
      <CommandList className="max-h-[400px]">
        <CommandEmpty>
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            No results found.
          </div>
        </CommandEmpty>

        {filteredNavigation.length > 0 && (
          <CommandGroup heading="Navigation">
            {filteredNavigation
              .filter((item) => item.name !== "Settings")
              .map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.href}
                    value={item.href}
                    onSelect={handleSelect}
                  >
                    <Icon className="mr-2 h-3 w-3 text-muted-foreground/70" />
                    <span>{item.name}</span>
                  </CommandItem>
                );
              })}
            {filteredNavigation.some((item) => item.name === "Settings") && (
              <>
                <CommandSeparator />
                {(() => {
                  const settingsItem = filteredNavigation.find(
                    (item) => item.name === "Settings",
                  );
                  if (!settingsItem) return null;
                  const SettingsIcon = settingsItem.icon;
                  return (
                    <CommandItem
                      value={settingsItem.href}
                      onSelect={handleSelect}
                    >
                      <SettingsIcon className="mr-2 h-3 w-3 text-muted-foreground/70" />
                      <span>{settingsItem.name}</span>
                    </CommandItem>
                  );
                })()}
              </>
            )}
          </CommandGroup>
        )}

        {(() => {
          const allSettingsItems = SETTINGS_GROUPS.flatMap((group) =>
            group.items.map((item) => ({
              ...item,
              href: `/dashboard/settings`,
            })),
          );

          const filteredSettingsItems = allSettingsItems.filter((item) =>
            item.label.toLowerCase().includes(search.toLowerCase()),
          );

          if (filteredSettingsItems.length === 0) return null;

          return (
            <>
              <CommandSeparator />
              <CommandGroup heading="Settings">
                {filteredSettingsItems.map((item) => (
                  <CommandItem
                    key={item.slug}
                    value={item.href}
                    onSelect={handleSelect}
                  >
                    <Settings className="mr-2 h-3 w-3 text-muted-foreground/70" />
                    <span>{item.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          );
        })()}

        {search.trim() !== "" && Object.keys(filteredContent).length > 0 && (
          <>
            {filteredNavigation.length > 0 && <CommandSeparator />}
            {Object.entries(filteredContent).map(([section, items]) => {
              const sectionConfig = navigationItems.find((item) =>
                item.href.includes(`/${section}`),
              );
              if (!sectionConfig || items.length === 0) {
                return null;
              }

              const Icon = sectionConfig.icon;
              return (
                <React.Fragment key={section}>
                  <CommandSeparator />
                  <CommandGroup heading={sectionConfig.name}>
                    {items.map((item) => (
                      <CommandItem
                        key={item.id}
                        value={item.href}
                        onSelect={handleSelect}
                      >
                        {section === "contacts" ||
                        section === "organizations" ? (
                          <ProfileImage
                            src={item.imageUrl}
                            alt={item.name}
                            size="xs"
                            fallback={item.fallback || item.name}
                            className="mr-2"
                          />
                        ) : (
                          <Icon className="mr-2 h-3 w-3 text-muted-foreground/70" />
                        )}
                        <span>{item.name}</span>
                        {item.status && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {item.status}
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </React.Fragment>
              );
            })}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
