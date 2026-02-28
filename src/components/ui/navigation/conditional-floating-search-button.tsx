"use client";

import { usePathname } from "next/navigation";
import { FloatingSearchButton } from "./floating-search-button";

export function ConditionalFloatingSearchButton() {
  const pathname = usePathname();

  // Only show the floating search button on dashboard pages
  const isDashboardPage = pathname.startsWith("/dashboard");

  if (!isDashboardPage) {
    return null;
  }

  return <FloatingSearchButton />;
}
