-- =========================================================================
-- Content Management: partners, statistics, testimonials, team_members,
-- faqs, services_catalog. All admin-editable from /admin/content.
-- =========================================================================

-- Reusable trigger function exists as public.update_updated_at_column

-- ---------------------------------------------------------------------------
-- partners
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.partners (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    logo_url text,
    website_url text,
    sort_order integer NOT NULL DEFAULT 0,
    visible boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partners_public_read" ON public.partners FOR SELECT USING (visible OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "partners_admin_insert" ON public.partners FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "partners_admin_update" ON public.partners FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "partners_admin_delete" ON public.partners FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------------
-- statistics (the animated counters: "1000+ chargers", "97% uptime", etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.statistics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    label text NOT NULL,
    value text NOT NULL,
    suffix text,
    icon text,
    sort_order integer NOT NULL DEFAULT 0,
    visible boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_statistics_updated_at BEFORE UPDATE ON public.statistics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "statistics_public_read" ON public.statistics FOR SELECT USING (visible OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "statistics_admin_insert" ON public.statistics FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "statistics_admin_update" ON public.statistics FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "statistics_admin_delete" ON public.statistics FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.testimonials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    role text,
    location text,
    image_url text,
    rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
    review text NOT NULL,
    sort_order integer NOT NULL DEFAULT 0,
    visible boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "testimonials_public_read" ON public.testimonials FOR SELECT USING (visible OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "testimonials_admin_insert" ON public.testimonials FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "testimonials_admin_update" ON public.testimonials FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "testimonials_admin_delete" ON public.testimonials FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------------
-- team_members
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    role text NOT NULL,
    image_url text,
    bio text,
    highlight text,
    linkedin_url text,
    youtube_url text,
    sort_order integer NOT NULL DEFAULT 0,
    visible boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_members_public_read" ON public.team_members FOR SELECT USING (visible OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "team_members_admin_insert" ON public.team_members FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "team_members_admin_update" ON public.team_members FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "team_members_admin_delete" ON public.team_members FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------------
-- faqs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.faqs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    question text NOT NULL,
    answer text NOT NULL,
    category text,
    sort_order integer NOT NULL DEFAULT 0,
    visible boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "faqs_public_read" ON public.faqs FOR SELECT USING (visible OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "faqs_admin_insert" ON public.faqs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "faqs_admin_update" ON public.faqs FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "faqs_admin_delete" ON public.faqs FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------------
-- services_catalog (the charger catalog shown on /services)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.services_catalog (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE,
    name text NOT NULL,
    charger_type text,
    power text,
    price text,
    warranty text,
    description text,
    features text[] NOT NULL DEFAULT '{}',
    ideal_for text,
    image_url text,
    sort_order integer NOT NULL DEFAULT 0,
    visible boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_services_catalog_updated_at BEFORE UPDATE ON public.services_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.services_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services_catalog_public_read" ON public.services_catalog FOR SELECT USING (visible OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "services_catalog_admin_insert" ON public.services_catalog FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "services_catalog_admin_update" ON public.services_catalog FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "services_catalog_admin_delete" ON public.services_catalog FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- ---------------------------------------------------------------------------
-- Storage bucket for blog/featured images and general admin-uploaded assets
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "public_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'public-assets');

-- Admin write
CREATE POLICY "public_assets_admin_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'public-assets'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "public_assets_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'public-assets'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE POLICY "public_assets_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'public-assets'
    AND public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- ---------------------------------------------------------------------------
-- Seed data — only insert when tables are empty so admins who've already
-- populated them won't get duplicates.
-- ---------------------------------------------------------------------------

-- Sample charging stations (so the /find-charger map has markers out of the box)
INSERT INTO public.charging_stations
  (name, address, city, state, district, pin_code, latitude, longitude,
   charger_type, connector_type, power_output, total_chargers, available_chargers,
   price_per_unit, amenities, station_type, status)
SELECT * FROM (VALUES
  ('Guwahati Airport Hub', 'LGBI Airport Terminal Parking', 'Guwahati', 'Assam', 'Kamrup Metro', '781015', 26.10610000, 91.58590000,
   'DC', 'CCS2', '60 kW', 4, 3, 18.00, ARRAY['Restroom','Cafe','Wi-Fi'], 'Public', 'active'),
  ('Shillong Police Bazaar', 'Police Bazaar Main Road', 'Shillong', 'Meghalaya', 'East Khasi Hills', '793001', 25.57880000, 91.89330000,
   'DC', 'CCS2', '60 kW', 3, 2, 20.00, ARRAY['Restroom','Parking'], 'Public', 'active'),
  ('Dibrugarh Airport Station', 'Mohanbari Airport', 'Dibrugarh', 'Assam', 'Dibrugarh', '786012', 27.48380000, 95.01670000,
   'DC', 'CCS2', '60 kW', 2, 2, 18.00, ARRAY['Restroom','Wi-Fi'], 'Public', 'active'),
  ('Silchar Airport Station', 'Kumbhirgram Airport', 'Silchar', 'Assam', 'Cachar', '788734', 24.91290000, 92.97860000,
   'AC', 'Type 2', '7.4 kW', 2, 2, 12.00, ARRAY['Parking'], 'Public', 'active'),
  ('GMDA Fancy Bazar Parking', 'Fancy Bazar Multi-storey Parking', 'Guwahati', 'Assam', 'Kamrup Metro', '781001', 26.18450000, 91.73620000,
   'AC', 'Type 2', '7.4 kW', 6, 5, 12.00, ARRAY['Parking','Security'], 'Public', 'active'),
  ('Jorhat City Charger', 'Tarajan Junction', 'Jorhat', 'Assam', 'Jorhat', '785001', 26.75090000, 94.20370000,
   'AC', 'Type 2', '9.9 kW', 2, 1, 12.00, ARRAY['Parking'], 'Public', 'active'),
  ('Uzan Bazar Residential', 'Uzan Bazar Residential Complex', 'Guwahati', 'Assam', 'Kamrup Metro', '781001', 26.18750000, 91.74470000,
   'AC', 'Type 2', '3.3 kW', 1, 1, 10.00, ARRAY['Parking'], 'Residential', 'active')
) AS t(name, address, city, state, district, pin_code, latitude, longitude,
       charger_type, connector_type, power_output, total_chargers, available_chargers,
       price_per_unit, amenities, station_type, status)
WHERE NOT EXISTS (SELECT 1 FROM public.charging_stations LIMIT 1);

-- Partners
INSERT INTO public.partners (name, sort_order)
SELECT name, sort_order FROM (VALUES
  ('Tata Motors', 10),
  ('MG Motor', 20),
  ('Ather Energy', 30),
  ('Airports Authority of India', 40),
  ('GMDA', 50),
  ('Hero Electric', 60),
  ('Ola Electric', 70)
) AS t(name, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.partners LIMIT 1);

-- Statistics
INSERT INTO public.statistics (label, value, suffix, sort_order)
SELECT label, value, suffix, sort_order FROM (VALUES
  ('Charging Stations', '50', '+', 10),
  ('Network Uptime', '97', '%', 20),
  ('Cities Covered', '12', '+', 30),
  ('Happy Customers', '5000', '+', 40)
) AS t(label, value, suffix, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.statistics LIMIT 1);

-- FAQs
INSERT INTO public.faqs (question, answer, sort_order)
SELECT question, answer, sort_order FROM (VALUES
  ('What is A Plus Charge?', 'A Plus Charge is Northeast India''s leading EV charging infrastructure provider, with a growing network of AC and DC fast chargers across major cities, airports, and highways.', 10),
  ('How do I become a partner?', 'Visit our Partner page, fill the enquiry form with your location and preferred charger type, and our team will contact you within 24 hours to discuss ROI and next steps.', 20),
  ('Do you offer residential chargers?', 'Yes — we offer L1 (3.3 kW) and L2 (7.4/9.9 kW) AC chargers suitable for residential installation, with full warranty and 24/7 support.', 30),
  ('What payment methods are accepted?', 'All A Plus Charge stations accept UPI, debit/credit cards, and our A+ Charge app wallet.', 40)
) AS t(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.faqs LIMIT 1);

-- Services catalog (mirrors the hardcoded /services data)
INSERT INTO public.services_catalog (slug, name, charger_type, power, price, warranty, description, features, ideal_for, sort_order)
SELECT slug, name, charger_type, power, price, warranty, description, features, ideal_for, sort_order FROM (VALUES
  ('l1-3.3kw', 'L1 - 3.3 kW Plug Point', 'AC', '3.3 kW', '₹15,000', '2 years', 'Entry-level AC home charger, ideal for overnight charging of 2-wheelers and compact EVs.',
    ARRAY['Plug and play','Wi-Fi monitoring','Overcurrent protection'], 'Home / 2-wheeler', 10),
  ('l2-7.4kw', 'L2 - 7.4 kW AC Charger', 'AC', '7.4 kW', '₹60,000', '3 years', 'Mid-range single-phase AC charger, perfect for residential car owners.',
    ARRAY['Smart scheduling','RFID unlock','OCPP 1.6'], 'Residential car', 20),
  ('l2-9.9kw', 'L2 - 9.9 kW AC Charger', 'AC', '9.9 kW', '₹55,000', '3 years', 'Higher-power single-phase AC charger for faster home charging.',
    ARRAY['App control','Energy metering','Load balancing'], 'Residential / Small fleet', 30),
  ('dc-30kw', 'DC 30 kW Fast Charger', 'DC', '30 kW', '₹4,50,000', '3 years', 'Compact DC fast charger suitable for small commercial deployments.',
    ARRAY['CCS2 & CHAdeMO','Rugged enclosure','Remote monitoring'], 'Small fleet / Commercial', 40),
  ('dc-60kw', 'DC 60 kW Fast Charger', 'DC', '60 kW', '₹7,50,000', '5 years', 'High-throughput DC fast charger for public stations and highway corridors.',
    ARRAY['Dual CCS2','OCPP 1.6J','24/7 remote diagnostics'], 'Public / Highway', 50)
) AS t(slug, name, charger_type, power, price, warranty, description, features, ideal_for, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.services_catalog LIMIT 1);
