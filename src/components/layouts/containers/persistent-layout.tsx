"use client";

import { useState, useCallback } from "react";
import Spinner from "@/components/ui/primitives/spinner";
import NavigationEvents from "../navigation/navigation-events";

interface PersistentLayoutProps {
  children: React.ReactNode;
}

/**
 * A layout component that maintains UI consistency during navigation
 * by showing a loading indicator instead of unmounting/remounting
 */
export function PersistentLayout({ children }: PersistentLayoutProps) {
  const [isChangingRoute, setIsChangingRoute] = useState(false);

  // Callback for route change start
  const handleRouteChangeStart = useCallback(() => {
    setIsChangingRoute(true);
  }, []);

  // Callback for route change complete
  const handleRouteChangeComplete = useCallback(() => {
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      setIsChangingRoute(false);
    }, 100);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Navigation event tracking */}
      <NavigationEvents
        onRouteChangeStart={handleRouteChangeStart}
        onRouteChangeComplete={handleRouteChangeComplete}
      />

      {/* Current content */}
      <div
        className={
          isChangingRoute
            ? "opacity-60 pointer-events-none transition-opacity duration-200"
            : "transition-opacity duration-200"
        }
      >
        {children}
      </div>

      {/* Loading overlay */}
      {isChangingRoute && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent pointer-events-none z-50">
          <div className="bg-background/80 rounded-lg p-4 shadow-lg">
            <Spinner className="w-12 h-12" />
          </div>
        </div>
      )}
    </div>
  );
}
