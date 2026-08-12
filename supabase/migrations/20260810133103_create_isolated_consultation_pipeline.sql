create table if not exists public.consultation_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  phone text not null check (char_length(phone) between 1 and 80),
  country text not null check (char_length(country) between 1 and 100),
  occasion text check (occasion is null or char_length(occasion) <= 200),
  preferred_date text check (preferred_date is null or preferred_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'),
  budget text check (budget is null or char_length(budget) <= 120),
  requirements text check (requirements is null or char_length(requirements) <= 5000),
  status text not null default 'new'
    check (status in ('new', 'contacted', 'scheduled', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  identifier text not null check (char_length(identifier) = 64),
  endpoint text not null check (char_length(endpoint) between 1 and 100),
  request_count integer not null default 1 check (request_count >= 0),
  violation_count integer not null default 0 check (violation_count >= 0),
  window_start timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (identifier, endpoint)
);

create table if not exists public.blocked_ips (
  identifier text primary key check (char_length(identifier) = 64),
  reason text not null check (char_length(reason) between 1 and 100),
  violation_count integer not null default 0 check (violation_count >= 0),
  blocked_at timestamptz not null default now(),
  blocked_until timestamptz not null
);

alter table public.consultation_leads enable row level security;
alter table public.rate_limits enable row level security;
alter table public.blocked_ips enable row level security;

alter table public.consultation_leads force row level security;
alter table public.rate_limits force row level security;
alter table public.blocked_ips force row level security;

revoke all on table public.consultation_leads from public, anon, authenticated;
revoke all on table public.rate_limits from public, anon, authenticated;
revoke all on table public.blocked_ips from public, anon, authenticated;

grant select, insert, update, delete on table public.consultation_leads to service_role;
grant select, insert, update, delete on table public.rate_limits to service_role;
grant select, insert, update, delete on table public.blocked_ips to service_role;

create index if not exists consultation_leads_created_at_idx
  on public.consultation_leads (created_at desc);
create index if not exists consultation_leads_status_idx
  on public.consultation_leads (status);
create index if not exists rate_limits_window_start_idx
  on public.rate_limits (window_start);
create index if not exists blocked_ips_blocked_until_idx
  on public.blocked_ips (blocked_until);

create or replace function public.set_consultation_leads_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_consultation_leads_updated_at() from public;
grant execute on function public.set_consultation_leads_updated_at() to service_role;

drop trigger if exists set_consultation_leads_updated_at
  on public.consultation_leads;

create trigger set_consultation_leads_updated_at
before update on public.consultation_leads
for each row
execute function public.set_consultation_leads_updated_at();
