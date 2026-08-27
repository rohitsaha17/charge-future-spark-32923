GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON TABLE
  public.blog_posts,
  public.charging_stations,
  public.faqs,
  public.partners,
  public.services_catalog,
  public.site_settings,
  public.statistics,
  public.team_members,
  public.testimonials
TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.blog_posts,
  public.charging_stations,
  public.faqs,
  public.partners,
  public.services_catalog,
  public.site_settings,
  public.statistics,
  public.team_members,
  public.testimonials,
  public.investor_enquiries,
  public.partner_enquiries
TO authenticated;

GRANT INSERT ON TABLE
  public.investor_enquiries,
  public.partner_enquiries
TO anon;

GRANT SELECT ON TABLE public.user_roles TO authenticated;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;