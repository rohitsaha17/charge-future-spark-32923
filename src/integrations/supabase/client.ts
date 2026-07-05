// Supabase client.
//
// URL + publishable (anon) key come from Vite env vars — the same
// values ship to every browser that loads this site. Row Level Security
// on the Supabase side is the actual security boundary, not hiding the
// anon key. See BOOTSTRAP.md § "Environment" for setup.
//
// We fail loud when either value is missing rather than falling back to
// a hard-coded project URL. A silent fallback used to point at Lovable's
// managed project; after migrating off Lovable that would silently break
// the app in ways that took minutes to diagnose. Better to blow up on
// boot with an obvious message.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const missing = [
    !SUPABASE_URL && 'VITE_SUPABASE_URL',
    !SUPABASE_PUBLISHABLE_KEY && 'VITE_SUPABASE_PUBLISHABLE_KEY',
  ]
    .filter(Boolean)
    .join(', ');
  throw new Error(
    `[supabase] Missing env: ${missing}. Copy .env.example to .env and fill in the values from your Supabase project settings → API.`
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
