-- Restore the newsletter submission contract used by live LuxeMia forms.
-- The function writes approved lowercase source labels such as `welcome_popup` and
-- `footer`; they must be bounded and machine-safe without rejecting valid leads.

BEGIN;

ALTER TABLE public.newsletter_subscribers
  DROP CONSTRAINT IF EXISTS newsletter_subscribers_source_check;

ALTER TABLE public.newsletter_subscribers
  ADD CONSTRAINT newsletter_subscribers_source_check
  CHECK (source IS NULL OR source ~ '^[a-z][a-z0-9_]{0,63}$');

COMMIT;
