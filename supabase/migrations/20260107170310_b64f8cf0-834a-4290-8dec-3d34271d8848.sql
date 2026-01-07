-- Fix: Remove overly permissive anonymous cart creation policy
DROP POLICY IF EXISTS "Allow anonymous cart creation" ON public.abandoned_carts;

-- Fix: Create a more restrictive policy for anonymous cart creation
-- Anonymous users can only insert carts with their email, not view them
CREATE POLICY "Anonymous users can create carts with email only"
ON public.abandoned_carts
FOR INSERT
WITH CHECK (
  user_id IS NULL 
  AND email IS NOT NULL 
  AND length(email) > 0
);

-- Fix: Add policy to prevent anonymous users from reading any carts
-- Only authenticated users can view their own carts
DROP POLICY IF EXISTS "Users can view their own abandoned carts" ON public.abandoned_carts;

CREATE POLICY "Authenticated users can view their own carts only"
ON public.abandoned_carts
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() = user_id
);

-- Fix newsletter_subscribers: ensure permissive insert policy validates email format
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

CREATE POLICY "Validated email subscriptions only"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (
  email IS NOT NULL 
  AND length(email) >= 5 
  AND email LIKE '%@%.%'
);