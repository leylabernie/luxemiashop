-- Add DELETE policy for profiles so users can delete their own data (GDPR compliance)
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add UPDATE policy for wishlists (optional but good for future use)
CREATE POLICY "Users can update their own wishlist" 
ON public.wishlists 
FOR UPDATE 
USING (auth.uid() = user_id);