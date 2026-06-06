-- EduManage School OS - Production setup tables

create table if not exists public.academic_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  current_term text not null,
  starts_on date,
  ends_on date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.fee_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  amount numeric(12,2) not null default 0,
  billing_cycle text not null default 'termly',
  required boolean not null default true,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

do $$ begin
  create trigger set_academic_sessions_updated_at before update on public.academic_sessions for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_fee_categories_updated_at before update on public.fee_categories for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

alter table public.academic_sessions enable row level security;
alter table public.fee_categories enable row level security;

do $$ begin
  create policy "authenticated_read_academic_sessions" on public.academic_sessions for select to authenticated using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "authenticated_read_fee_categories" on public.fee_categories for select to authenticated using (true);
exception when duplicate_object then null; end $$;

create or replace view public.v_setup_readiness as
select
  o.id as organization_id,
  o.name as organization_name,
  o.slug,
  count(distinct s.id)::int as students_count,
  count(distinct t.id)::int as teachers_count,
  count(distinct c.id)::int as classes_count,
  count(distinct fc.id)::int as fee_categories_count,
  count(distinct ac.id)::int as academic_sessions_count,
  (
    (case when o.id is not null then 20 else 0 end) +
    (case when count(distinct ac.id) > 0 then 20 else 0 end) +
    (case when count(distinct c.id) > 0 then 20 else 0 end) +
    (case when count(distinct t.id) > 0 then 15 else 0 end) +
    (case when count(distinct s.id) > 0 then 15 else 0 end) +
    (case when count(distinct fc.id) > 0 then 10 else 0 end)
  )::int as readiness_score
from public.organizations o
left join public.academic_sessions ac on ac.organization_id = o.id
left join public.classrooms c on c.organization_id = o.id
left join public.teachers t on t.organization_id = o.id
left join public.students s on s.organization_id = o.id
left join public.fee_categories fc on fc.organization_id = o.id
group by o.id, o.name, o.slug;
