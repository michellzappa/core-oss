"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function NavigationPerformance() {
  const pathname = usePathname();
  const lastPathname = useRef<string | null>(null);
  const navigationStart = useRef<number | null>(null);

  useEffect(() => {
    const currentTime = Date.now();

    if (lastPathname.current && lastPathname.current !== pathname) {
      // Navigation occurred
      const navigationTime =
        currentTime - (navigationStart.current || currentTime);
      console.log(
        `[Navigation] ${lastPathname.current} → ${pathname}: ${navigationTime}ms`
      );

      // Performance thresholds
      if (navigationTime < 50) {
        console.log(`[Navigation] ⚡ Instant navigation: ${navigationTime}ms`);
      } else if (navigationTime < 200) {
        console.log(`[Navigation] 🚀 Fast navigation: ${navigationTime}ms`);
      } else if (navigationTime < 500) {
        console.log(`[Navigation] ⚠️ Slow navigation: ${navigationTime}ms`);
      } else {
        console.warn(
          `[Navigation] 🐌 Very slow navigation: ${navigationTime}ms`
        );
      }
    }

    lastPathname.current = pathname;
    navigationStart.current = currentTime;
  }, [pathname]);

  return null; // This component doesn't render anything
}
