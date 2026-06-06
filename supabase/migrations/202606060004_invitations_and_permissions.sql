-- EduManage School OS - Invitations and permission foundation

create table if not exists public.user_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  email text not null,
  name text,
  role public.user_role not null,
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  status text not null default 'pending',
  invited_by uuid references public.app_users(id) on delete set null,
  accepted_at timestamptz,
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

do $$ begin
  create trigger set_user_invitations_updated_at before update on public.user_invitations for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

alter table public.user_invitations enable row level security;

do $$ begin
  create policy "authenticated_read_user_invitations" on public.user_invitations for select to authenticated using (true);
exception when duplicate_object then null; end $$;

create index if not exists idx_user_invitations_org_status on public.user_invitations(organization_id, status);
create index if not exists idx_user_invitations_email on public.user_invitations(lower(email));

create or replace view public.v_user_access_summary as
select
  o.id as organization_id,
  o.name as organization_name,
  count(distinct u.id)::int as active_users,
  count(distinct inv.id) filter (where inv.status = 'pending')::int as pending_invitations,
  count(distinct u.id) filter (where u.role = 'SCHOOL_OWNER')::int as owners,
  count(distinct u.id) filter (where u.role = 'PRINCIPAL')::int as principals,
  count(distinct u.id) filter (where u.role = 'TEACHER')::int as teachers,
  count(distinct u.id) filter (where u.role = 'ACCOUNTANT')::int as accountants,
  count(distinct u.id) filter (where u.role = 'PARENT')::int as parents,
  count(distinct u.id) filter (where u.role = 'STUDENT')::int as students
from public.organizations o
left join public.app_users u on u.organization_id = o.id and u.active = true
left join public.user_invitations inv on inv.organization_id = o.id
group by o.id, o.name;
