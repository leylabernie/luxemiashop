-- Fix security vulnerabilities by consolidating and simplifying RLS policies

-- =====================================================
-- 1. FIX PROFILES TABLE - Remove overlapping policies
-- =====================================================

-- Drop the conflicting policies
DROP POLICY IF EXISTS "No anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can only view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a single, clear SELECT policy using security definer function
CREATE POLICY "Users can view own profile or admin can view all"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id 
  OR has_role(auth.uid(), 'admin')
);

-- =====================================================
-- 2. FIX ABANDONED_CARTS TABLE - Tighten access controls
-- =====================================================

-- Drop conflicting and overly permissive policies
DROP POLICY IF EXISTS "Anonymous users can create carts with email only" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Anonymous users can only insert their own carts" ON public.abandoned_carts;
DROP POLICY IF EXISTS "Users can insert their own abandoned carts" ON public.abandoned_carts;
DROP POLICY IF EXISTS "No anonymous select on abandoned carts" ON public.abandoned_carts;

-- Create cleaner policies:
-- Authenticated users can only insert their own carts (user_id must match)
CREATE POLICY "Authenticated users insert own carts"
ON public.abandoned_carts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Guest carts (no user_id) can be created by anyone but only via edge function (service role)
-- This prevents anonymous email harvesting
CREATE POLICY "Service role creates guest carts"
ON public.abandoned_carts
FOR INSERT
WITH CHECK (
  user_id IS NULL 
  AND (auth.jwt() ->> 'role' = 'service_role')
);

-- =====================================================
-- 3. FIX NEWSLETTER_SUBSCRIBERS TABLE - Consolidate policies
-- =====================================================

-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "Service role full access" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Only service role can access newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "No public select on newsletter subscribers" ON public.newsletter_subscribers;

-- Create a single, clear policy for service role only
CREATE POLICY "Service role only access"
ON public.newsletter_subscribers
FOR ALL
USING ((auth.jwt() ->> 'role') = 'service_role')
WITH CHECK ((auth.jwt() ->> 'role') = 'service_role');

-- =====================================================
-- 4. Move pg_net extension out of public schema (if possible)
-- =====================================================
-- Note: This requires superuser privileges and may need to be done by platform
-- The extension is managed by Lovable Cloud