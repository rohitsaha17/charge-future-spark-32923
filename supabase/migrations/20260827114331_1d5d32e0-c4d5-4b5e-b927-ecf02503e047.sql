-- Restore Data API grants (RLS policies still govern row access)
GRANT SELECT ON public.charging_stations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.charging_stations TO authenticated;
GRANT ALL ON public.charging_stations TO service_role;

GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;

GRANT SELECT ON public.services_catalog TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services_catalog TO authenticated;
GRANT ALL ON public.services_catalog TO service_role;

GRANT SELECT ON public.team_members TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;

GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT ALL ON public.testimonials TO service_role;

GRANT SELECT ON public.partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT ALL ON public.partners TO service_role;

GRANT SELECT ON public.statistics TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.statistics TO authenticated;
GRANT ALL ON public.statistics TO service_role;

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

-- Enquiry tables: anon may only submit, never read
GRANT INSERT ON public.partner_enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_enquiries TO authenticated;
GRANT ALL ON public.partner_enquiries TO service_role;

GRANT INSERT ON public.investor_enquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.investor_enquiries TO authenticated;
GRANT ALL ON public.investor_enquiries TO service_role;

-- Roles table: auth-only
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;