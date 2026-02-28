import { cn } from "@/lib/utils";
import Spinner from "./spinner";

interface PageLoaderProps {
  /** "fullPage" centers a card on the viewport (auth, Suspense); "block" fills content area (tables, detail) */
  variant?: "fullPage" | "block";
  /** Optional label below the spinner */
  label?: string;
  className?: string;
}

export function PageLoader({
  variant = "block",
  label = "Loading…",
  className,
}: PageLoaderProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--card)] px-8 py-10 text-[var(--foreground)] shadow-sm",
        variant === "block" && "min-h-[16rem]",
        variant === "fullPage" && "min-h-[12rem] min-w-[14rem]",
        className,
      )}
    >
      <Spinner className="h-8 w-8 shrink-0" />
      {label ? (
        <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
      ) : null}
    </div>
  );

  if (variant === "fullPage") {
    return (
      <div className="flex min-h-screen min-w-full items-center justify-center bg-[var(--background)]">
        {content}
      </div>
    );
  }

  return content;
}
