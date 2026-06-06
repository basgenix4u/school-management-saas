-- EduManage School OS - Communication delivery records

create table if not exists public.communication_deliveries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  announcement_id uuid references public.announcements(id) on delete set null,
  channel text not null default 'email',
  recipient_email text not null,
  subject text not null,
  status text not null default 'queued',
  provider text,
  provider_message_id text,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.communication_deliveries enable row level security;

do $$ begin
  create policy "authenticated_read_communication_deliveries" on public.communication_deliveries for select to authenticated using (true);
exception when duplicate_object then null; end $$;

create index if not exists idx_communication_deliveries_org on public.communication_deliveries(organization_id, created_at desc);
create index if not exists idx_communication_deliveries_announcement on public.communication_deliveries(announcement_id);

create or replace view public.v_communication_summary as
select
  o.id as organization_id,
  o.name as organization_name,
  count(distinct a.id)::int as announcements_count,
  count(distinct d.id)::int as deliveries_count,
  count(distinct d.id) filter (where d.status = 'sent')::int as sent_count,
  count(distinct d.id) filter (where d.status = 'failed')::int as failed_count,
  count(distinct d.id) filter (where d.status = 'queued')::int as queued_count
from public.organizations o
left join public.announcements a on a.organization_id = o.id
left join public.communication_deliveries d on d.organization_id = o.id
group by o.id, o.name;
