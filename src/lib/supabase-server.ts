import "server-only";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/lib/database.types";

export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      async get(name: string) {
        try {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        } catch {
          return undefined;
        }
      },
      async set(name: string, value: string, options: CookieOptions) {
        try {
          const cookieStore = await cookies();
          cookieStore.set({ name, value, ...options });
        } catch {
          // In middleware or other non-mutable contexts, silently no-op.
        }
      },
      async remove(name: string, options: CookieOptions) {
        try {
          const cookieStore = await cookies();
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        } catch {
          // In middleware or other non-mutable contexts, silently no-op.
        }
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
