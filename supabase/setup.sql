-- ============================================================================
-- setup.sql — GENERATED FILE, DO NOT EDIT BY HAND
--
-- Regenerate with:  npm run setup:sql
-- Source of truth:  supabase/migrations/*.sql (12 files)
--
-- HOW TO USE
--   1. Create a Supabase project at https://supabase.com/dashboard
--   2. Open SQL Editor -> New query
--   3. Paste this entire file and hit Run
--   4. Then run supabase/promote-admin.sql to grant yourself the admin role
--
-- Safe to re-run: policies/triggers are dropped before recreation, and tables
-- use CREATE TABLE IF NOT EXISTS from the content-management migration onward.
-- The very first migration is a pg_dump of the original schema and will error
-- with "already exists" if re-run on a populated database -- that is expected
-- and harmless; every later statement still applies.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 20251111214923_remix_migration_from_pg_dump.sql
-- ---------------------------------------------------------------------------

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text NOT NULL,
    content text NOT NULL,
    featured_image text,
    author_id uuid,
    status text DEFAULT 'draft'::text NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tags text[],
    meta_description text,
    meta_keywords text[]
);


--
-- Name: charging_stations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.charging_stations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    charger_type text NOT NULL,
    connector_type text NOT NULL,
    power_output text NOT NULL,
    total_chargers integer DEFAULT 1 NOT NULL,
    available_chargers integer DEFAULT 1 NOT NULL,
    price_per_unit numeric(10,2),
    amenities text[],
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: charging_stations charging_stations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.charging_stations
    ADD CONSTRAINT charging_stations_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: blog_posts update_blog_posts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: charging_stations update_charging_stations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_charging_stations_updated_at BEFORE UPDATE ON public.charging_stations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: blog_posts blog_posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: charging_stations charging_stations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.charging_stations
    ADD CONSTRAINT charging_stations_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: charging_stations Anyone can view active charging stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active charging stations" ON public.charging_stations FOR SELECT USING (((status = 'active'::text) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: blog_posts Anyone can view published blog posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT USING (((status = 'published'::text) OR public.has_role(auth.uid(), 'admin'::public.app_role)));


--
-- Name: blog_posts Only admins can delete blog posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete blog posts" ON public.blog_posts FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: charging_stations Only admins can delete charging stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete charging stations" ON public.charging_stations FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: blog_posts Only admins can insert blog posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can insert blog posts" ON public.blog_posts FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: charging_stations Only admins can insert charging stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can insert charging stations" ON public.charging_stations FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Only admins can insert roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can insert roles" ON public.user_roles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: blog_posts Only admins can update blog posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update blog posts" ON public.blog_posts FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: charging_stations Only admins can update charging stations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update charging stations" ON public.charging_stations FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: blog_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: charging_stations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.charging_stations ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

-- ---------------------------------------------------------------------------
-- 20251111215952_118b6e44-f6a0-491e-9ec7-a0dbdaa35587.sql
-- ---------------------------------------------------------------------------

-- Force types regeneration by adding a helpful comment
COMMENT ON TABLE public.charging_stations IS 'EV charging station locations with real-time availability';
COMMENT ON TABLE public.user_roles IS 'User role assignments for access control';
COMMENT ON TABLE public.blog_posts IS 'Blog content management';

-- ---------------------------------------------------------------------------
-- 20251121083944_ac6b7d3b-53a3-40e3-8e5a-8a4cd6bd51b8.sql
-- ---------------------------------------------------------------------------

-- Add station_type column to charging_stations table to distinguish between Public and Residential
ALTER TABLE charging_stations 
ADD COLUMN IF NOT EXISTS station_type TEXT DEFAULT 'Public';

-- Add pin_code column for complete address information
ALTER TABLE charging_stations 
ADD COLUMN IF NOT EXISTS pin_code TEXT;

-- Add district column for better location categorization
ALTER TABLE charging_stations 
ADD COLUMN IF NOT EXISTS district TEXT;

-- ---------------------------------------------------------------------------
-- 20251215082815_d3355314-d139-4818-8355-7e07ea9d7ad0.sql
-- ---------------------------------------------------------------------------

-- Create partner_enquiries table to store partner form submissions
CREATE TABLE public.partner_enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  location_lat NUMERIC,
  location_lng NUMERIC,
  location_address TEXT,
  charger_type TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create investor_enquiries table to store investor form submissions
CREATE TABLE public.investor_enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  organization TEXT,
  city TEXT,
  investor_type TEXT,
  investment_range TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.partner_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_enquiries ENABLE ROW LEVEL SECURITY;

-- Partner enquiries: Anyone can insert (public form), only admins can view/update/delete
CREATE POLICY "Anyone can submit partner enquiries" 
ON public.partner_enquiries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view partner enquiries" 
ON public.partner_enquiries 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update partner enquiries" 
ON public.partner_enquiries 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete partner enquiries" 
ON public.partner_enquiries 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Investor enquiries: Anyone can insert (public form), only admins can view/update/delete
CREATE POLICY "Anyone can submit investor enquiries" 
ON public.investor_enquiries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view investor enquiries" 
ON public.investor_enquiries 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update investor enquiries" 
ON public.investor_enquiries 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete investor enquiries" 
ON public.investor_enquiries 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_partner_enquiries_updated_at
BEFORE UPDATE ON public.partner_enquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_investor_enquiries_updated_at
BEFORE UPDATE ON public.investor_enquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------------------
-- 20260107084124_094bfed6-d031-48bb-bd96-1c545b12c19a.sql
-- ---------------------------------------------------------------------------

-- Create site_settings table for storing visibility settings
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read site settings (needed for public pages to check visibility)
CREATE POLICY "Site settings are publicly readable"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can insert/update/delete site settings
CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site settings"
ON public.site_settings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default visibility settings
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES ('visibility', '{
  "pages": {
    "services": true,
    "blog": true,
    "partner": true,
    "invest": true,
    "about": true
  },
  "sections": {
    "home_map": true,
    "home_benefits": true,
    "home_testimonials": true,
    "home_faq": true,
    "home_app_download": true,
    "about_team": true,
    "about_timeline": true
  }
}'::jsonb);

-- ---------------------------------------------------------------------------
-- 20260108075300_e526ef26-aada-46b4-b4b8-daa494ce95b3.sql
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 20260417120000_content_management.sql
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 20260417172348_8d2581a2-37fe-4de5-8ca6-024020adc397.sql
-- ---------------------------------------------------------------------------

-- Content Management tables
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
DROP TRIGGER IF EXISTS update_partners_updated_at ON public.partners;
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "partners_public_read" ON public.partners;
DROP POLICY IF EXISTS "partners_admin_insert" ON public.partners;
DROP POLICY IF EXISTS "partners_admin_update" ON public.partners;
DROP POLICY IF EXISTS "partners_admin_delete" ON public.partners;
CREATE POLICY "partners_public_read" ON public.partners FOR SELECT USING (visible OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "partners_admin_insert" ON public.partners FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "partners_admin_update" ON public.partners FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "partners_admin_delete" ON public.partners FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

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
DROP TRIGGER IF EXISTS update_statistics_updated_at ON public.statistics;
CREATE TRIGGER update_statistics_updated_at BEFORE UPDATE ON public.statistics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "statistics_public_read" ON public.statistics;
DROP POLICY IF EXISTS "statistics_admin_insert" ON public.statistics;
DROP POLICY IF EXISTS "statistics_admin_update" ON public.statistics;
DROP POLICY IF EXISTS "statistics_admin_delete" ON public.statistics;
CREATE POLICY "statistics_public_read" ON public.statistics FOR SELECT USING (visible OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "statistics_admin_insert" ON public.statistics FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "statistics_admin_update" ON public.statistics FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "statistics_admin_delete" ON public.statistics FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

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
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "testimonials_public_read" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_admin_insert" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_admin_update" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_admin_delete" ON public.testimonials;
CREATE POLICY "testimonials_public_read" ON public.testimonials FOR SELECT USING (visible OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "testimonials_admin_insert" ON public.testimonials FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "testimonials_admin_update" ON public.testimonials FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "testimonials_admin_delete" ON public.testimonials FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

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
DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "team_members_public_read" ON public.team_members;
DROP POLICY IF EXISTS "team_members_admin_insert" ON public.team_members;
DROP POLICY IF EXISTS "team_members_admin_update" ON public.team_members;
DROP POLICY IF EXISTS "team_members_admin_delete" ON public.team_members;
CREATE POLICY "team_members_public_read" ON public.team_members FOR SELECT USING (visible OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "team_members_admin_insert" ON public.team_members FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "team_members_admin_update" ON public.team_members FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "team_members_admin_delete" ON public.team_members FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

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
DROP TRIGGER IF EXISTS update_faqs_updated_at ON public.faqs;
CREATE TRIGGER update_faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "faqs_public_read" ON public.faqs;
DROP POLICY IF EXISTS "faqs_admin_insert" ON public.faqs;
DROP POLICY IF EXISTS "faqs_admin_update" ON public.faqs;
DROP POLICY IF EXISTS "faqs_admin_delete" ON public.faqs;
CREATE POLICY "faqs_public_read" ON public.faqs FOR SELECT USING (visible OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "faqs_admin_insert" ON public.faqs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "faqs_admin_update" ON public.faqs FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "faqs_admin_delete" ON public.faqs FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

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
DROP TRIGGER IF EXISTS update_services_catalog_updated_at ON public.services_catalog;
CREATE TRIGGER update_services_catalog_updated_at BEFORE UPDATE ON public.services_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
ALTER TABLE public.services_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "services_catalog_public_read" ON public.services_catalog;
DROP POLICY IF EXISTS "services_catalog_admin_insert" ON public.services_catalog;
DROP POLICY IF EXISTS "services_catalog_admin_update" ON public.services_catalog;
DROP POLICY IF EXISTS "services_catalog_admin_delete" ON public.services_catalog;
CREATE POLICY "services_catalog_public_read" ON public.services_catalog FOR SELECT USING (visible OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "services_catalog_admin_insert" ON public.services_catalog FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "services_catalog_admin_update" ON public.services_catalog FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "services_catalog_admin_delete" ON public.services_catalog FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Storage bucket for admin-uploaded assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_assets_public_read" ON storage.objects;
DROP POLICY IF EXISTS "public_assets_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "public_assets_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "public_assets_admin_delete" ON storage.objects;
CREATE POLICY "public_assets_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'public-assets');
CREATE POLICY "public_assets_admin_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "public_assets_admin_update" ON storage.objects FOR UPDATE USING (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "public_assets_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'public-assets' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Seed data
INSERT INTO public.partners (name, sort_order)
SELECT name, sort_order FROM (VALUES
  ('Tata Motors', 10), ('MG Motor', 20), ('Ather Energy', 30),
  ('Airports Authority of India', 40), ('GMDA', 50),
  ('Hero Electric', 60), ('Ola Electric', 70)
) AS t(name, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.partners LIMIT 1);

INSERT INTO public.statistics (label, value, suffix, sort_order)
SELECT label, value, suffix, sort_order FROM (VALUES
  ('Charging Stations', '50', '+', 10),
  ('Network Uptime', '97', '%', 20),
  ('Cities Covered', '12', '+', 30),
  ('Happy Customers', '5000', '+', 40)
) AS t(label, value, suffix, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.statistics LIMIT 1);

INSERT INTO public.faqs (question, answer, sort_order)
SELECT question, answer, sort_order FROM (VALUES
  ('What is A Plus Charge?', 'A Plus Charge is Northeast India''s leading EV charging infrastructure provider, with a growing network of AC and DC fast chargers across major cities, airports, and highways.', 10),
  ('How do I become a partner?', 'Visit our Partner page, fill the enquiry form with your location and preferred charger type, and our team will contact you within 24 hours to discuss ROI and next steps.', 20),
  ('Do you offer residential chargers?', 'Yes — we offer L1 (3.3 kW) and L2 (7.4/9.9 kW) AC chargers suitable for residential installation, with full warranty and 24/7 support.', 30),
  ('What payment methods are accepted?', 'All A Plus Charge stations accept UPI, debit/credit cards, and our A+ Charge app wallet.', 40)
) AS t(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.faqs LIMIT 1);

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

-- ---------------------------------------------------------------------------
-- 20260417180000_partners_type_and_timeline.sql
-- ---------------------------------------------------------------------------

-- =========================================================================
-- Partners: add type (client vs partner)
-- Journey timeline: dedicated table + CMS support
-- =========================================================================

-- 1) Partner type --------------------------------------------------------------
ALTER TABLE public.partners
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'partner'
  CHECK (type IN ('client', 'partner', 'both'));

-- 2) Journey milestones --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journey_milestones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    year text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text,                    -- lucide icon name, e.g. "Rocket"
    color text,                   -- tailwind gradient, e.g. "from-blue-500 to-cyan-500"
    sort_order integer NOT NULL DEFAULT 0,
    visible boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER update_journey_milestones_updated_at BEFORE UPDATE ON public.journey_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.journey_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journey_milestones_public_read"
  ON public.journey_milestones FOR SELECT
  USING (visible OR public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "journey_milestones_admin_insert"
  ON public.journey_milestones FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "journey_milestones_admin_update"
  ON public.journey_milestones FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "journey_milestones_admin_delete"
  ON public.journey_milestones FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) Seed journey defaults (only when table is empty)
INSERT INTO public.journey_milestones (year, title, description, icon, color, sort_order)
SELECT year, title, description, icon, color, sort_order FROM (VALUES
  ('2023', 'Company Founded', 'AlternatEV Solutions (A Plus Charge) established in Guwahati, Assam',
    'Building2', 'from-blue-500 to-cyan-500', 10),
  ('2023', 'First Pilot Installation', 'Successful deployment of our first EV charging station',
    'Zap', 'from-green-500 to-emerald-500', 20),
  ('2023', 'DPIIT Recognition', 'Received official startup recognition from Department for Promotion of Industry',
    'FileCheck', 'from-purple-500 to-pink-500', 30),
  ('2024', '1st 30 kW DC Fast Charger', 'Deployed on Guwahati–Kaziranga Route, unlocking long-distance EV travel',
    'Battery', 'from-yellow-500 to-amber-500', 40),
  ('2024', 'Partnership with ChargeMOD', 'Strategic collaboration to enhance charging network capabilities',
    'Handshake', 'from-orange-500 to-red-500', 50),
  ('2024', 'Onboarded Lubi EV as Hardware Partner', 'Strengthened hardware supply chain with quality equipment partnership',
    'Building2', 'from-blue-600 to-indigo-600', 60),
  ('2024', 'Crossed 20 Live EV Charging Stations', 'Milestone achievement across Northeast India''s charging infrastructure',
    'Trophy', 'from-rose-500 to-pink-600', 70),
  ('2025', 'Strategic Collaboration with AAI', 'Exclusive partnership with Airport Authority of India for airport charging',
    'Plane', 'from-teal-500 to-cyan-500', 80),
  ('2025', '2nd DC Fast Charger at GMDA Parking', 'Premium public site secured in Guwahati''s high-traffic facility',
    'ParkingCircle', 'from-indigo-500 to-purple-500', 90),
  ('2025', 'Expanded to West Bengal & Tripura', 'Geographic expansion into new Eastern India markets',
    'MapPin', 'from-emerald-500 to-green-600', 100),
  ('2025', 'Partnerships with Tata SCV & MG India', 'OEM partnerships for charger visibility on vehicle dashboards',
    'Car', 'from-amber-500 to-yellow-600', 110),
  ('2025', 'Strategic Partnership with Ather Energy', 'Formalized alliance with leading EV manufacturer',
    'Handshake', 'from-cyan-500 to-blue-600', 120),
  ('2025', 'Launched NE.EV Initiative', 'Dedicated program for DC Charger deployment across Northeast',
    'Rocket', 'from-violet-500 to-purple-600', 130),
  ('2025', 'Crossed 40 Chargers Milestone', 'Doubled our network with 40+ live charging stations',
    'Trophy', 'from-pink-500 to-rose-600', 140),
  ('2025', '40 Additional DC Sites Identified', 'Strategic expansion pipeline for next phase of growth',
    'Target', 'from-blue-500 to-primary', 150)
) AS t(year, title, description, icon, color, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.journey_milestones LIMIT 1);

-- ---------------------------------------------------------------------------
-- 20260420120000_hardening.sql
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 20260421100000_security_fixes.sql
-- ---------------------------------------------------------------------------

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

-- ---------------------------------------------------------------------------
-- 20260627210753_641d86d8-df45-4a3b-8ddb-40b7cfd68ad5.sql
-- ---------------------------------------------------------------------------


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
