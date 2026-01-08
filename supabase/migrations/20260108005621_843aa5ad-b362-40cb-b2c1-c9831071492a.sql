-- Fix abandoned_carts SELECT policy to explicitly prevent anonymous access
-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Users can only view their own carts" ON public.abandoned_carts;

-- Create explicit policy for authenticated users only
-- Using TO authenticated ensures anonymous users cannot access any data
CREATE POLICY "Authenticated users can view their own carts"
ON public.abandoned_carts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Anonymous users have no SELECT policy = no read access to any rows
-- Service role access is already covered by the existing ALL policy