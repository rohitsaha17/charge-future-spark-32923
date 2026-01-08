-- Add CHECK constraints for data validation on partner_enquiries
ALTER TABLE public.partner_enquiries
  ADD CONSTRAINT partner_valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT partner_valid_phone CHECK (LENGTH(phone) BETWEEN 10 AND 15),
  ADD CONSTRAINT partner_name_length CHECK (LENGTH(name) BETWEEN 2 AND 100),
  ADD CONSTRAINT partner_message_length CHECK (message IS NULL OR LENGTH(message) <= 2000),
  ADD CONSTRAINT partner_address_length CHECK (location_address IS NULL OR LENGTH(location_address) <= 500),
  ADD CONSTRAINT partner_charger_type_length CHECK (charger_type IS NULL OR LENGTH(charger_type) <= 100);

-- Add CHECK constraints for data validation on investor_enquiries
ALTER TABLE public.investor_enquiries
  ADD CONSTRAINT investor_valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  ADD CONSTRAINT investor_valid_phone CHECK (LENGTH(phone) BETWEEN 10 AND 15),
  ADD CONSTRAINT investor_name_length CHECK (LENGTH(name) BETWEEN 2 AND 100),
  ADD CONSTRAINT investor_org_length CHECK (organization IS NULL OR LENGTH(organization) <= 200),
  ADD CONSTRAINT investor_city_length CHECK (city IS NULL OR LENGTH(city) <= 100);

-- Drop the old INSERT policies
DROP POLICY IF EXISTS "Anyone can submit partner enquiries" ON public.partner_enquiries;
DROP POLICY IF EXISTS "Anyone can submit investor enquiries" ON public.investor_enquiries;

-- Create rate-limited INSERT policy for partner enquiries (max 3 per email per hour)
CREATE POLICY "Rate limited partner submissions"
ON public.partner_enquiries
FOR INSERT
WITH CHECK (
  (SELECT COUNT(*) FROM public.partner_enquiries pe
   WHERE pe.email = email
   AND pe.created_at > now() - interval '1 hour') < 3
);

-- Create rate-limited INSERT policy for investor enquiries (max 3 per email per hour)
CREATE POLICY "Rate limited investor submissions"
ON public.investor_enquiries
FOR INSERT
WITH CHECK (
  (SELECT COUNT(*) FROM public.investor_enquiries ie
   WHERE ie.email = email
   AND ie.created_at > now() - interval '1 hour') < 3
);