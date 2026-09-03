-- Create consultation_leads table for storing styling consultation requests
CREATE TABLE IF NOT EXISTS public.consultation_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT NOT NULL,
  occasion TEXT,
  preferred_date TEXT,
  budget TEXT,
  requirements TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  CONSTRAINT email_format CHECK (email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);

-- Enable RLS
ALTER TABLE public.consultation_leads ENABLE ROW LEVEL SECURITY;

-- Create indexes for common queries
CREATE INDEX idx_consultation_leads_email ON public.consultation_leads(email);
CREATE INDEX idx_consultation_leads_status ON public.consultation_leads(status);
CREATE INDEX idx_consultation_leads_created_at ON public.consultation_leads(created_at DESC);
CREATE INDEX idx_consultation_leads_country ON public.consultation_leads(country);

-- Consultation data contains contact and event-planning details. Browser
-- roles must not bypass the validated, rate-limited Edge Function by writing
-- directly to PostgREST. Trusted server-side code uses the service role.
REVOKE ALL ON public.consultation_leads FROM PUBLIC;
REVOKE SELECT, INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER
  ON public.consultation_leads FROM anon, authenticated;
GRANT ALL ON public.consultation_leads TO service_role;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_consultation_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = pg_catalog;

CREATE TRIGGER update_consultation_leads_updated_at
  BEFORE UPDATE ON public.consultation_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_leads_updated_at();
