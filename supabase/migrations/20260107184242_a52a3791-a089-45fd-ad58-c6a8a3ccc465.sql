-- Fix RLS policies for rate_limits table to only allow service role access
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Fix RLS policies for blocked_ips table to only allow service role access
DROP POLICY IF EXISTS "Service role can manage blocked IPs" ON public.blocked_ips;

CREATE POLICY "Service role can manage blocked IPs"
ON public.blocked_ips FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);