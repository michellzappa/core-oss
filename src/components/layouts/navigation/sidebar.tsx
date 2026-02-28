"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import {
  Settings,
  LogOut,
  CircleUserRound,
  Menu,
  X,
  Search,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useCommandPalette } from "@/components/providers/command-palette-provider";
import NextLinkWithPrefetch from "./next-link-with-prefetch";
import { createBrowserSupabaseClient } from "@/lib/supabase-browser";
import { getDashboardNavigation } from "@/lib/navigation-config";
import {
  Sidebar as AppSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/navigation/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/navigation/dropdown-menu";

interface SidebarProps {
  userEmail?: string | null;
}

export default function Sidebar({ userEmail = null }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [user, setUser] = useState<User | null>(null);
  const { openMobile, setOpenMobile, collapsed, setCollapsed, effectiveCollapsed } =
    useSidebar();
  const { theme, setTheme } = useTheme();
  const { setOpen: setCommandPaletteOpen } = useCommandPalette();
  const [accentColor, setAccentColor] = useState("oklch(0.8 0.193 100)");

  useEffect(() => {
    const saved = localStorage.getItem("accent-color");
    if (saved) setAccentColor(saved);
  }, []);

  const handleAccentChange = useCallback((color: string) => {
    setAccentColor(color);
    localStorage.setItem("accent-color", color);
    document.documentElement.style.setProperty("--accent-color", color);
  }, []);

  useEffect(() => {
    if (userEmail && !user) {
      setUser({
        id: "server-user",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: "",
        email: userEmail,
        phone: "",
        role: "authenticated",
        updated_at: "",
        identities: null,
        confirmed_at: null,
        email_confirmed_at: null,
        phone_confirmed_at: null,
        last_sign_in_at: null,
        is_anonymous: false,
        factors: null,
      } as unknown as User);
    }
  }, [userEmail, user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const isActive = (path: string, exact = false) => {
    if (exact) return pathname === path;
    return pathname?.startsWith(path);
  };

  const mainNavigation = getDashboardNavigation();

  return (
    <>
      <SidebarTrigger
        className="p-0 rounded-lg bg-white dark:bg-[var(--card)] minimal-shadow minimal-border active:scale-[0.98]"
      >
        {openMobile ? (
          <X className="h-6 w-6 text-[var(--foreground)]" />
        ) : (
          <Menu className="h-6 w-6 text-[var(--foreground)]" />
        )}
      </SidebarTrigger>

      <AppSidebar>
        <div className="relative flex h-full flex-col">
          <SidebarRail
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          />

          <SidebarHeader className="h-16 px-3.5">
            <div className="flex h-full items-center w-full">
              <span
                className={`text-lg font-semibold text-[var(--foreground)] transition-opacity duration-200 whitespace-nowrap ${
                  effectiveCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                }`}
              >
                Core
              </span>
            </div>
          </SidebarHeader>

          <div className="px-3.5 pb-2">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className={`w-full flex items-center py-2 text-sm font-medium rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors ${
                effectiveCollapsed ? "justify-center px-2" : "px-3"
              }`}
              title="Search (⌘K)"
            >
              <div className="flex-shrink-0 w-7 flex items-center justify-center">
                <Search className="h-4 w-4" />
              </div>
              <span
                className={`ml-2 transition-opacity duration-200 whitespace-nowrap ${
                  effectiveCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                }`}
              >
                Search
              </span>
            </button>
          </div>

          <SidebarContent className="px-3.5 pb-4">
            <SidebarMenu>
              {mainNavigation.map((item) => {
                const isActiveLink = item.exact
                  ? pathname === item.href
                  : isActive(item.href);

                const showDivider = item.name === "Services";

                const getPrefetchEntity = (href: string) => {
                  if (href.includes("/organizations")) return "organizations";
                  if (href.includes("/contacts")) return "contacts";
                  if (href.includes("/offers")) return "offers";
                  if (href.includes("/projects")) return "projects";
                  if (href.includes("/services")) return "services";
                  return undefined;
                };

                return (
                  <SidebarMenuItem key={item.name}>
                    <NextLinkWithPrefetch
                      href={item.href}
                      prefetchEntity={getPrefetchEntity(item.href)}
                      className={`group flex items-center py-3 text-base lg:py-2 lg:text-sm font-medium rounded-md relative ${
                        isActiveLink
                          ? "bg-neutral-100 dark:bg-[var(--secondary)] text-neutral-900 dark:text-neutral-300"
                          : "text-neutral-900 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[var(--secondary)]"
                      }`}
                      onClick={() => setOpenMobile(false)}
                    >
                      <div className="flex-shrink-0 w-7 flex items-center justify-center">
                        <item.icon
                          className={`h-6 w-6 lg:h-5 lg:w-5 ${
                            isActiveLink
                              ? "text-neutral-900 dark:text-neutral-300"
                              : "text-neutral-700 dark:text-neutral-300"
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      <span
                        className={`ml-3 transition-opacity duration-200 whitespace-nowrap ${
                          effectiveCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                        }`}
                      >
                        {item.name}
                      </span>
                    </NextLinkWithPrefetch>
                    {showDivider && (
                      <div className="h-px bg-neutral-200 dark:bg-[var(--border)] my-2 mx-2" />
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-neutral-200 dark:border-neutral-800">
            <div
              className={`flex items-center py-4 px-3.5 ${
                effectiveCollapsed ? "justify-center flex-col gap-4" : "justify-between"
              }`}
            >
              <Link
                href="/dashboard/settings"
                className="rounded-md text-neutral-900 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                aria-label="Open settings"
                onClick={() => setOpenMobile(false)}
              >
                <div className="flex-shrink-0 w-7 flex items-center justify-center py-2">
                  <Settings className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                </div>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="rounded-md text-neutral-900 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    aria-label="User menu"
                  >
                    <div className="flex-shrink-0 w-7 flex items-center justify-center py-2">
                      <CircleUserRound className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>{userEmail ?? user?.email ?? "Account"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="opacity-60">Appearance</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={
                      theme === "system" || theme === "dark" || theme === "light"
                        ? theme
                        : "system"
                    }
                    onValueChange={(value) => {
                      if (value === "light" || value === "dark" || value === "system") {
                        setTheme(value);
                      }
                    }}
                  >
                    <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="opacity-60">Accent Color</DropdownMenuLabel>
                  <div className="px-2 py-1.5 flex flex-wrap gap-1.5">
                    {[
                      { label: "Red",    value: "oklch(0.8 0.193 20)" },
                      { label: "Orange", value: "oklch(0.8 0.193 60)" },
                      { label: "Lime",   value: "oklch(0.8 0.193 100)" },
                      { label: "Green",  value: "oklch(0.8 0.193 140)" },
                      { label: "Cyan",   value: "oklch(0.8 0.193 180)" },
                      { label: "Blue",   value: "oklch(0.8 0.193 220)" },
                      { label: "Violet", value: "oklch(0.8 0.193 260)" },
                      { label: "Purple", value: "oklch(0.8 0.193 300)" },
                    ].map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleAccentChange(color.value)}
                        className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                        style={{
                          backgroundColor: color.value,
                          borderColor: accentColor === color.value ? "var(--foreground)" : "transparent",
                        }}
                        title={color.label}
                      />
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </div>
      </AppSidebar>
    </>
  );
}
