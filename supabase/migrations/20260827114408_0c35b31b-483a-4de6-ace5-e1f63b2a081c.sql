-- Public read policies must not call has_role (anon lacks EXECUTE on it).
-- Split into: anon-visible rows, and an admin-only policy for authenticated.

DROP POLICY IF EXISTS "Anyone can view active charging stations" ON public.charging_stations;
CREATE POLICY "public_view_active_stations" ON public.charging_stations FOR SELECT TO anon USING (status = 'active');
CREATE POLICY "auth_view_stations" ON public.charging_stations FOR SELECT TO authenticated USING (status = 'active' OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
CREATE POLICY "public_view_published_posts" ON public.blog_posts FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "auth_view_posts" ON public.blog_posts FOR SELECT TO authenticated USING (status = 'published' OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "faqs_public_read" ON public.faqs;
CREATE POLICY "faqs_anon_read" ON public.faqs FOR SELECT TO anon USING (visible);
CREATE POLICY "faqs_auth_read" ON public.faqs FOR SELECT TO authenticated USING (visible OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "services_catalog_public_read" ON public.services_catalog;
CREATE POLICY "services_anon_read" ON public.services_catalog FOR SELECT TO anon USING (visible);
CREATE POLICY "services_auth_read" ON public.services_catalog FOR SELECT TO authenticated USING (visible OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "team_members_public_read" ON public.team_members;
CREATE POLICY "team_anon_read" ON public.team_members FOR SELECT TO anon USING (visible);
CREATE POLICY "team_auth_read" ON public.team_members FOR SELECT TO authenticated USING (visible OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "testimonials_public_read" ON public.testimonials;
CREATE POLICY "testimonials_anon_read" ON public.testimonials FOR SELECT TO anon USING (visible);
CREATE POLICY "testimonials_auth_read" ON public.testimonials FOR SELECT TO authenticated USING (visible OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "partners_public_read" ON public.partners;
CREATE POLICY "partners_anon_read" ON public.partners FOR SELECT TO anon USING (visible);
CREATE POLICY "partners_auth_read" ON public.partners FOR SELECT TO authenticated USING (visible OR has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "statistics_public_read" ON public.statistics;
CREATE POLICY "statistics_anon_read" ON public.statistics FOR SELECT TO anon USING (visible);
CREATE POLICY "statistics_auth_read" ON public.statistics FOR SELECT TO authenticated USING (visible OR has_role(auth.uid(), 'admin'));