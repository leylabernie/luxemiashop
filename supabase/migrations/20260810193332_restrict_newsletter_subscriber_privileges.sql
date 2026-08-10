revoke all on table public.newsletter_subscribers
from public, anon, authenticated, service_role;

grant select, insert, update
on table public.newsletter_subscribers
to service_role;
