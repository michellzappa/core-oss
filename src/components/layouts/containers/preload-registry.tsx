"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// Context for storing and retrieving prefetched data
interface PreloadContextType {
  // Register a prefetch function for a specific key
  register: (key: string, prefetchFn: () => Promise<unknown>) => void;
  // Prefetch data for a specific key
  prefetch: (key: string) => Promise<unknown>;
  // Check if data for a key is already prefetched
  isPrefetched: (key: string) => boolean;
  // Get prefetched data for a key
  getPrefetchedData: (key: string) => unknown;
}

const PreloadContext = createContext<PreloadContextType | null>(null);

// Hook to access the preload registry
export function usePreload() {
  const context = useContext(PreloadContext);
  if (!context) {
    throw new Error("usePreload must be used within a PreloadRegistry");
  }
  return context;
}

interface PreloadRegistryProps {
  children: ReactNode;
}

/**
 * Registry for prefetching and storing data
 * This helps eliminate flashes by preloading data before navigation
 */
export function PreloadRegistry({ children }: PreloadRegistryProps) {
  // Keep track of registered prefetch functions
  const [prefetchFunctions] = useState<Record<string, () => Promise<unknown>>>({});
  // Cache for prefetched data
  const [prefetchedData] = useState<Record<string, unknown>>({});
  // Track which keys have been prefetched
  const [prefetchedKeys] = useState<Set<string>>(new Set());

  // Register a prefetch function for a key
  const register = (key: string, prefetchFn: () => Promise<unknown>) => {
    prefetchFunctions[key] = prefetchFn;
  };

  // Prefetch data for a key
  const prefetch = async (key: string) => {
    // If the key is already prefetched, return the cached data
    if (prefetchedKeys.has(key)) {
      return prefetchedData[key];
    }

    // If we have a prefetch function for this key, execute it
    if (prefetchFunctions[key]) {
      try {
        // Execute the prefetch function
        const data = await prefetchFunctions[key]();
        // Cache the result
        prefetchedData[key] = data;
        // Mark as prefetched
        prefetchedKeys.add(key);
        return data;
      } catch (error) {
        console.error(`Error prefetching data for key ${key}:`, error);
        throw error;
      }
    }

    return null;
  };

  // Check if data for a key is already prefetched
  const isPrefetched = (key: string) => {
    return prefetchedKeys.has(key);
  };

  // Get prefetched data for a key
  const getPrefetchedData = (key: string) => {
    return prefetchedData[key];
  };

  return (
    <PreloadContext.Provider
      value={{ register, prefetch, isPrefetched, getPrefetchedData }}
    >
      {children}
    </PreloadContext.Provider>
  );
}
