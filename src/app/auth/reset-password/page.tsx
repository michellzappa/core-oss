"use client";

import { useState, Suspense, FormEvent } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import Link from "next/link";
import Spinner from "@/components/ui/primitives/spinner";
import { PageLoader } from "@/components/ui/primitives/page-loader";
import { toast } from "sonner";

function ResetPasswordContent() {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const redirectTo = `${siteUrl}/api/auth/callback?type=recovery`;

      let resetResult;
      try {
        resetResult = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
      } catch (supabaseError: unknown) {
        const errorMessage =
          supabaseError &&
          typeof supabaseError === "object" &&
          "message" in supabaseError
            ? String(supabaseError.message)
            : String(supabaseError);

        resetResult = { data: null, error: { message: errorMessage } };
      }

      if (resetResult.error) {
        const errorMessage =
          resetResult.error.message || String(resetResult.error);
        if (
          errorMessage.includes("after") &&
          errorMessage.includes("seconds")
        ) {
          const match = errorMessage.match(/after (\d+) seconds?/);
          const seconds = match ? parseInt(match[1], 10) : 60;

          const errorMsg = `Please wait ${seconds} seconds before requesting another password reset.`;
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
          setIsSubmitting(false);
          return;
        }

        if (errorMessage.includes("Invalid email")) {
          const errorMsg = "Please enter a valid email address.";
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
          setIsSubmitting(false);
          return;
        }
      }

      setIsSuccess(true);
      toast.success(
        "If an account exists with this email, a password reset link has been sent.",
      );
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

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-8 minimal-shadow minimal-border rounded-[var(--radius)]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">
              Check your email
            </h1>
            <p className="mt-2 text-muted-foreground">
              We've sent a password reset link to {email}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Click the link in the email to reset your password. The link will
              expire in 1 hour.
            </p>
            <div className="mt-6">
              <Link
                href="/auth/login"
                className="text-sm text-primary hover:underline"
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
          <h1 className="text-3xl font-bold text-foreground">Reset password</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your email address and we'll send you a link to reset your
            password
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
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="minimal-input w-full mt-1"
            />
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
                "Send reset link"
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            href="/auth/login"
            className="text-sm text-primary hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<PageLoader variant="fullPage" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
