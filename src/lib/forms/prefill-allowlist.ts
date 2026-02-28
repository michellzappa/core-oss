export type PrefillEntity =
  | "organization"
  | "contact"
  | "service"
  | "project"
  | "offer";

// Allowlist of URL params that are permitted to prefill forms per entity.
// Keep keys aligned with form field names to enable direct merging.
export const PREFILL_KEYS_BY_ENTITY: Record<PrefillEntity, string[]> = {
  organization: [
    // none for now
  ],
  contact: ["name", "email", "organization_id", "country", "linkedin_url"],
  service: ["name", "group_type", "price", "is_recurring"],
  project: [
    "title",
    "organization_id",
    "status",
    "start_date",
    "end_date",
  ],
  offer: [
    "corporate_entity_id",
    "currency",
    "discount_type",
    "global_discount_percentage",
  ],
};

export const ALL_PREFILL_KEYS: string[] = Array.from(
  new Set(Object.values(PREFILL_KEYS_BY_ENTITY).flat())
);

export function getPrefillKeys(entity: PrefillEntity): string[] {
  return PREFILL_KEYS_BY_ENTITY[entity] || [];
}
