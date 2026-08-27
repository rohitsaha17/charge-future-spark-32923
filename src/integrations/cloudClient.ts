// Historical stub kept in place because Lovable's auto-sync sometimes
// re-inserts a Vite alias that redirects `@/integrations/supabase/client`
// here. Re-exporting the REST shim means the alias becomes harmless
// instead of white-screening the site with an uncaught throw at boot.
export * from './supabase/client';
export { supabase } from './supabase/client';
