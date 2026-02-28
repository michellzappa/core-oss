export interface SettingEntry {
  slug:
    | "corporate-entities"
    | "users"
    | "appearance"
    | "payment-terms"
    | "delivery-conditions"
    | "offer-links";
  label: string;
  description?: string;
}

export const SETTINGS_ENTRIES: SettingEntry[] = [
  { slug: "corporate-entities", label: "Corporate Entities" },
  { slug: "users", label: "Users" },
  { slug: "appearance", label: "Appearance" },
  { slug: "payment-terms", label: "Payment Terms" },
  { slug: "delivery-conditions", label: "Delivery Conditions" },
  { slug: "offer-links", label: "Offer Links" },
];

export interface SettingsGroupItem {
  slug: SettingEntry["slug"];
  label: string;
}

export interface SettingsGroup {
  slug: string;
  label: string;
  firstItemSlug: string;
  items: SettingsGroupItem[];
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    slug: "system",
    label: "System",
    firstItemSlug: "corporate-entities",
    items: [
      { slug: "users", label: "Users" },
      { slug: "corporate-entities", label: "Corporate Entities" },
      { slug: "appearance", label: "Appearance" },
    ],
  },
  {
    slug: "offers",
    label: "Offers",
    firstItemSlug: "payment-terms",
    items: [
      { slug: "payment-terms", label: "Payment Terms" },
      { slug: "delivery-conditions", label: "Delivery Conditions" },
      { slug: "offer-links", label: "Offer Links" },
    ],
  },
];
