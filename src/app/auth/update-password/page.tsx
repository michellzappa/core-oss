"use client";

import { useState, useEffect, Suspense, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import Link from "next/link";
import Spinner from "@/components/ui/primitives/spinner";
import { PageLoader } from "@/components/ui/primitives/page-loader";
import { toast } from "sonner";

function UpdatePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Per Supabase docs, with PKCE flow, code exchange happens server-side in /api/auth/callback
        // If user lands here with ?code=, redirect them to the callback to handle it properly
        const codeFromQuery = new URLSearchParams(window.location.search).get(
          "code",
        );
        if (codeFromQuery) {
          // Redirect to server callback to exchange code for session
          const callbackUrl = new URL(
            "/api/auth/callback",
            window.location.origin,
          );
          callbackUrl.searchParams.set("code", codeFromQuery);
          callbackUrl.searchParams.set("type", "recovery");
          window.location.href = callbackUrl.toString();
          return;
        }

        // Handle legacy hash-based tokens (if any email clients still send them)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            console.error("Error setting session from hash:", sessionError);
            setErrorMessage(
              "Invalid or expired link. Please request a new password reset.",
            );
            setIsLoading(false);
            return;
          }

          // Clear the hash from URL for security
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search,
          );
        }

        // Check if we have a valid session (set by server callback)
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setIsValidToken(true);
        } else {
          setErrorMessage(
            "Invalid or expired link. Please request a new password reset.",
          );
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setErrorMessage("An error occurred. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [supabase, searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      // At this point, we should already have a session (set in useEffect)
      // Just verify we have a session before updating password
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!currentSession) {
        throw new Error(
          "No active session. Please use the link from your email.",
        );
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      toast.success("Password updated successfully");

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PageLoader variant="fullPage" />;
  }

  if (!isValidToken) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-8 minimal-shadow minimal-border rounded-[var(--radius)]">
          <div className="text-center">
            <Link href="/">
              <img
                src="/envisioning.svg"
                alt="Envisioning"
                width="80"
                height="80"
                className="mx-auto mb-4 logo-svg"
              />
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Invalid link</h1>
            <p className="mt-2 text-muted-foreground">
              {errorMessage || "This link is invalid or has expired."}
            </p>
            <div className="mt-6 space-y-2">
              <Link
                href="/auth/reset-password"
                className="text-sm text-primary hover:underline block"
              >
                Request a new password reset
              </Link>
              <Link
                href="/auth/login"
                className="text-sm text-primary hover:underline block"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 minimal-shadow minimal-border rounded-[var(--radius)]">
        <div className="text-center">
          <Link href="/">
            <img
              src="/envisioning.svg"
              alt="Envisioning"
              width="80"
              height="80"
              className="mx-auto mb-4 logo-svg"
            />
          </Link>
          <h1 className="text-3xl font-bold text-foreground">
            Set your password
          </h1>
          <p className="mt-2 text-muted-foreground">
            Choose a secure password for your account
          </p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="p-3 text-sm text-red-600 bg-red-50 rounded-md"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                New password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="minimal-input w-full mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Must be at least 8 characters
              </p>
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-foreground"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="minimal-input w-full mt-1"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="minimal-button w-full flex justify-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <Spinner className="w-5 h-5" />
              ) : (
                "Update password"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UpdatePassword() {
  return (
    <Suspense fallback={<PageLoader variant="fullPage" />}>
      <UpdatePasswordContent />
    </Suspense>
  );
}
