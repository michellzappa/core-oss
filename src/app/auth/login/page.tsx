"use client";

import { useEffect, useState, Suspense, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsString } from "nuqs";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import Link from "next/link";

import Spinner from "@/components/ui/primitives/spinner";
import { PageLoader } from "@/components/ui/primitives/page-loader";
import { toast } from "sonner";

function LoginContent() {
  const router = useRouter();
  const [redirectedFrom] = useQueryState(
    "redirectedFrom",
    parseAsString.withDefault("/dashboard"),
  );
  const sanitizedRedirect =
    redirectedFrom?.startsWith("/") &&
    redirectedFrom !== "/login" &&
    redirectedFrom !== "/auth/login"
      ? redirectedFrom
      : "/dashboard";
  const redirectTo = sanitizedRedirect;
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push(redirectTo);
      } else {
        setIsLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push(redirectTo);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, redirectTo]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (response.error) {
        if (
          response.error.message?.includes("after") &&
          response.error.message?.includes("seconds")
        ) {
          const match = response.error.message.match(/after (\d+) seconds?/);
          const seconds = match ? parseInt(match[1], 10) : 60;
          const errorMsg = `Please wait ${seconds} seconds before trying again.`;
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
          return;
        }
        throw response.error;
      }

      toast.success("Signed in successfully");
    } catch (error: unknown) {
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = String(error.message);

        if (
          errorMessage.includes("after") &&
          errorMessage.includes("seconds")
        ) {
          const match = errorMessage.match(/after (\d+) seconds?/);
          const seconds = match ? parseInt(match[1], 10) : 60;
          const errorMsg = `Please wait ${seconds} seconds before trying again.`;
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
          return;
        }

        if (
          errorMessage.includes("Invalid login credentials") ||
          errorMessage.includes("Email not confirmed") ||
          errorMessage.includes("Invalid email or password")
        ) {
          setErrorMessage("Invalid email or password");
          toast.error("Invalid email or password");
          return;
        }
      }

      const errorMsg =
        error instanceof Error
          ? error.message
          : "An error occurred during authentication";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <PageLoader variant="fullPage" />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-8 bg-card minimal-shadow minimal-border rounded-[var(--radius)]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Sign in</h1>
          <p className="mt-2 text-muted-foreground">to your account</p>
        </div>

        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="p-3 text-sm text-destructive bg-destructive/10 rounded-md"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
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
                className="minimal-input w-full"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="minimal-input w-full"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="minimal-button w-full flex justify-center disabled:opacity-50"
            >
              {isSubmitting ? <Spinner className="w-5 h-5" /> : "Sign in"}
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/auth/reset-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<PageLoader variant="fullPage" />}>
      <LoginContent />
    </Suspense>
  );
}
