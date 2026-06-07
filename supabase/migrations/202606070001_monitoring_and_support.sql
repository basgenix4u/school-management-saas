-- EduManage School OS - Monitoring and support operations

create table if not exists public.app_error_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_email text,
  source text not null default 'server',
  severity text not null default 'error',
  message text not null,
  stack text,
  path text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  requester_email text,
  requester_name text,
  category text not null default 'general',
  priority text not null default 'normal',
  subject text not null,
  description text not null,
  status text not null default 'open',
  assigned_to text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$ begin
  create trigger set_support_tickets_updated_at before update on public.support_tickets for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

alter table public.app_error_events enable row level security;
alter table public.support_tickets enable row level security;

do $$ begin
  create policy "org_members_read_app_error_events" on public.app_error_events for select to authenticated using (organization_id = public.current_app_user_org_id() or organization_id is null);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "org_members_read_support_tickets" on public.support_tickets for select to authenticated using (organization_id = public.current_app_user_org_id() or requester_email = auth.email());
exception when duplicate_object then null; end $$;

create index if not exists idx_app_error_events_org_created on public.app_error_events(organization_id, created_at desc);
create index if not exists idx_app_error_events_resolved on public.app_error_events(resolved, created_at desc);
create index if not exists idx_support_tickets_org_status on public.support_tickets(organization_id, status, created_at desc);
create index if not exists idx_support_tickets_requester on public.support_tickets(lower(requester_email), created_at desc);

create or replace view public.v_support_operations_summary as
select
  o.id as organization_id,
  o.name as organization_name,
  count(distinct t.id)::int as ticket_count,
  count(distinct t.id) filter (where t.status = 'open')::int as open_tickets,
  count(distinct t.id) filter (where t.priority in ('high','urgent'))::int as priority_tickets,
  count(distinct e.id)::int as error_count,
  count(distinct e.id) filter (where e.resolved = false)::int as unresolved_errors
from public.organizations o
left join public.support_tickets t on t.organization_id = o.id
left join public.app_error_events e on e.organization_id = o.id
group by o.id, o.name;
