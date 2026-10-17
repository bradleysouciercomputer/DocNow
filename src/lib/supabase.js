import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && publishableKey);

// A placeholder keeps the module importable so the app can display setup
// instructions before environment variables have been configured.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  publishableKey || "placeholder-publishable-key"
);