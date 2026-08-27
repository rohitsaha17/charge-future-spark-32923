import { createClient } from '@supabase/supabase-js';
import type { Database } from './supabase/types';

const cloudUrl = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!cloudUrl || !publishableKey) {
  throw new Error('Lovable Cloud connection is not configured.');
}

export const supabase = createClient<Database>(cloudUrl, publishableKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});