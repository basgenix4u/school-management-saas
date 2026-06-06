-- EduManage School OS - Portal user/student links

alter table public.students add column if not exists student_email text;

create table if not exists public.user_student_links (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  relationship text not null default 'PARENT',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (app_user_id, student_id, relationship)
);

alter table public.user_student_links enable row level security;

do $$ begin
  create policy "authenticated_read_user_student_links" on public.user_student_links for select to authenticated using (true);
exception when duplicate_object then null; end $$;

create index if not exists idx_user_student_links_user on public.user_student_links(app_user_id, relationship);
create index if not exists idx_user_student_links_student on public.user_student_links(student_id);
create index if not exists idx_students_student_email on public.students(lower(student_email));
create index if not exists idx_students_guardian_email on public.students(lower(guardian_email));

create or replace view public.v_portal_student_links as
select
  l.id as link_id,
  l.relationship,
  l.active,
  u.id as app_user_id,
  u.email as user_email,
  u.role as user_role,
  s.id as student_id,
  s.admission_no,
  concat(s.first_name, ' ', s.last_name) as student_name,
  s.student_email,
  s.guardian_name,
  s.guardian_email,
  s.guardian_phone,
  s.risk_level,
  c.name as classroom,
  o.id as organization_id,
  o.name as organization_name
from public.user_student_links l
join public.app_users u on u.id = l.app_user_id
join public.students s on s.id = l.student_id
left join public.classrooms c on c.id = s.classroom_id
join public.organizations o on o.id = l.organization_id;
