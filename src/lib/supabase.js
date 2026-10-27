import { createClient } from '@supabase/supabase-js';

// These are publishable/anon values only. Never expose a service-role key here.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;
export const supabaseConfigured = Boolean(supabase);
