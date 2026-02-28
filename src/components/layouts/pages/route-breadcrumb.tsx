"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/primitives/breadcrumb";

function formatSegment(segment: string): string {
  const specialCases: Record<string, string> = {
    dashboard: "Dashboard",
    website: "Website",
    offers: "Offers",
    services: "Services",
    settings: "Settings",
    contacts: "Contacts",
    organizations: "Organizations",
    projects: "Projects",
    new: "New",
    edit: "Edit",
  };

  if (specialCases[segment]) return specialCases[segment];
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isIdSegment(segment: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    segment,
  )
    || /^[0-9]+$/.test(segment)
    || segment.length >= 20;
}

export function RouteBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const isDeepRoute =
    (segments[0] === "dashboard" || segments[0] === "website") &&
    segments.length >= 3;

  if (!isDeepRoute) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          const href = `/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const label = isLast && isIdSegment(segment) ? "Details" : formatSegment(segment);

          return (
            <BreadcrumbItem key={href}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              {isLast ? (
                <BreadcrumbPage>{label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={href}>{label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
