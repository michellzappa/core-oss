"use client";

import { ReactNode, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";

// Re-export this type for convenience
export type LinkProps = React.ComponentProps<typeof Link>;

interface NextLinkWithPrefetchProps extends LinkProps {
  children: ReactNode;
  prefetchData?: () => Promise<void>;
  onNavigate?: () => void;
  prefetchEntity?: string; // New prop for entity prefetching
}

/**
 * Enhanced Next.js Link that supports data prefetching
 * Use this instead of next/link for internal navigation to avoid flashes
 */
export default function NextLinkWithPrefetch({
  children,
  prefetchData,
  onNavigate,
  prefetchEntity,
  ...props
}: NextLinkWithPrefetchProps) {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  // Handle mouse enter to prefetch both route and data
  const handleMouseEnter = useCallback(async () => {
    const startTime = Date.now();
    console.log(
      `[Prefetch] Starting prefetch for ${props.href} at ${startTime}`
    );

    // Prefetch the route immediately
    router.prefetch(props.href.toString());
    console.log(`[Prefetch] Route prefetched in ${Date.now() - startTime}ms`);

    // If we have an entity to prefetch, prefetch its data immediately
    if (prefetchEntity) {
      try {
        const entityStart = Date.now();
        // Prefetch entity data using SWR
        const entityKey = `entities/${prefetchEntity}`;
        await mutate(entityKey, undefined, {
          revalidate: false,
          populateCache: true,
        });
        console.log(
          `[Prefetch] Entity ${prefetchEntity} prefetched in ${
            Date.now() - entityStart
          }ms`
        );
      } catch (err) {
        console.error("Error prefetching entity data:", err);
      }
    }

    // If we have a data prefetch function, call it
    if (prefetchData) {
      try {
        const dataStart = Date.now();
        await prefetchData();
        console.log(
          `[Prefetch] Data prefetched in ${Date.now() - dataStart}ms`
        );
      } catch (err) {
        console.error("Error prefetching data:", err);
      }
    }

    console.log(`[Prefetch] Total prefetch time: ${Date.now() - startTime}ms`);
  }, [router, props.href, prefetchData, prefetchEntity, mutate]);

  // Handle click to trigger navigation callback
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onNavigate) {
        onNavigate();
      }

      // Don't prevent default - let Next.js handle the navigation
      if (props.onClick) {
        props.onClick(e);
      }
    },
    [onNavigate, props]
  );

  return (
    <Link {...props} onMouseEnter={handleMouseEnter} onClick={handleClick}>
      {children}
    </Link>
  );
}
