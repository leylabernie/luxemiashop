-- Create a policy that denies all client-side access
-- This table should only be accessed via service role (edge functions)
CREATE POLICY "Service role only - no client access" 
ON public.order_tracking_notifications
FOR ALL
TO authenticated, anon
USING (false)
WITH CHECK (false);