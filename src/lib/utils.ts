import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Service } from "@/lib/api/services"
import { format as formatDateFns, parseISO, isValid as isValidDate, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatServicePrice(input: Service | number | null | undefined): string {
  const price = typeof input === 'object' ? input?.price : input;
  if (price === null || price === undefined) {
    return "Not specified";
  }
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'Not specified';
  const date = typeof dateString === 'string' ? parseISO(dateString) : (dateString as Date);
  if (!isValidDate(date)) return 'Not specified';
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateLong(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'Unknown';
  const date = typeof dateString === 'string' ? parseISO(dateString) : (dateString as Date);
  if (!isValidDate(date)) return 'Unknown';
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'Unknown';
  const date = typeof dateString === 'string' ? parseISO(dateString) : (dateString as Date);
  if (!isValidDate(date)) return 'Unknown';
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDateISO(dateString: string | Date | null | undefined): string {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? parseISO(dateString) : (dateString as Date);
  if (!isValidDate(date)) return '';
  return formatDateFns(date, 'yyyy-MM-dd');
}

export function getOfferDisplayLabel(offer: {
  title?: string | null;
  organization?: { name?: string | null; legal_name?: string | null } | null;
  valid_until?: string | null;
  created_at?: string | null;
}): string {
  if (offer.title?.trim()) return offer.title.trim();
  const org =
    offer.organization?.name ??
    offer.organization?.legal_name ??
    "Offer";
  const dateRaw = offer.valid_until ?? offer.created_at;
  const d = dateRaw
    ? new Date(dateRaw).toISOString().slice(0, 10)
    : "";
  return d ? `${org} – ${d}` : org;
}

export type SortDirection = "asc" | "desc";

export function sortData<T extends Record<string, unknown>>(
  data: T[],
  sortColumn: string,
  sortDirection: SortDirection
): T[] {
  return [...data].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const comparison = String(aValue).localeCompare(String(bValue));
    return sortDirection === "asc" ? comparison : -comparison;
  });
}

export const formatCurrency = (
  amount: number,
  currencyCode: string = "EUR",
  locale: string = "en-US",
  options?: Partial<Intl.NumberFormatOptions>
): string => {
  try {
    const roundedAmount = Math.round(amount);
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      ...options,
    });

    const parts = formatter.formatToParts(roundedAmount);
    let result = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      result += part.value;

      if (part.type === "currency" && i + 1 < parts.length) {
        const nextPart = parts[i + 1];
        if (nextPart.type === "integer" || nextPart.type === "decimal") {
          result += " ";
        }
      }
    }

    return result;
  } catch (error) {
    console.error(`Error formatting currency: ${error}`);
    return `${currencyCode} ${Math.round(amount)}`;
  }
};

export const formatDateString = (
  dateString?: string,
): string => {
  if (!dateString) return "No date specified";
  const date = parseISO(dateString);
  if (!isValidDate(date)) return "No date specified";
  return new Intl.DateTimeFormat(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const formatRelativeDate = (dateString: string): string => {
  const date = parseISO(dateString);
  if (!isValidDate(date)) return "";
  return formatDistanceToNow(date, { addSuffix: true });
};

export function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
