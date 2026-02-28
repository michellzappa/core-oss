import { SWRConfiguration, mutate } from "swr";
import { fetcher } from "@/lib/fetchers";

export const swrDefaultConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  shouldRetryOnError: true,
};

export const staticConfig: SWRConfiguration = {
  ...swrDefaultConfig,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  revalidateIfStale: false,
  dedupingInterval: 60000,
};

export const instantConfig: SWRConfiguration = {
  ...swrDefaultConfig,
  revalidateOnFocus: false,
  revalidateIfStale: false,
  dedupingInterval: 30000,
};

export const suspenseConfig: SWRConfiguration = {
  ...swrDefaultConfig,
  suspense: true,
  revalidateOnFocus: false,
};

export const cacheKeys = {
  organizations: "/api/organizations",
  contacts: "/api/contacts",
  projects: "/api/projects",
  offers: "/api/offers",
  services: "/api/services",
  corporateEntities: "/api/corporate-entities",
  paymentTerms: "/api/settings/payment-terms",
  deliveryConditions: "/api/settings/delivery-conditions",
  offerLinks: "/api/settings/offer-links",
} as const;

export async function invalidateCache(key?: string) {
  if (key) {
    await mutate(key);
  } else {
    await mutate(() => true, undefined, { revalidate: true });
  }
}
