-- Create newsletter_subscribers table to capture email signups
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'popup',
  is_active BOOLEAN NOT NULL DEFAULT true,
  discount_code TEXT,
  discount_used BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for email capture (public signup)
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers 
FOR INSERT 
WITH CHECK (true);

-- No one can read/update/delete from client (only backend)
CREATE POLICY "Service role only for reading" 
ON public.newsletter_subscribers 
FOR SELECT 
USING (false);

-- Create index for faster lookups
CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);

-- Add comment for documentation
COMMENT ON TABLE public.newsletter_subscribers IS 'Stores newsletter subscribers from popup and other sources';