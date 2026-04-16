import { createClient } from "@supabase/supabase-js";

// Browser client for auth — uses NEXT_PUBLIC vars so it's available client-side.
// Sessions are persisted in localStorage and auto-refreshed.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
