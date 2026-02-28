"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface NavigationEventsProps {
  onRouteChangeStart: () => void;
  onRouteChangeComplete: () => void;
}

/**
 * Component to track navigation events in Next.js
 */
export default function NavigationEvents({
  onRouteChangeStart,
  onRouteChangeComplete,
}: NavigationEventsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // When the route changes, fire the complete event
    onRouteChangeComplete();
  }, [pathname, searchParams, onRouteChangeComplete]);

  useEffect(() => {
    // Set up listeners for page transitions
    const handleBeforeUnload = () => {
      onRouteChangeStart();
    };

    // Set up prefetch event listeners using click capture
    const handleLinkClick = (e: MouseEvent) => {
      // Check if the clicked element is a link
      const link = (e.target as HTMLElement).closest("a");
      if (
        link &&
        link.href &&
        !link.target &&
        link.href.startsWith(window.location.origin)
      ) {
        onRouteChangeStart();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleLinkClick, true);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [onRouteChangeStart]);

  return null;
}
