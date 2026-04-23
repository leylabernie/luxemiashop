-- Comprehensive RLS security fix for all tables with sensitive data
-- This migration adds explicit SELECT policies to prevent unauthorized access

-- 1. newsletter_subscribers: Only service role should access (already has service role ALL)
-- Add explicit SELECT denial for public/anon by creating a policy that denies all non-service-role access
DROP POLICY IF EXISTS "Service role has full access to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Only service role can access newsletter subscribers"
ON public.newsletter_subscribers
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create a SELECT policy that explicitly denies authenticated/anon users
CREATE POLICY "No public select on newsletter subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated, anon
USING (false);

-- 2. order_tracking_notifications: Only service role should access
DROP POLICY IF EXISTS "Service role has full access to notifications" ON public.order_tracking_notifications;
CREATE POLICY "Only service role can access order notifications"
ON public.order_tracking_notifications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "No public select on order notifications"
ON public.order_tracking_notifications
FOR SELECT
TO authenticated, anon
USING (false);

-- 3. blocked_ips: Only service role should access
DROP POLICY IF EXISTS "Service role has full access to blocked_ips" ON public.blocked_ips;
CREATE POLICY "Only service role can access blocked ips"
ON public.blocked_ips
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "No public select on blocked ips"
ON public.blocked_ips
FOR SELECT
TO authenticated, anon
USING (false);

-- 4. rate_limits: Only service role should access
DROP POLICY IF EXISTS "Service role has full access to rate_limits" ON public.rate_limits;
CREATE POLICY "Only service role can access rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "No public select on rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated, anon
USING (false);

-- 5. profiles: Only authenticated users can view their OWN profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Users can only view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Explicitly deny anon access
CREATE POLICY "No anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- 6. abandoned_carts: Fix anonymous cart viewing issue
-- Anonymous users should only see carts matching their recovery code (if they have one)
-- Authenticated users can only see their own carts
DROP POLICY IF EXISTS "Anonymous users can create carts" ON public.abandoned_carts;
CREATE POLICY "Anonymous users can only insert their own carts"
ON public.abandoned_carts
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);

-- Remove any SELECT access for anon users
CREATE POLICY "No anonymous select on abandoned carts"
ON public.abandoned_carts
FOR SELECT
TO anon
USING (false);