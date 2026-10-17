import { createClient } from "@supabase/supabase-js";

// The publishable key is intended for browser clients; access is restricted by RLS.
// Environment variables can override these defaults for preview or alternate environments.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://terbpositrzvudxyhfuc.supabase.co";
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_LuOwWiU_2eOhCW6roWhvEQ_Lydf573o";

export const isSupabaseConfigured = Boolean(supabaseUrl && publishableKey);
export const supabase = createClient(supabaseUrl, publishableKey);