-- Create table for blocked IPs
CREATE TABLE public.blocked_ips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT 'rate_limit_abuse',
  violation_count INTEGER NOT NULL DEFAULT 1,
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  blocked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on IP address
CREATE UNIQUE INDEX idx_blocked_ips_ip_address ON public.blocked_ips(ip_address);

-- Create index for checking active blocks
CREATE INDEX idx_blocked_ips_blocked_until ON public.blocked_ips(blocked_until);

-- Enable RLS
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table
CREATE POLICY "Service role can manage blocked IPs"
  ON public.blocked_ips
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add violation_count column to rate_limits table to track repeated violations
ALTER TABLE public.rate_limits ADD COLUMN IF NOT EXISTS violation_count INTEGER NOT NULL DEFAULT 0;

-- Create function to cleanup expired blocks
CREATE OR REPLACE FUNCTION public.cleanup_expired_blocks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.blocked_ips
  WHERE blocked_until < now();
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_blocked_ips_updated_at
  BEFORE UPDATE ON public.blocked_ips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();