"use client";

import { useCallback } from "react";
import { Search } from "lucide-react";
import { useCommandPalette } from "@/components/providers/command-palette-provider";

export function FloatingSearchButton() {
  const { setOpen } = useCommandPalette();

  const onClick = useCallback(() => setOpen(true), [setOpen]);

  return (
    <button
      type="button"
      aria-label="Open search"
      onClick={onClick}
      className="lg:hidden fixed z-[60] h-12 w-12 rounded-full bg-[var(--card)] text-[var(--foreground)] minimal-shadow minimal-border flex items-center justify-center active:scale-[0.98]"
      style={{
        right: "calc(env(safe-area-inset-right, 0px) + 16px)",
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
      }}
    >
      <Search className="h-5 w-5" />
    </button>
  );
}
