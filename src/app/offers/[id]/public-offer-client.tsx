"use client";

import React, { useEffect, useState } from "react";
import PublicOfferClientWrapper from "@/components/entities/offers/public-offer-client-wrapper";

interface Props {
  id: string;
}

export default function PublicOfferClient({ id }: Props) {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  type OfferPayload = {
    offer: any;
    services: any[];
  };
  const [data, setData] = useState<OfferPayload | null>(null);

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Separate function to handle confirmation with a specific email
  async function handleConfirmWithEmail(emailToUse: string) {
    // Validate email before proceeding
    if (!emailToUse || !isValidEmail(emailToUse)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Load the offer payload with required email
      const res = await fetch(
        `/api/public/offers/${id}?email=${encodeURIComponent(emailToUse)}`
      );

      if (!res.ok) {
        if (res.status === 404) {
          setError("Offer not found. Please check the link or contact us.");
        } else {
          setError("Unable to load offer. Please try again.");
        }
        setLoading(false);
        return;
      }

      const payload = (await res.json()) as OfferPayload;
      setData(payload);

      // Persist email for this offer id (for convenience)
      if (emailToUse) {
        try {
          const key = `public-offer-email:${id}`;
          window.localStorage.setItem(key, emailToUse);
        } catch {}
      }
    } catch {
      setError(
        "Unable to load offer. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    await handleConfirmWithEmail(email);
  }

  // Load previously confirmed email for this offer id and auto-submit if found
  useEffect(() => {
    // Only run once on mount
    if (data || loading) return;
    
    try {
      const key = `public-offer-email:${id}`;
      const saved = window.localStorage.getItem(key);
      if (saved && isValidEmail(saved)) {
        setEmail(saved);
        // Auto-submit if email is valid
        handleConfirmWithEmail(saved);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (data)
    return (
      <PublicOfferClientWrapper offer={data.offer} services={data.services} />
    );

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 text-foreground minimal-border rounded-lg shadow-sm p-6 space-y-4">
        <h1 className="text-xl font-semibold">Access Offer</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email to view this offer.
        </p>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="name@example.com"
          className="w-full minimal-border bg-background text-foreground placeholder:text-muted-foreground rounded px-3 py-2 text-sm dark:bg-black dark:text-white dark:placeholder:text-neutral-400"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!loading && email && isValidEmail(email)) handleConfirm();
            }
          }}
        />
        <button
          onClick={handleConfirm}
          disabled={loading || !email || !isValidEmail(email)}
          className="w-full bg-black text-white hover:bg-black/90 rounded px-3 py-2 text-sm dark:bg-white dark:text-black dark:hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading…" : "View Offer"}
        </button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
