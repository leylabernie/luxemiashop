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

-- RLS Policies
-- Allow anonymous users to insert their own consultation requests
CREATE POLICY "Allow anonymous insert" ON public.consultation_leads
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users (admin) to read all leads
CREATE POLICY "Allow authenticated read" ON public.consultation_leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow service role to manage all leads
CREATE POLICY "Service role full access" ON public.consultation_leads
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_consultation_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consultation_leads_updated_at
  BEFORE UPDATE ON public.consultation_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_consultation_leads_updated_at();
