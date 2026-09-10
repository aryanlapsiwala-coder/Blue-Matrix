import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-url')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (isSupabaseConfigured) {
  console.log('[Supabase] Initialized live PostgreSQL client connected to:', supabaseUrl);
} else {
  console.log('[Supabase] Running in local demo mode. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to connect live PostgreSQL.');
}
