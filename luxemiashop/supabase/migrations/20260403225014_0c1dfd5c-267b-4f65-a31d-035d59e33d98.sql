
-- Fix 1: Tighten profiles SELECT policy to authenticated only with NULL protection
DROP POLICY IF EXISTS "Users can view own profile or admin can view all" ON public.profiles;

CREATE POLICY "Users can view own profile or admin can view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id) 
  OR (auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin'))
);

-- Fix 2: Replace the broad ALL policy on user_roles with scoped policies
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Admin SELECT (view all roles)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin UPDATE
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin DELETE
CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin INSERT (already covered by restrictive + this permissive)
CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
