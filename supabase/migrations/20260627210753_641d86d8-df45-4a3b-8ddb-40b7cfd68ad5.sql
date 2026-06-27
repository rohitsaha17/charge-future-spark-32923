
-- 1. Fix broken rate limit policies on enquiry forms
DROP POLICY IF EXISTS "Rate limited partner submissions" ON public.partner_enquiries;
DROP POLICY IF EXISTS "Rate limited investor submissions" ON public.investor_enquiries;

CREATE POLICY "Anyone can submit partner enquiries"
  ON public.partner_enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can submit investor enquiries"
  ON public.investor_enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. Remove broad SELECT (listing) on public bucket. Files remain reachable via direct public URL.
DROP POLICY IF EXISTS "public_assets_public_read" ON storage.objects;

-- 3. Lock down SECURITY DEFINER helper functions
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
-- authenticated still needs EXECUTE because RLS policies invoke has_role() in the caller's context
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
