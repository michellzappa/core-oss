"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";

interface PublicOfferViewProps {
  offer: Record<string, unknown>;
  services: Array<Record<string, unknown>>;
}

export function PublicOfferView({ offer, services }: PublicOfferViewProps) {
  const title = (offer?.title as string) ?? "Offer";
  const currency = (offer?.currency as string) ?? "EUR";
  const total = (offer?.total_amount as number) ?? 0;
  const globalDiscountPct = (offer?.global_discount_percentage as number) ?? 0;
  const discountReason = (offer?.discount_reason as string) ?? "";
  const corp = (
    offer as {
      corporate_entity?: {
        legal_name?: string;
        name?: string;
        address?: string;
        postcode?: string;
        city?: string;
        country?: string;
        vat_id?: string;
        tax_id?: string;
      } | null;
    }
  ).corporate_entity;

  const subtotal = (() => {
    if (!Array.isArray(services)) return total;
    const sum = services.reduce((acc, s) => {
      const price = Number((s as Record<string, unknown>).price) || 0;
      const qty = Number((s as Record<string, unknown>).quantity) || 1;
      return acc + price * qty;
    }, 0);
    return Math.round(sum);
  })();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4">
      <div className="w-full max-w-3xl bg-card border rounded-lg shadow-sm p-6 space-y-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <span className="text-xl font-medium">
            {formatCurrency(total, currency)}
          </span>
        </div>

        {/* Services */}
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Services</h2>
          <div className="space-y-3">
            {services?.map((s: Record<string, unknown>, idx: number) => (
              <div key={idx} className="border rounded-md p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">
                      {String(
                        (s as Record<string, unknown>).name ||
                          (s as Record<string, unknown>).custom_title ||
                          "Service"
                      )}
                    </div>
                    {Boolean((s as Record<string, unknown>).description) && (
                      <ul className="list-disc pl-5 mt-1 space-y-1 text-sm text-muted-foreground">
                        {String(
                          (s as Record<string, unknown>).description as string
                        )
                          .split("\n")
                          .map((line, i) =>
                            line.trim() ? <li key={i}>{line.trim()}</li> : null
                          )}
                      </ul>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <div>
                      {formatCurrency(Number(s.price as number) || 0, currency)}
                      {Number((s as Record<string, unknown>).quantity) > 1
                        ? ` × ${String(
                            (s as Record<string, unknown>).quantity
                          )}`
                        : ""}
                    </div>
                    {Number((s as Record<string, unknown>).quantity) > 1 && (
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(
                          (Number(s.price as number) || 0) *
                            Number((s as Record<string, unknown>).quantity),
                          currency
                        )}
                      </div>
                    )}
                    {Number(s.discount_percentage as number) > 0 && (
                      <div className="text-xs text-muted-foreground">
                        -{Number(s.discount_percentage)}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="mt-4 border rounded-lg overflow-hidden">
          <div className="bg-muted p-4 space-y-2">
            {total !== subtotal ? (
              <React.Fragment>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>
                    Discount
                    {globalDiscountPct > 0 ? ` (${globalDiscountPct}%)` : ""}
                  </span>
                  <span>{formatCurrency(subtotal - total, currency)}</span>
                </div>
                {discountReason && (
                  <div className="text-xs text-muted-foreground italic">
                    {discountReason}
                  </div>
                )}
              </React.Fragment>
            ) : null}
            <div
              className={`flex justify-between font-semibold ${
                total !== subtotal ? "pt-2 border-t" : ""
              }`}
            >
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </div>

        {/* Corporate entity / invoicing details */}
        {corp ? (
          <div className="mt-6 text-sm">
            <h3 className="font-medium mb-2">Envisioning Corporate Entity</h3>
            <div className="text-muted-foreground space-y-1">
              <div>{corp.legal_name || corp.name}</div>
              <div>{corp.address as string}</div>
              <div>
                {corp.postcode as string} {corp.city as string}
              </div>
              <div>{corp.country as string}</div>
              {corp.vat_id && <div>VAT: {corp.vat_id as string}</div>}
              {corp.tax_id && <div>Tax ID: {corp.tax_id as string}</div>}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default PublicOfferView;
