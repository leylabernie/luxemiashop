create policy "Service role manages consultation leads"
on public.consultation_leads
for all
to service_role
using (true)
with check (true);

create policy "Service role manages consultation rate limits"
on public.rate_limits
for all
to service_role
using (true)
with check (true);

create policy "Service role manages consultation blocks"
on public.blocked_ips
for all
to service_role
using (true)
with check (true);
