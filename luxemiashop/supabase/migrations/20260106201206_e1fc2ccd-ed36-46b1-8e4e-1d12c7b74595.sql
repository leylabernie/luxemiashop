-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create sitemap cache table
CREATE TABLE IF NOT EXISTS public.sitemap_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitemap_xml TEXT NOT NULL,
  product_count INTEGER DEFAULT 0,
  page_count INTEGER DEFAULT 0,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Allow public read access (no auth needed for sitemap)
ALTER TABLE public.sitemap_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sitemap cache is publicly readable" 
ON public.sitemap_cache 
FOR SELECT 
USING (true);

-- Insert initial row
INSERT INTO public.sitemap_cache (sitemap_xml, product_count, page_count)
VALUES ('', 0, 0)
ON CONFLICT DO NOTHING;