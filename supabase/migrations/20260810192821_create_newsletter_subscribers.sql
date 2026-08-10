create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'welcome_popup_10_percent',
  discount_code text not null default 'WELCOME10',
  welcome_email_sent_at timestamptz,
  provider_message_id text,
  subscribed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_length_check
    check (char_length(email) between 3 and 254),
  constraint newsletter_subscribers_email_normalized_check
    check (email = lower(btrim(email)) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint newsletter_subscribers_source_check
    check (source = 'welcome_popup_10_percent'),
  constraint newsletter_subscribers_discount_code_check
    check (discount_code = 'WELCOME10'),
  constraint newsletter_subscribers_provider_message_id_check
    check (provider_message_id is null or char_length(provider_message_id) <= 255)
);

alter table public.newsletter_subscribers enable row level security;

revoke all on table public.newsletter_subscribers from public, anon, authenticated, service_role;
grant select, insert, update on table public.newsletter_subscribers to service_role;

create policy "Service role manages newsletter subscribers"
on public.newsletter_subscribers
for all
to service_role
using (true)
with check (true);

comment on table public.newsletter_subscribers is
  'Welcome-offer signups written only by the rate-limited submit-email Edge Function.';
