-- Fix security: Remove redundant overly-permissive policies that conflict with service_role policies

-- =====================================================
-- 1. FIX BLOCKED_IPS TABLE - Remove redundant USING(true) policy
-- =====================================================
DROP POLICY IF EXISTS "Only service role can access blocked ips" ON public.blocked_ips;

-- =====================================================
-- 2. FIX RATE_LIMITS TABLE - Remove redundant USING(true) policy
-- =====================================================
DROP POLICY IF EXISTS "Only service role can access rate limits" ON public.rate_limits;

-- =====================================================
-- 3. FIX ORDER_TRACKING_NOTIFICATIONS TABLE - Remove redundant USING(true) policy
-- =====================================================
DROP POLICY IF EXISTS "Only service role can access order notifications" ON public.order_tracking_notifications;