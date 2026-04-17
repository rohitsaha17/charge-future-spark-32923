// Supabase client.
//
// The URL and publishable (anon) key below are intentionally public — they're
// the same values that ship to every browser that loads this site. Server-side
// security is enforced by Row Level Security on the Supabase side, not by
// hiding these values. Keeping them inline means the site still boots even
// when the build environment doesn't inject env vars (e.g. Lovable redeploys).
// For local overrides, set VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY
// in .env and they'll take precedence.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const PUBLIC_SUPABASE_URL = 'https://hliwejekiwgnrkhbmaun.supabase.co';
const PUBLIC_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsaXdlamVraXdnbnJraGJtYXVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTQzNTIsImV4cCI6MjA3ODQ3MDM1Mn0.JZPHdOQfN858nZ5IzMUy7rpjKKvZYUN7iaSRPfBXX4Q';

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
