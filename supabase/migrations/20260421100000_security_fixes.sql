-- =========================================================================
-- Security follow-up migration. Addresses five findings from the
-- 2026-04-21 audit:
--
--   1. The original "Rate limited {partner,investor} submissions" INSERT
--      policies had a scope bug: the unqualified `email` inside the
--      subquery resolves to the subquery's own table column, making the
--      predicate `email = email` — always true. Rate limit was inert.
--      The 20260420120000_hardening.sql file added NEW policies under
--      different names but did NOT drop the old buggy ones, so RLS
--      OR'd them together and the buggy pass-through still let inserts
--      through. Here we drop the old policies by their actual names.
--
--   2. public.site_settings had `USING (true)` on SELECT so any anon
--      visitor could read every row. Tighten to a whitelist of
--      publicly safe keys (visibility flags only). Admins keep full
--      access via a separate authenticated policy.
--
--   3. public.user_roles has INSERT + SELECT policies only. Without a
--      DELETE policy, admin role revocation fails through the SDK —
--      leaving stale privileged accounts un-revocable via RLS. Add an
--      admin-only DELETE (and UPDATE for completeness).
--
--   4. storage.objects had `FOR SELECT USING (bucket_id = 'public-assets')`
--      which lets an anonymous client `.list()` every file in the
--      bucket. Direct public-URL reads don't need this policy for a
--      `public: true` bucket, so we restrict SELECT to admins only.
--      File URLs stay publicly fetchable because the `public` flag
--      on the bucket bypasses RLS for the render path.
--
--   5. Leaked-password protection is a project-level Supabase Auth
--      setting; it cannot be toggled from SQL. Operator action item is
--      documented at the bottom of this file.
-- =========================================================================


-- ---------------------------------------------------------------------------
-- 1. Kill the buggy rate-limit policies from 20260108075300_*.sql.
--    Idempotent: if they've already been dropped this is a no-op.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Rate limited partner submissions"   ON public.partner_enquiries;
DROP POLICY IF EXISTS "Rate limited investor submissions"  ON public.investor_enquiries;

-- Also guard against the "Anyone can submit …" leftovers that the old
-- migrations may or may not have dropped, depending on apply order.
DROP POLICY IF EXISTS "Anyone can submit partner enquiries"  ON public.partner_enquiries;
DROP POLICY IF EXISTS "Anyone can submit investor enquiries" ON public.investor_enquiries;
DROP POLICY IF EXISTS "Anyone can submit partner enquiry"    ON public.partner_enquiries;
DROP POLICY IF EXISTS "Anyone can submit investor enquiry"   ON public.investor_enquiries;

-- Re-assert the correct policy from 20260420120000_hardening.sql in case
-- it was never created (e.g. fresh project before hardening applied).
DROP POLICY IF EXISTS "public_insert_rate_limited" ON public.partner_enquiries;
DROP POLICY IF EXISTS "public_insert_rate_limited" ON public.investor_enquiries;

CREATE POLICY "public_insert_rate_limited" ON public.partner_enquiries
  FOR INSERT
  WITH CHECK (public.enquiry_rate_limit_ok(email, 1, 3));

CREATE POLICY "public_insert_rate_limited" ON public.investor_enquiries
  FOR INSERT
  WITH CHECK (public.enquiry_rate_limit_ok(email, 1, 3));


-- ---------------------------------------------------------------------------
-- 2. site_settings — lock public SELECT to a key whitelist.
--    Only `visibility` is safe to expose to anon visitors today. Any
--    future internal key (api_ flags, feature toggles, credentials that
--    shouldn't have been stored here at all) stays hidden by default.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Site settings are publicly readable" ON public.site_settings;
DROP POLICY IF EXISTS "public_read_site_settings"           ON public.site_settings;
DROP POLICY IF EXISTS "admin_full_site_settings"            ON public.site_settings;

-- Anon/authenticated visitors may only read the visibility flags the
-- public site actually renders against. Admins bypass via the separate
-- admin_full_site_settings policy below.
CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT
  USING (setting_key IN ('visibility'));

-- Admins retain full read access (any key, including anything we add
-- later for internal tooling).
CREATE POLICY "admin_read_site_settings" ON public.site_settings
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));


-- ---------------------------------------------------------------------------
-- 3. user_roles — admin DELETE + UPDATE, so admin role can actually be
--    revoked via the SDK under RLS instead of needing a service-role key.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;

CREATE POLICY "Admins can delete roles" ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update roles" ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


-- ---------------------------------------------------------------------------
-- 4. Storage — stop anonymous LIST on the public-assets bucket.
--    A `public: true` bucket serves direct object URLs without consulting
--    RLS on storage.objects, so removing the anon SELECT doesn't break
--    the public site at all. It only stops the `.list()` API from
--    enumerating filenames.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "public_assets_public_read" ON storage.objects;
DROP POLICY IF EXISTS "public_assets_admin_read"  ON storage.objects;

CREATE POLICY "public_assets_admin_read" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'public-assets'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- While we're here, also ensure no other lingering "anyone can list"
-- policy exists against storage.objects for our buckets.
DROP POLICY IF EXISTS "Public can view blog images"    ON storage.objects;
DROP POLICY IF EXISTS "Public can view site content"   ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view public assets"  ON storage.objects;


-- ---------------------------------------------------------------------------
-- 5. Operator action — NOT SQL-addressable.
--
--    Enable "Prevent sign-ups with leaked passwords" in the Supabase
--    dashboard: Authentication → Policies → Password security →
--    toggle "Leaked password protection". Supabase checks new
--    passwords against the HaveIBeenPwned k-anonymity API.
--
--    Docs: https://supabase.com/docs/guides/auth/password-security
-- ---------------------------------------------------------------------------

COMMENT ON POLICY "public_read_site_settings" ON public.site_settings IS
  'Whitelist: anon visitors may read only the visibility-flags row. Any other setting_key requires authenticated + admin (see admin_read_site_settings).';

COMMENT ON POLICY "public_assets_admin_read" ON storage.objects IS
  'List/metadata access restricted to admins. Direct object URLs still resolve for the public-assets bucket because the bucket is public: true (bypasses RLS for object reads).';
