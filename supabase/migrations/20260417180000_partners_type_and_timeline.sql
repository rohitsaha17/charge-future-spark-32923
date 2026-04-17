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
