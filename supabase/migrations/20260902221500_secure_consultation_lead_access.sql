-- Consultation leads contain names, contact details, budgets and free-text
-- event requirements. Public forms submit through the validated, rate-limited
-- Edge Function; browser database roles receive no direct table privileges.
-- Trusted Edge Functions use the service role and bypass RLS.

BEGIN;

ALTER TABLE public.consultation_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated read"
  ON public.consultation_leads;
DROP POLICY IF EXISTS "Allow anonymous insert"
  ON public.consultation_leads;
DROP POLICY IF EXISTS "Allow public consultation insert"
  ON public.consultation_leads;
DROP POLICY IF EXISTS "Service role full access"
  ON public.consultation_leads;

REVOKE ALL ON public.consultation_leads FROM PUBLIC;
REVOKE SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.consultation_leads FROM anon, authenticated;
GRANT ALL ON public.consultation_leads TO service_role;

ALTER FUNCTION public.update_consultation_leads_updated_at()
  SET search_path = pg_catalog;

COMMIT;
