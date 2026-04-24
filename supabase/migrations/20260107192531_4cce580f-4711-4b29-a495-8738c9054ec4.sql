-- Fix abandoned_carts: Ensure anonymous carts can't be queried by authenticated users
DROP POLICY IF EXISTS "Authenticated users can view their own carts only" ON public.abandoned_carts;

CREATE POLICY "Users can only view their own carts"
ON public.abandoned_carts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Fix newsletter_subscribers: Make it strictly service_role only for ALL operations
DROP POLICY IF EXISTS "Service role only for reading" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Validated email subscriptions only" ON public.newsletter_subscribers;

-- Service role can do everything (accessed via edge functions with service key)
CREATE POLICY "Service role full access"
ON public.newsletter_subscribers
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- Fix profiles: Add admin read access for support purposes while keeping user isolation
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Users can view only their own profile
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can view all profiles for support (using existing has_role function)
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Fix order_tracking_notifications: Make it explicitly service_role only
DROP POLICY IF EXISTS "Service role only - no client access" ON public.order_tracking_notifications;

CREATE POLICY "Service role only access"
ON public.order_tracking_notifications
FOR ALL
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'service_role'::text);