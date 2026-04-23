
-- Fix abandoned_carts: restrict UPDATE to authenticated only
DROP POLICY IF EXISTS "Users can update their own abandoned carts" ON public.abandoned_carts;

CREATE POLICY "Users can update their own abandoned carts"
ON public.abandoned_carts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Explicit deny for anon on abandoned_carts
CREATE POLICY "Deny anon access to abandoned carts"
ON public.abandoned_carts
FOR SELECT
TO anon
USING (false);

-- Explicit deny for anon on profiles
CREATE POLICY "Deny anon access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);
