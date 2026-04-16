import { createClient } from "@supabase/supabase-js";

// Browser client for auth — uses NEXT_PUBLIC vars so it's available client-side.
// Fallback empty strings prevent build/prerender errors; real values apply at runtime.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
