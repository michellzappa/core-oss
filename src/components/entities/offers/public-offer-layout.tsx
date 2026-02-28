"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import AcceptOfferStatus from "./accept-offer-status";
import PdfExportButton from "@/components/features/export/pdf-export-wrapper";
import { formatCurrency as formatCurrencyUtil } from "@/lib/utils";
import AcceptOfferWidget from "./accept-offer-widget";
import { formatDateLong } from "@/lib/utils";

function getCountryName(countryCode?: string | null) {
  if (!countryCode) return "";
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
    return displayNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}

interface PublicOfferLayoutProps {
  offer: Record<string, unknown> & {
    id: string;
    title?: string;
    currency: string;
    total_amount: number;
    valid_until?: string | null;

    organization?: Record<string, unknown> | null;
    corporate_entity?: Record<string, unknown> | null;
  };
  services: Array<Record<string, unknown>>;
}

export default function PublicOfferLayout({
  offer,
  services,
}: PublicOfferLayoutProps) {
  // Check if offer is expired
  const isExpired =
    (offer as any).is_expired ||
    (offer.valid_until && new Date(offer.valid_until) < new Date());

  // State for extension request
  const [extending, setExtending] = React.useState(false);
  const [extensionSuccess, setExtensionSuccess] = React.useState(false);
  const [extensionError, setExtensionError] = React.useState<string | null>(
    null
  );
  const [currentOffer, setCurrentOffer] = React.useState(offer);

  // Handle extension request
  async function handleRequestExtension() {
    setExtending(true);
    setExtensionError(null);

    try {
      // Get email from localStorage if available
      let email: string | undefined;
      try {
        const key = `public-offer-email:${offer.id}`;
        email = window.localStorage.getItem(key) || undefined;
      } catch {}

      const res = await fetch(`/api/public/offers/${offer.id}/extend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const error = await res
          .json()
          .catch(() => ({ error: "Failed to extend offer" }));
        throw new Error(error.error || "Failed to extend offer");
      }

      const data = await res.json();

      // Refetch the offer data to get fresh state without reloading the page
      try {
        const email =
          window.localStorage.getItem(`public-offer-email:${offer.id}`) || "";
        const refreshRes = await fetch(
          `/api/public/offers/${offer.id}?email=${encodeURIComponent(email)}`
        );

        if (refreshRes.ok) {
          const refreshPayload = await refreshRes.json();
          // Update with fresh data from server
          setCurrentOffer({
            ...refreshPayload.offer,
            is_expired: false,
          });
        } else {
          // If refetch fails, still update with the extension data
          setCurrentOffer({
            ...currentOffer,
            valid_until: data.new_valid_until,
            is_expired: false,
          });
        }
      } catch (refreshError) {
        // If refetch fails, still update with the extension data
        setCurrentOffer({
          ...currentOffer,
          valid_until: data.new_valid_until,
          is_expired: false,
        });
      }

      setExtensionSuccess(true);
    } catch (error) {
      setExtensionError(
        error instanceof Error ? error.message : "Failed to extend offer"
      );
    } finally {
      setExtending(false);
    }
  }

  // Use currentOffer state if extension was successful, otherwise use original offer
  const displayOffer = extensionSuccess ? currentOffer : offer;
  const displayIsExpired = extensionSuccess ? false : isExpired;

  const org = Array.isArray(displayOffer.organization)
    ? (displayOffer.organization as any[])[0]
    : (displayOffer.organization as any) || null;
  const corp = Array.isArray(displayOffer.corporate_entity)
    ? (displayOffer.corporate_entity as any[])[0]
    : (displayOffer.corporate_entity as any) || null;
  const contact = (displayOffer as any).receiving_contact as
    | { name?: string; email?: string; company_role?: string }
    | undefined;

  type DisplayService = {
    name: string;
    description: string | null;
    price: number;
    quantity: number;
    discount_percentage: number;
    is_recurring: boolean;
    group_type: string;
    icon?: string;
    url?: string;
  };

  const normalized: DisplayService[] = (services || []).map(
    (s: Record<string, unknown>) => ({
      name:
        (s.service_name as string) ||
        (s.name as string) ||
        (s.custom_title as string) ||
        "Service",
      description: ((s.custom_description as string) ||
        (s.service_description as string) ||
        (s.description as string) ||
        null) as string | null,
      price: Number(s.price) || 0,
      quantity: Number(s.quantity) || 1,
      discount_percentage: Number(s.discount_percentage) || 0,
      is_recurring: Boolean(s.is_recurring),
      group_type: String(s.group_type || "Other"),
      icon: (s.icon as string) || undefined,
      url: (s.url as string) || undefined,
    })
  );

  const servicesByGroup = normalized.reduce(
    (acc: Record<string, DisplayService[]>, s) => {
      const g = s.group_type || "Other";
      if (!acc[g]) acc[g] = [];
      acc[g].push(s);
      return acc;
    },
    {}
  );

  const groupRank = (group: string) => {
    const g = String(group || "").toLowerCase();
    if (g === "base") return 0;
    if (g === "research") return 1;
    if (g.startsWith("optional")) return 2; // handles "Optional" or "Optionals"
    if (g === "custom") return 3;
    if (g.startsWith("license")) return 4;
    return 100; // unknowns go last
  };
  const sortedGroupEntries = Object.entries(servicesByGroup).sort((a, b) => {
    const ra = groupRank(a[0]);
    const rb = groupRank(b[0]);
    if (ra !== rb) return ra - rb;
    return a[0].localeCompare(b[0]);
  });

  const subtotal = normalized.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const total = Number((displayOffer.total_amount as number) || 0);
  // Derive discount using offer discount settings when available for accuracy
  const offerGlobalPct = Number(
    (displayOffer as any).global_discount_percentage ?? 0
  );
  const discountReason = (displayOffer as any).discount_reason as
    | string
    | undefined;
  let discountAmount = Math.max(0, subtotal - total);
  let discountPct =
    subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;
  if (offerGlobalPct > 0) {
    discountPct = Math.round(offerGlobalPct);
    const computed = Math.round((offerGlobalPct / 100) * subtotal);
    discountAmount = Math.max(discountAmount, computed);
  }

  // Tax is display-only and sits on top of our total
  const taxPct = Number((displayOffer as any).tax_percentage ?? 0);
  const taxReason = (displayOffer as any).tax_reason as string | undefined;
  // Compute discounted total for display robustness even if total_amount wasn't pre-discounted
  const discountedTotal = Math.max(0, subtotal - discountAmount);
  const taxAmount =
    taxPct > 0 ? Math.round((taxPct / 100) * discountedTotal) : 0;
  const clientGrandTotal = discountedTotal + taxAmount;

  // Determine display currency and fetch EUR->target rate from API (client-side)
  const targetCurrency = String(
    (displayOffer as any).currency || "EUR"
  ).toUpperCase();
  const [eurToTargetRate, setEurToTargetRate] = React.useState<number>(1);
  const [rateResolved, setRateResolved] = React.useState<boolean>(
    targetCurrency === "EUR"
  );
  React.useEffect(() => {
    let isMounted = true;
    async function loadRate() {
      try {
        if (targetCurrency === "EUR") {
          if (isMounted) {
            setEurToTargetRate(1);
            setRateResolved(true);
          }
          return;
        }
        const res = await fetch(
          `/api/public/exchange-rate?target=${targetCurrency}`
        );
        if (res.ok) {
          const { rate } = (await res.json()) as { rate?: number };
          if (rate && rate > 0) {
            if (isMounted) {
              setEurToTargetRate(rate);
              setRateResolved(true);
            }
          } else if (isMounted) {
            setRateResolved(false);
          }
        } else if (isMounted) {
          setRateResolved(false);
        }
      } catch {
        // Network or other error: keep default rate and mark unresolved
        if (isMounted) setRateResolved(false);
      }
    }
    loadRate();
    return () => {
      isMounted = false;
    };
  }, [targetCurrency]);

  const conversionRate = rateResolved ? eurToTargetRate : 1;
  const displayCurrency = rateResolved ? targetCurrency : "EUR";
  const convert = (amountEUR: number) => amountEUR * conversionRate;
  const formatCurrency = (amountEUR: number) =>
    formatCurrencyUtil(convert(amountEUR), displayCurrency);

  const formatDate = (dateString?: string | null) =>
    formatDateLong(dateString || undefined);

  const shortId = offer.id?.slice(-3) ?? "";

  const getServiceIcon = (
    serviceName: string,
    groupType?: string,
    iconName?: string
  ) => {
    if (iconName && (LucideIcons as any)[iconName]) {
      const Icon = (LucideIcons as any)[iconName] as React.ComponentType<{
        size?: number;
        className?: string;
      }>;
      return (
        <Icon
          size={20}
          className="mr-2 flex-shrink-0 text-neutral-700 dark:text-neutral-300"
        />
      );
    }
    const name = (serviceName || "").toLowerCase();
    const group = groupType;
    if (name.includes("database") || name.includes("storage"))
      return (
        <LucideIcons.Database
          size={20}
          className="mr-2 flex-shrink-0 text-neutral-700 dark:text-neutral-300"
        />
      );
    if (name.includes("server") || name.includes("hosting"))
      return (
        <LucideIcons.Server
          size={20}
          className="mr-2 flex-shrink-0 text-neutral-700 dark:text-neutral-300"
        />
      );
    if (name.includes("development") || name.includes("code"))
      return (
        <LucideIcons.Code
          size={20}
          className="mr-2 flex-shrink-0 text-neutral-700 dark:text-neutral-300"
        />
      );
    if (name.includes("license") || name.includes("subscription"))
      return (
        <LucideIcons.Lock
          size={20}
          className="mr-2 flex-shrink-0 text-neutral-700 dark:text-neutral-300"
        />
      );
    if (name.includes("ai") || name.includes("intelligence"))
      return (
        <LucideIcons.Brain
          size={20}
          className="mr-2 flex-shrink-0 text-neutral-700 dark:text-neutral-300"
        />
      );
    if (name.includes("automation") || name.includes("bot"))
      return (
        <LucideIcons.Bot
          size={20}
          className="mr-2 flex-shrink-0 text-neutral-700 dark:text-neutral-300"
        />
      );
    switch (group) {
      case "Base":
        return (
          <LucideIcons.Database
            size={20}
            className="mr-2 flex-shrink-0 text-neutral-700 dark:text-neutral-300"
          />
        );
      case "Optional":
        return (
          <LucideIcons.CreditCard
            size={20}
            className="mr-2 flex-shrink-0 text-neutral-700 dark:text-neutral-300"
          />
        );
      case "License":
        return (
          <LucideIcons.Lock
            size={20}
            className="mr-2 flex-shrink-0 text-neutral-700 dark:text-neutral-300"
          />
        );
      case "Research":
        return (
          <LucideIcons.Lightbulb
            size={20}
            className="mr-2 flex-shrink-0 text-neutral-700 dark:text-neutral-300"
          />
        );
      default:
        return (
          <LucideIcons.FileText
            size={20}
            className="mr-2 flex-shrink-0 text-neutral-700 dark:text-neutral-300"
          />
        );
    }
  };

  // Normalize icon names like "file-text" or "file text" to "FileText"
  const normalizeIconName = (raw?: string | null) => {
    const trimmed = String(raw || "").trim();
    if (!trimmed) return "";
    return trimmed
      .toLowerCase()
      .replace(/[-_\s]+(.)/g, (_, c: string) => c.toUpperCase())
      .replace(/^(.)/, (m) => m.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center p-4 sm:p-8">
      <div className="max-w-4xl w-full bg-white dark:bg-neutral-900 text-foreground rounded-lg shadow-sm p-6 sm:p-8 minimal-border">
        <div id="offer-content" className="bg-transparent">
          {/* Expired Banner - Show only when expired */}
          {displayIsExpired && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                    This offer has expired
                  </h3>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-4">
                    The offer validity period has ended. You can request an
                    extension to extend it by 1 month from today.
                  </p>
                  {extensionError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                      {extensionError}
                    </p>
                  )}
                  {extensionSuccess ? (
                    <p className="text-sm text-green-600 dark:text-green-400 mb-4">
                      Offer extended successfully! The offer is now visible
                      below.
                    </p>
                  ) : (
                    <button
                      onClick={handleRequestExtension}
                      disabled={extending}
                      className="bg-black hover:bg-[var(--accent-color)] text-white hover:text-white px-6 py-2.5 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {extending
                        ? "Requesting Extension..."
                        : "Request Extension"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Offer Content - Hide when expired */}
          {!displayIsExpired && (
            <>
              {/* Header */}
              <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                  <div className="mr-4">
                    <Image
                      src="/envisioning.svg"
                      alt="Envisioning"
                      width={44}
                      height={44}
                      className="h-11 w-11 object-contain dark:invert"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">
                      Envisioning Offer
                      <span className="text-neutral-400 dark:text-neutral-500 ml-1">
                        {shortId}
                      </span>
                    </h1>
                    <div className="flex flex-col">
                      {displayCurrency !== "EUR" && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Currency: {displayCurrency}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                    Finalized:{" "}
                    {formatDate((displayOffer as any).created_at as string)}
                  </p>
                  {(displayOffer as any).valid_until && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                      Valid until:{" "}
                      {formatDate((displayOffer as any).valid_until as string)}
                    </p>
                  )}
                  <div className="flex items-center justify-end">
                    {org?.logo_image_url && (
                      <Image
                        src={org.logo_image_url as string}
                        alt={(org?.name as string) || "Organization logo"}
                        width={100}
                        height={30}
                        className="h-8 w-auto object-contain ml-2"
                      />
                    )}
                  </div>
                </div>
              </header>

              {/* Organization / Corporate Entity */}
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {org && (
                  <div className="bg-card minimal-border rounded-lg overflow-hidden h-full">
                    <div className="bg-muted/60 px-4 py-3 minimal-border">
                      <h2 className="text-lg font-semibold">To</h2>
                    </div>
                    <div className="p-4 space-y-4 text-sm">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Company
                        </h3>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {(org.legal_name as string) || (org.name as string)}
                          </p>
                          {org.country && (
                            <p className="text-muted-foreground">
                              {getCountryName(org.country as string)}
                            </p>
                          )}
                        </div>
                      </div>
                      {contact && (contact.name || contact.email) && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Recipient
                          </h3>
                          <div className="space-y-1">
                            {contact.name && (
                              <p>
                                <span className="font-medium">
                                  {contact.name}
                                </span>
                              </p>
                            )}
                            {contact.company_role && (
                              <p className="text-muted-foreground">
                                {contact.company_role}
                              </p>
                            )}
                            {contact.email && (
                              <p className="text-muted-foreground">
                                {contact.email}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {org.address && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Address
                          </h3>
                          <div className="space-y-1">
                            <p>{org.address as string}</p>
                            {(org.postcode || org.city) && (
                              <p>
                                {org.postcode as string} {org.city as string}
                              </p>
                            )}
                            {org.country && (
                              <p>{getCountryName(org.country as string)}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {org.vat_id && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Tax Information
                          </h3>
                          <p>
                            VAT ID:{" "}
                            <span className="font-medium">
                              {org.vat_id as string}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {corp && (
                  <div className="bg-card minimal-border rounded-lg overflow-hidden h-full">
                    <div className="bg-muted/60 px-4 py-3 minimal-border">
                      <h2 className="text-lg font-semibold">From</h2>
                    </div>
                    <div className="p-4 space-y-4 text-sm">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Company
                        </h3>
                        <div className="space-y-1">
                          <p className="font-medium">
                            {(corp.legal_name as string) ||
                              (corp.name as string)}
                          </p>
                        </div>
                      </div>
                      {(offer as any).created_by_user && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Created by
                          </h3>
                          <div className="space-y-1">
                            <p className="font-medium">
                              {String(
                                (offer as any).created_by_user?.display_name ||
                                  (offer as any).created_by_user?.name ||
                                  ""
                              )}
                            </p>
                            {(offer as any).created_by_user?.email && (
                              <p className="text-muted-foreground">
                                {String((offer as any).created_by_user.email)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      {corp.address && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Address
                          </h3>
                          <div className="space-y-1">
                            <p>{corp.address as string}</p>
                            {(corp.postcode || corp.city) && (
                              <p>
                                {corp.postcode as string} {corp.city as string}
                              </p>
                            )}
                            {corp.country && (
                              <p>{getCountryName(corp.country as string)}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {corp.vat_id && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">
                            Tax Information
                          </h3>
                          <p>
                            VAT ID:{" "}
                            <span className="font-medium">
                              {corp.vat_id as string}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Title */}
              {displayOffer.title && (
                <div className="mb-8 border-t pt-6">
                  <h1 className="text-2xl font-bold mb-2">
                    {displayOffer.title as string}
                  </h1>
                </div>
              )}

              {/* Services table */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Services</h2>
                <div className="overflow-hidden bg-card minimal-border rounded-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-muted-foreground bg-muted">
                        <th className="p-3 font-medium"></th>
                        <th className="p-3 font-medium text-right">Quantity</th>
                        <th className="p-3 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sortedGroupEntries.map(([group, groupServices]) => (
                        <React.Fragment key={group}>
                          <tr className="bg-accent/40">
                            <td
                              colSpan={4}
                              className="px-6 py-3 text-left text-sm font-medium"
                            >
                              {group}
                            </td>
                          </tr>
                          {(groupServices as any[]).map((service, idx) => (
                            <tr key={idx} className="bg-card">
                              <td className="p-3 align-top">
                                <div className="font-medium flex items-center">
                                  {getServiceIcon(
                                    service.name,
                                    service.group_type,
                                    service.icon
                                  )}
                                  {service.name}
                                  {service.url && (
                                    <Link
                                      href={service.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-2 text-muted-foreground hover:text-foreground"
                                      aria-label="Service details"
                                    >
                                      <LucideIcons.Info className="h-4 w-4" />
                                    </Link>
                                  )}
                                  {service.is_recurring && (
                                    <span className="ml-2 text-sm text-muted-foreground">
                                      (Yearly)
                                    </span>
                                  )}
                                </div>
                                {service.description && (
                                  <div className="text-sm mt-2 ml-2">
                                    <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground">
                                      {String(service.description)}
                                    </pre>
                                  </div>
                                )}
                                {service.discount_percentage > 0 && (
                                  <div className="text-xs text-green-600 mt-2 flex items-center">
                                    <span className="inline-block h-2 w-2 rounded-full bg-green-600 mr-1"></span>
                                    {service.discount_percentage}% discount
                                    applied
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-right align-top">
                                {service.quantity}
                              </td>
                              <td className="p-3 text-right font-medium align-top">
                                {formatCurrency(
                                  service.price *
                                    service.quantity *
                                    (1 -
                                      (service.discount_percentage || 0) / 100)
                                )}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="mt-6 bg-card minimal-border rounded-lg overflow-hidden">
                <div className="text-foreground p-4">
                  {discountAmount > 0 ? (
                    <>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-muted-foreground">
                          Subtotal
                        </span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between mb-2 text-muted-foreground">
                        <span className="font-medium">
                          Discount{discountPct ? ` (${discountPct}%)` : ""}
                        </span>
                        <span>{formatCurrency(discountAmount)}</span>
                      </div>
                      {discountReason && (
                        <div className="text-xs text-muted-foreground italic mb-2">
                          {discountReason}
                        </div>
                      )}
                    </>
                  ) : null}
                  <div
                    className={`flex justify-between font-bold text-lg ${
                      discountAmount > 0 ? "mt-2 pt-2 border-t" : ""
                    }`}
                  >
                    <span>Total</span>
                    <span>{formatCurrency(discountedTotal)}</span>
                  </div>
                  {/* Display-only tax row and grand total when tax > 0 */}
                  {taxPct > 0 && (
                    <>
                      <div className="flex justify-between mt-2">
                        <span className="font-medium text-muted-foreground">
                          Tax{taxPct ? ` (${taxPct}%)` : ""}
                          {taxReason ? ` • ${taxReason}` : ""}
                        </span>
                        <span>{formatCurrency(taxAmount)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                        <span>Grand total</span>
                        <span>{formatCurrency(clientGrandTotal)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Resources + PDF */}
              <div className="mt-8 pt-6 border-t no-print">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left column: dynamic offer links */}
                  <div className="flex flex-col gap-3">
                    <PdfExportButton
                      shortId={shortId}
                      offerData={{
                        offer: displayOffer,
                        services: normalized,
                      }}
                    />

                    {Array.isArray((displayOffer as any).selected_links) &&
                    (displayOffer as any).selected_links.length > 0 ? (
                      (displayOffer as any).selected_links.map(
                        (l: any, i: number) => {
                          const iconName = normalizeIconName(l.icon);
                          const Icon =
                            iconName && (LucideIcons as any)[iconName]
                              ? ((LucideIcons as any)[
                                  iconName
                                ] as React.ComponentType<{
                                  className?: string;
                                }>)
                              : null;
                          return (
                            <a
                              key={i}
                              href={l.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground h-10 px-4 text-sm"
                            >
                              {Icon ? (
                                <Icon className="h-5 w-5" />
                              ) : (
                                <LucideIcons.Link className="h-5 w-5" />
                              )}
                              {l.title}
                            </a>
                          );
                        }
                      )
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        No links available
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 no-print">
                    <div className="rounded-md minimal-border p-4 no-print">
                      {!(displayOffer as any).is_accepted ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <LucideIcons.CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-medium">
                              Accept this offer
                            </span>
                          </div>
                          <AcceptOfferWidget
                            offerId={displayOffer.id}
                            mode="public-view"
                            accessEmail={
                              ((displayOffer as any).receiving_contact
                                ?.email as string) || undefined
                            }
                          />
                        </>
                      ) : (
                        <AcceptOfferStatus
                          acceptedAt={
                            (displayOffer as any).accepted_at as string
                          }
                          acceptedByName={
                            (displayOffer as any).accepted_by_name as string
                          }
                          acceptedByEmail={
                            (displayOffer as any).accepted_by_email as string
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms from selected presets (and snapshots) */}
              {(displayOffer as any).payment_terms_text ||
              (displayOffer as any).delivery_conditions_text ? (
                <div className="mt-8 pt-6 border-t text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(displayOffer as any).payment_terms_text ? (
                      <div className="bg-card minimal-border rounded-md p-4">
                        <h3 className="text-base font-semibold mb-2">
                          Payment Terms
                        </h3>
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                          {String((displayOffer as any).payment_terms_text)}
                        </pre>
                      </div>
                    ) : null}
                    {(displayOffer as any).delivery_conditions_text ? (
                      <div className="bg-card minimal-border rounded-md p-4">
                        <h3 className="text-base font-semibold mb-2">
                          Delivery Conditions
                        </h3>
                        <pre className="whitespace-pre-wrap font-sans text-sm">
                          {String(
                            (displayOffer as any).delivery_conditions_text
                          )}
                        </pre>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <footer className="mt-8 pt-6 border-t text-sm text-muted-foreground text-center">
                <Link
                  href={"mailto:contact@envisioning.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-500 hover:underline"
                >
                  contact@envisioning.com
                </Link>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
