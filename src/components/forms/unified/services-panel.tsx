"use client";

import OfferServicesForm from "@/components/entities/offers/offer-services-form";
import { useEffect, useMemo, useState } from "react";
import { useEditPageLock } from "@/components/layouts/pages/edit-page-layout";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/lib/fetchers";

interface ServicesPanelProps {
  currency?: string;
  discountType?: string;
  globalDiscountPercentage?: number;
  taxPercentage?: number;
  taxReason?: string;
  mode?: "create" | "edit";
}

export default function ServicesPanel({
  // currency intentionally ignored; editor always uses EUR for calculations
  globalDiscountPercentage = 0,
  taxPercentage = 0,
  taxReason = "",
  mode = "edit",
}: ServicesPanelProps) {
  const { isLocked } = useEditPageLock();
  const pathname = usePathname();

  const offerId = useMemo(() => {
    const match = (pathname || "").match(/\/dashboard\/offers\/([^/]+)/);
    return match?.[1];
  }, [pathname]);

  const { data } = useSWR<{ services?: Array<Record<string, unknown>> }>(
    offerId ? `/api/offers/${offerId}/services` : null,
    fetcher,
  );

  // store selected services locally and mirror to a hidden input on the left form
  const [selectedServices, setSelectedServices] = useState<
    Array<Record<string, unknown>>
  >([]);

  const offerData = useMemo(
    () => ({
      currency: "EUR",
      global_discount_percentage: globalDiscountPercentage,
      tax_percentage: taxPercentage,
      tax_reason: taxReason,
      services: ((data?.services || []) as Array<Record<string, unknown>>).map(
        (s: Record<string, unknown>) => ({
          id: s.id,
          service_id: s.service_id,
          quantity: s.quantity,
          price: s.price,
          discount_percentage: s.discount_percentage || 0,
          is_custom: s.is_custom || false,
          custom_title: s.custom_title || null,
          custom_description: s.custom_description || null,
        }),
      ),
    }),
    [data, globalDiscountPercentage, taxPercentage, taxReason],
  );

  // Mirror selected services into the left form via a hidden input
  useEffect(() => {
    const formEl = document.querySelector("form");
    if (!formEl) return;
    let hidden = formEl.querySelector(
      "input[name=services_hidden]"
    ) as HTMLInputElement | null;
    if (!hidden) {
      hidden = document.createElement("input");
      hidden.type = "hidden";
      hidden.name = "services_hidden";
      formEl.appendChild(hidden);
    }
    hidden.value = JSON.stringify(selectedServices);
  }, [selectedServices]);

  return (
    <div
      className={`space-y-4 ${
        isLocked ? "pointer-events-none opacity-80" : ""
      }`}
      aria-disabled={isLocked}
    >
      <OfferServicesForm
        initialData={offerData}
        isFinalized={isLocked}
        mode={mode}
        onSelectedServicesChange={setSelectedServices}
      />
    </div>
  );
}
