"use client";

import * as React from "react";
import { CommandPalette } from "@/components/ui/navigation/command-palette";
import { keyboardShortcuts } from "@/lib/keyboard-shortcuts";
import { usePathname } from "next/navigation";

interface CommandPaletteProviderProps {
  children: React.ReactNode;
  initialData?: {
    organizations: Array<{
      id: string;
      name: string;
      href: string;
      description?: string;
      imageUrl?: string;
      fallback?: string;
    }>;
    contacts: Array<{
      id: string;
      name: string;
      href: string;
      description?: string;
      imageUrl?: string;
      fallback?: string;
    }>;
    projects: Array<{
      id: string;
      name: string;
      href: string;
      description?: string;
      status?: string;
    }>;
    offers: Array<{
      id: string;
      name: string;
      href: string;
      description?: string;
      status?: string;
    }>;
    services: Array<{
      id: string;
      name: string;
      href: string;
      description?: string;
    }>;
  };
}

const CommandPaletteContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export function useCommandPalette() {
  return React.useContext(CommandPaletteContext);
}

export function CommandPaletteProvider({
  children,
  initialData,
}: CommandPaletteProviderProps) {
  const pathname = usePathname();
  const isDashboardPage = (pathname || "").startsWith("/dashboard");
  const shouldDisableCommandPalette = !isDashboardPage;

  const [open, setOpen] = React.useState(false);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!isHydrated || shouldDisableCommandPalette) return;

    const matchCombo = (e: KeyboardEvent, combo: string) => {
      const parts = combo.toLowerCase().split("+");
      const needsCmd = parts.includes("cmd");
      const needsCtrl = parts.includes("ctrl");
      const needsShift = parts.includes("shift");
      const keyPart = parts.find(
        (p) => p !== "cmd" && p !== "ctrl" && p !== "shift",
      );
      if (needsCmd && !e.metaKey) return false;
      if (needsCtrl && !e.ctrlKey) return false;
      if (needsShift && !e.shiftKey) return false;
      if (keyPart) {
        const key = keyPart === "enter" ? "enter" : keyPart;
        if (key === "enter") return e.key === "Enter";
        return e.key.toLowerCase() === key;
      }
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const shortcut of keyboardShortcuts) {
        for (const combo of shortcut.combos) {
          if (matchCombo(e, combo)) {
            e.preventDefault();
            if (shortcut.eventName === "global-open-command-palette") {
              setOpen(true);
            } else {
              document.dispatchEvent(new CustomEvent(shortcut.eventName));
            }
            return;
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isHydrated, shouldDisableCommandPalette]);

  return (
    <CommandPaletteContext.Provider value={{ open, setOpen }}>
      {children}
      {isHydrated && !shouldDisableCommandPalette && open && (
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          initialData={initialData}
        />
      )}
    </CommandPaletteContext.Provider>
  );
}
