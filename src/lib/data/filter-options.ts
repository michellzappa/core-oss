// Centralized filter options data source
// This file contains all the status options, priorities, and other filter data
// that can be dynamically updated and shared across the application

// Project status options
export const PROJECT_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Paused", label: "Paused" },
  { value: "Archived", label: "Archived" },
];

// Offer status options
export const OFFER_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
];

// Service group options
export const SERVICE_GROUP_OPTIONS = [
  { value: "Base", label: "Base" },
  { value: "Research", label: "Research" },
  { value: "Optional", label: "Optional" },
  { value: "License", label: "License" },
];

// Helper function to get currency options from the currency service
export async function getCurrencyOptions() {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    // Return fallback on server side
    return [
      { value: "EUR", label: "EUR (€)" },
      { value: "USD", label: "USD ($)" },
      { value: "GBP", label: "GBP (£)" },
    ];
  }

  try {
    const response = await fetch("/api/currencies");
    if (!response.ok) {
      // Gracefully fallback when unauthorized or unavailable
      return [
        { value: "EUR", label: "EUR (€)" },
        { value: "USD", label: "USD ($)" },
        { value: "GBP", label: "GBP (£)" },
      ];
    }
    const currencies = await response.json();

    return currencies
              .filter((currency: { is_enabled: boolean }) => currency.is_enabled)
      .map((currency: { code: string; symbol: string }) => ({
        value: currency.code,
        label: `${currency.code} (${currency.symbol})`,
      }));
  } catch (error) {
    console.debug("Currency options not available:", error);
    // Fallback to default currencies
    return [
      { value: "EUR", label: "EUR (€)" },
      { value: "USD", label: "USD ($)" },
      { value: "GBP", label: "GBP (£)" },
    ];
  }
}

// Helper function to get organization options
export async function getOrganizationOptions() {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    // Return empty array on server side
    return [];
  }

  try {
    const response = await fetch("/api/organizations");
    if (!response.ok) {
      return [];
    }
    const organizations = await response.json();

            return organizations.map((org: { id: string; name: string }) => ({
      value: org.id,
      label: org.name,
    }));
  } catch (error) {
    console.debug("Organization options not available:", error);
    return [];
  }
}

// Helper function to get contact options
export async function getContactOptions() {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    // Return empty array on server side
    return [];
  }

  try {
    const response = await fetch("/api/contacts");
    if (!response.ok) {
      return [];
    }
    const contacts = await response.json();

            return contacts.map((contact: { id: string; name: string }) => ({
      value: contact.id,
      label: contact.name,
    }));
  } catch (error) {
    console.debug("Contact options not available:", error);
    return [];
  }
}

// Helper function to get project options
export async function getProjectOptions() {
  // Check if we're on the client side
  if (typeof window === 'undefined') {
    // Return empty array on server side
    return [];
  }

  try {
    const response = await fetch("/api/projects");
    if (!response.ok) {
      return [];
    }
    const projects = await response.json();

            return projects.map((project: { id: string; title: string }) => ({
      value: project.id,
      label: project.title,
    }));
  } catch (error) {
    console.debug("Project options not available:", error);
    return [];
  }
}

// Type definitions for better type safety
export type ProjectStatus = (typeof PROJECT_STATUS_OPTIONS)[number]["value"];
export type OfferStatus = (typeof OFFER_STATUS_OPTIONS)[number]["value"];
export type ServiceGroup = (typeof SERVICE_GROUP_OPTIONS)[number]["value"];
