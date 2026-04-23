-- Create a trigger function to prevent modification of sensitive profile fields
CREATE OR REPLACE FUNCTION public.protect_profile_immutable_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent modification of immutable fields
  -- If any of these differ from OLD values, reset them
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    NEW.id := OLD.id;
  END IF;
  
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    NEW.user_id := OLD.user_id;
  END IF;
  
  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    NEW.created_at := OLD.created_at;
  END IF;
  
  -- Allow the update to proceed with protected fields preserved
  RETURN NEW;
END;
$$;

-- Create the trigger on profiles table
DROP TRIGGER IF EXISTS protect_profiles_immutable_fields ON public.profiles;

CREATE TRIGGER protect_profiles_immutable_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_immutable_fields();