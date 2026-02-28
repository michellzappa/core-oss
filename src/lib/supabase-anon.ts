import "server-only";

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/database.types";

// Supabase client using only the anon key (no user session).
// Use this for public-facing routes (e.g. public offer view).
export function createAnonSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false },
  });
}
