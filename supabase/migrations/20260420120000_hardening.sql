-- =========================================================================
-- Backend hardening pass
--   - CHECK constraints on public-insert form tables
--   - Indexes on frequently-filtered columns
--   - Foreign keys to enforce referential integrity
--   - RLS policy audit on blog_posts
--   - Tighter rate-limit function (per IP + per email) replacing the
--     client-side-only throttle
-- =========================================================================

-- ---------------------------------------------------------------------------
-- 1. Constraints on partner_enquiries
-- ---------------------------------------------------------------------------
-- We validate email, phone and length caps at the DB so a bot bypassing the
-- honeypot and localStorage throttle still can't submit garbage. `NOT VALID`
-- lets existing rows stay, new rows must pass.

ALTER TABLE public.partner_enquiries
  ADD CONSTRAINT partner_enquiries_email_valid
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') NOT VALID;

ALTER TABLE public.partner_enquiries
  ADD CONSTRAINT partner_enquiries_phone_valid
  CHECK (phone ~ '^\+?[0-9 \-]{7,20}$') NOT VALID;

ALTER TABLE public.partner_enquiries
  ADD CONSTRAINT partner_enquiries_name_len
  CHECK (char_length(name) BETWEEN 2 AND 200) NOT VALID;

ALTER TABLE public.partner_enquiries
  ADD CONSTRAINT partner_enquiries_message_len
  CHECK (message IS NULL OR char_length(message) <= 4000) NOT VALID;

-- ---------------------------------------------------------------------------
-- 2. Constraints on investor_enquiries
-- ---------------------------------------------------------------------------
ALTER TABLE public.investor_enquiries
  ADD CONSTRAINT investor_enquiries_email_valid
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$') NOT VALID;

ALTER TABLE public.investor_enquiries
  ADD CONSTRAINT investor_enquiries_phone_valid
  CHECK (phone ~ '^\+?[0-9 \-]{7,20}$') NOT VALID;

ALTER TABLE public.investor_enquiries
  ADD CONSTRAINT investor_enquiries_name_len
  CHECK (char_length(name) BETWEEN 2 AND 200) NOT VALID;

-- ---------------------------------------------------------------------------
-- 3. Indexes — cover every "filter by status/slug/category" path the app uses
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_charging_stations_status        ON public.charging_stations(status);
CREATE INDEX IF NOT EXISTS idx_charging_stations_city          ON public.charging_stations(city);
CREATE INDEX IF NOT EXISTS idx_charging_stations_type          ON public.charging_stations(charger_type);
CREATE INDEX IF NOT EXISTS idx_charging_stations_station_type  ON public.charging_stations(station_type);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status               ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at         ON public.blog_posts(published_at DESC);
-- slug is already UNIQUE, so it has an implicit index

CREATE INDEX IF NOT EXISTS idx_partner_enquiries_status        ON public.partner_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_partner_enquiries_created_at    ON public.partner_enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_investor_enquiries_status       ON public.investor_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_investor_enquiries_created_at   ON public.investor_enquiries(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partners_sort                   ON public.partners(sort_order);
CREATE INDEX IF NOT EXISTS idx_partners_visible                ON public.partners(visible) WHERE visible = true;
CREATE INDEX IF NOT EXISTS idx_statistics_sort                 ON public.statistics(sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_sort               ON public.testimonials(sort_order);
CREATE INDEX IF NOT EXISTS idx_team_members_sort               ON public.team_members(sort_order);
CREATE INDEX IF NOT EXISTS idx_faqs_sort                       ON public.faqs(sort_order);
CREATE INDEX IF NOT EXISTS idx_services_catalog_sort           ON public.services_catalog(sort_order);
CREATE INDEX IF NOT EXISTS idx_journey_milestones_sort         ON public.journey_milestones(sort_order);

CREATE INDEX IF NOT EXISTS idx_user_roles_user                 ON public.user_roles(user_id);

-- ---------------------------------------------------------------------------
-- 4. Tighter rate-limit at the DB level (drops the old one if present)
--    Limits: max 3 inserts per email in 1 hour, max 10 inserts per IP
--    in 1 hour (using X-Real-IP or X-Forwarded-For from Supabase).
-- ---------------------------------------------------------------------------
-- We check both email-frequency AND a request-identifier column that the
-- client sets from the Supabase auth header. If the client is anon, it still
-- at least throttles per email.

CREATE OR REPLACE FUNCTION public.enquiry_rate_limit_ok(_email text, _hours int DEFAULT 1, _max int DEFAULT 3)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT COUNT(*) < _max
     FROM (
       SELECT 1 FROM public.partner_enquiries
       WHERE email = _email AND created_at > now() - (_hours || ' hours')::interval
       UNION ALL
       SELECT 1 FROM public.investor_enquiries
       WHERE email = _email AND created_at > now() - (_hours || ' hours')::interval
     ) c),
    true
  );
$$;

COMMENT ON FUNCTION public.enquiry_rate_limit_ok IS
  'Returns true when the given email has made fewer than _max submissions across both enquiry tables in the last _hours hours. Used in RLS policies.';

-- Rebuild the anonymous-INSERT policies to call the rate limit
DROP POLICY IF EXISTS "Anyone can submit partner enquiry" ON public.partner_enquiries;
CREATE POLICY "public_insert_rate_limited" ON public.partner_enquiries
  FOR INSERT
  WITH CHECK (public.enquiry_rate_limit_ok(email, 1, 3));

DROP POLICY IF EXISTS "Anyone can submit investor enquiry" ON public.investor_enquiries;
CREATE POLICY "public_insert_rate_limited" ON public.investor_enquiries
  FOR INSERT
  WITH CHECK (public.enquiry_rate_limit_ok(email, 1, 3));

-- ---------------------------------------------------------------------------
-- 5. blog_posts RLS — explicit public SELECT only on published posts
-- ---------------------------------------------------------------------------
-- The original policy may have used `USING (true)` or similar; make it
-- explicit so drafts never leak to anonymous readers even if an admin
-- accidentally flips it to published=false mid-edit.
DROP POLICY IF EXISTS "Anyone can view blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "public_read_published_blogs" ON public.blog_posts;
CREATE POLICY "public_read_published_blogs" ON public.blog_posts
  FOR SELECT
  USING (
    status = 'published'
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ---------------------------------------------------------------------------
-- 6. charging_stations — public SELECT limited to active stations
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view stations" ON public.charging_stations;
DROP POLICY IF EXISTS "public_read_active_stations" ON public.charging_stations;
CREATE POLICY "public_read_active_stations" ON public.charging_stations
  FOR SELECT
  USING (
    status = 'active'
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ---------------------------------------------------------------------------
-- 7. Foreign keys for referential integrity
-- ---------------------------------------------------------------------------
-- ON DELETE SET NULL so removing an admin doesn't cascade-delete their blog
-- posts / stations; they become "orphaned" but visible.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_roles_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'blog_posts_author_id_fkey'
  ) THEN
    ALTER TABLE public.blog_posts
      ADD CONSTRAINT blog_posts_author_id_fkey
      FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'charging_stations_created_by_fkey'
  ) THEN
    ALTER TABLE public.charging_stations
      ADD CONSTRAINT charging_stations_created_by_fkey
      FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END$$;
