-- ============================================================================
-- promote-admin.sql — grant the admin role to a user, by email
--
-- WHY THIS EXISTS
--   Every write policy in this database is gated on
--   has_role(auth.uid(), 'admin'), and public.user_roles is itself protected by
--   "Only admins can insert roles". That is a deliberate chicken-and-egg: the
--   FIRST admin cannot be created through the app, only through a privileged
--   connection like the dashboard SQL Editor. This script is that path.
--
-- HOW TO USE
--   1. Create the user first — either sign up at /admin/login, or use
--      Supabase dashboard -> Authentication -> Users -> Add user.
--      If you use "Add user", tick "Auto Confirm User": AdminLogin.tsx signs
--      out any account whose email_confirmed_at is null.
--   2. Replace the email on the ONE marked line below.
--   3. Paste the whole file into SQL Editor -> Run.
--
-- Plain SQL only (no psql \set), so it behaves identically in the dashboard
-- SQL Editor, `supabase db execute`, and psql. Safe to re-run — ON CONFLICT
-- makes a second run a no-op.
-- ============================================================================

DO $$
DECLARE
  -- >>>>>>>>>>>>>>>>  EDIT THIS ONE LINE  <<<<<<<<<<<<<<<<
  target_email CONSTANT text := 'you@example.com';
  -- >>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  target_id  uuid;
  confirmed  timestamptz;
BEGIN
  IF target_email = 'you@example.com' THEN
    RAISE EXCEPTION 'Edit target_email first — it is still the placeholder.';
  END IF;

  SELECT id, email_confirmed_at
    INTO target_id, confirmed
  FROM auth.users
  WHERE lower(email) = lower(target_email);

  IF target_id IS NULL THEN
    RAISE EXCEPTION
      'No auth user with email %. Create the user first (Authentication -> Users -> Add user, with Auto Confirm ticked), then re-run.',
      target_email;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  IF confirmed IS NULL THEN
    RAISE WARNING
      'Admin role granted, but % has NOT confirmed their email. Sign-in will be refused until they click the verification link, or until you tick "Auto Confirm User" on that user in the dashboard.',
      target_email;
  ELSE
    RAISE NOTICE 'Granted admin to % (%)', target_email, target_id;
  END IF;
END
$$;

-- Verify — expect one row per admin, with email_confirmed = true.
SELECT u.email,
       u.email_confirmed_at IS NOT NULL AS email_confirmed,
       r.role,
       r.created_at AS role_granted_at
FROM public.user_roles r
JOIN auth.users u ON u.id = r.user_id
WHERE r.role = 'admin'
ORDER BY r.created_at;
