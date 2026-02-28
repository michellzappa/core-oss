"use client";

import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/primitives/button";
import { Input } from "@/components/ui/primitives/input";

interface AcceptOfferWidgetProps {
  offerId: string;
  mode: "public-view";
  accessEmail?: string | null; // email used to view; required server-side
  className?: string;
  disabled?: boolean;
  helperText?: string;
  onAccepted?: (info: {
    is_accepted?: boolean;
    accepted_at?: string;
    accepted_by_name?: string;
    accepted_by_email?: string;
  }) => void;
}

export function AcceptOfferWidget({
  offerId,
  mode,
  accessEmail,
  className,
  disabled = false,
  helperText,
  onAccepted,
}: AcceptOfferWidgetProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(accessEmail || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const disclaimer = useMemo(
    () =>
      "By confirming, you acknowledge this is a non‑binding confirmation of intent and not a legally binding signature.",
    []
  );

  async function handleAccept() {
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }
    setIsSubmitting(true);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const lang =
        typeof navigator !== "undefined" ? navigator.language : undefined;
      const res = await fetch(`/api/public/offers/${offerId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          email_for_access: email.trim(),
          metadata: { widget_mode: mode, timezone: tz, language: lang },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to accept offer");
      toast.success("Offer accepted. Thank you!");
      if (onAccepted && data?.offer) {
        onAccepted({
          is_accepted: data.offer.is_accepted,
          accepted_at: data.offer.accepted_at,
          accepted_by_name: data.offer.accepted_by_name,
          accepted_by_email: data.offer.accepted_by_email,
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unexpected error";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={className}>
      <div className="space-y-2">
        <label className="text-sm">Full name (e‑signature)</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
        />
      </div>
      <div className="space-y-2 mt-3">
        <label className="text-sm">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.com"
        />
      </div>
      <Button
        onClick={handleAccept}
        disabled={isSubmitting || disabled || !offerId}
        className="mt-4 w-full"
        title={
          !offerId ? "Save your configuration to enable acceptance" : undefined
        }
      >
        {isSubmitting ? "Submitting…" : "Confirm acceptance"}
      </Button>
      {helperText && (
        <p className="mt-2 text-xs text-muted-foreground">{helperText}</p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">{disclaimer}</p>
    </div>
  );
}

export default AcceptOfferWidget;
