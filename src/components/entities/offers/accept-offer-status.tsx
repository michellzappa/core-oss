"use client";

import React from "react";
import { formatDate } from "@/lib/utils";
import { BadgeCheck } from "lucide-react";

interface AcceptOfferStatusProps {
  acceptedAt: string;
  acceptedByName?: string | null;
  acceptedByEmail?: string | null;
}

export default function AcceptOfferStatus({
  acceptedAt,
  acceptedByName,
  acceptedByEmail,
}: AcceptOfferStatusProps) {
  const by = acceptedByName || acceptedByEmail || null;
  const formatted = formatDate(acceptedAt);
  return (
    <div className="text-sm">
      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
        <BadgeCheck className="h-5 w-5" />
        <span className="font-medium">Offer accepted</span>
      </div>
      <div className="mt-2 text-muted-foreground">
        Accepted on {formatted}
        {by ? <> by {String(by)}</> : null}
      </div>
    </div>
  );
}
