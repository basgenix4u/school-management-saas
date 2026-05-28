-- EduManage School OS - Initial Supabase Schema
-- Safe to run multiple times where possible.

create extension if not exists "pgcrypto";

-- =========================
-- ENUMS
-- =========================
do $$ begin
  create type public.user_role as enum ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','TEACHER','ACCOUNTANT','PARENT','STUDENT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.invoice_status as enum ('PENDING','PARTIAL','PAID','OVERDUE');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.attendance_status as enum ('PRESENT','ABSENT','LATE','EXCUSED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.result_status as enum ('DRAFT','REVIEW','APPROVED','PUBLISHED');
exception when duplicate_object then null; end $$;

-- =========================
-- CORE TABLES
-- =========================
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  email text,
  phone text,
  address text,
  logo_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.user_role not null default 'STUDENT',
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  level text,
  arm text,
  capacity integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name)
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  staff_no text not null,
  name text not null,
  email text,
  phone text,
  department text,
  title text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, staff_no)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  classroom_id uuid references public.classrooms(id) on delete set null,
  admission_no text not null,
  first_name text not null,
  last_name text not null,
  gender text,
  date_of_birth date,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  status text not null default 'Active',
  risk_level text not null default 'Low',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, admission_no)
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  classroom_id uuid references public.classrooms(id) on delete set null,
  teacher_id uuid references public.teachers(id) on delete set null,
  name text not null,
  code text,
  created_at timestamptz not null default now()
);

-- =========================
-- OPERATIONS
-- =========================
create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  classroom_id uuid references public.classrooms(id) on delete set null,
  marked_by uuid references public.teachers(id) on delete set null,
  attendance_date date not null default current_date,
  period text,
  status public.attendance_status not null default 'PRESENT',
  note text,
  created_at timestamptz not null default now(),
  unique (student_id, attendance_date, period)
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  term text not null,
  session text not null,
  ca_score numeric(5,2) not null default 0,
  exam_score numeric(5,2) not null default 0,
  total_score numeric(5,2) generated always as (ca_score + exam_score) stored,
  grade text,
  remark text,
  status public.result_status not null default 'DRAFT',
  teacher_comment text,
  principal_comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, subject_id, term, session)
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  invoice_no text not null unique,
  title text not null default 'School Fees',
  amount numeric(12,2) not null,
  amount_paid numeric(12,2) not null default 0,
  status public.invoice_status not null default 'PENDING',
  due_date date,
  payment_probability integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  amount numeric(12,2) not null,
  provider text,
  reference text unique,
  paid_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  body text not null,
  audience text not null default 'ALL',
  created_by uuid references public.app_users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_id uuid references public.app_users(id) on delete set null,
  actor_name text,
  actor_role text,
  action text not null,
  resource_type text,
  resource_id text,
  risk_level text not null default 'Low',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- =========================
-- INDEXES
-- =========================
create index if not exists idx_students_org_class on public.students(organization_id, classroom_id);
create index if not exists idx_students_search on public.students using gin (to_tsvector('english', first_name || ' ' || last_name || ' ' || admission_no));
create index if not exists idx_attendance_org_date on public.attendance_records(organization_id, attendance_date);
create index if not exists idx_results_student_session on public.results(student_id, term, session);
create index if not exists idx_invoices_org_status on public.invoices(organization_id, status);
create index if not exists idx_audit_org_created on public.audit_events(organization_id, created_at desc);

-- =========================
-- UPDATED_AT TRIGGER
-- =========================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$ begin
  create trigger set_organizations_updated_at before update on public.organizations for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_app_users_updated_at before update on public.app_users for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_students_updated_at before update on public.students for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_teachers_updated_at before update on public.teachers for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_classrooms_updated_at before update on public.classrooms for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_results_updated_at before update on public.results for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_invoices_updated_at before update on public.invoices for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

-- =========================
-- ROW LEVEL SECURITY
-- =========================
alter table public.organizations enable row level security;
alter table public.app_users enable row level security;
alter table public.classrooms enable row level security;
alter table public.teachers enable row level security;
alter table public.students enable row level security;
alter table public.subjects enable row level security;
alter table public.attendance_records enable row level security;
alter table public.results enable row level security;
alter table public.invoices enable row level security;
alter table public.payments enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_events enable row level security;

-- Demo policies: authenticated users can read demo data.
-- Production must replace with organization-scoped policies based on auth.uid().
do $$ begin
  create policy "authenticated_read_organizations" on public.organizations for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated_read_app_users" on public.app_users for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated_read_classrooms" on public.classrooms for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated_read_teachers" on public.teachers for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated_read_students" on public.students for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated_read_subjects" on public.subjects for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated_read_attendance" on public.attendance_records for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated_read_results" on public.results for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated_read_invoices" on public.invoices for select to authenticated using (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "authenticated_read_announcements" on public.announcements for select to authenticated using (true);
exception when duplicate_object then null; end $$;

-- =========================
-- DEMO SEED DATA
-- =========================
insert into public.organizations(name, slug, email, phone, address)
values ('Greenfield International School', 'greenfield-school', 'admin@greenfield.test', '+2348000000000', 'Demo Campus, Nigeria')
on conflict (slug) do update set name = excluded.name, updated_at = now();

insert into public.classrooms(organization_id, name, level, arm, capacity)
select id, 'SS2 Science', 'Senior Secondary', 'Science', 45 from public.organizations where slug='greenfield-school'
on conflict (organization_id, name) do update set capacity=excluded.capacity, updated_at=now();

insert into public.classrooms(organization_id, name, level, arm, capacity)
select id, 'JSS3 Gold', 'Junior Secondary', 'Gold', 40 from public.organizations where slug='greenfield-school'
on conflict (organization_id, name) do update set capacity=excluded.capacity, updated_at=now();

insert into public.teachers(organization_id, staff_no, name, email, phone, department, title)
select id, 'TCH-202', 'Mr. Ibrahim Musa', 'ibrahim@greenfield.test', '+2348000000002', 'Science Department', 'Senior Physics Teacher'
from public.organizations where slug='greenfield-school'
on conflict (organization_id, staff_no) do update set name=excluded.name, updated_at=now();

insert into public.students(organization_id, classroom_id, admission_no, first_name, last_name, gender, guardian_name, guardian_phone, risk_level)
select o.id, c.id, 'STU-1001', 'Amina', 'Yusuf', 'Female', 'Mr. Yusuf', '+2348000000001', 'Low'
from public.organizations o join public.classrooms c on c.organization_id=o.id and c.name='SS2 Science'
where o.slug='greenfield-school'
on conflict (organization_id, admission_no) do update set risk_level=excluded.risk_level, updated_at=now();

insert into public.students(organization_id, classroom_id, admission_no, first_name, last_name, gender, guardian_name, guardian_phone, risk_level)
select o.id, c.id, 'STU-1002', 'Daniel', 'Okoro', 'Male', 'Mrs. Okoro', '+2348000000002', 'Medium'
from public.organizations o join public.classrooms c on c.organization_id=o.id and c.name='JSS3 Gold'
where o.slug='greenfield-school'
on conflict (organization_id, admission_no) do update set risk_level=excluded.risk_level, updated_at=now();

insert into public.students(organization_id, classroom_id, admission_no, first_name, last_name, gender, guardian_name, guardian_phone, risk_level)
select o.id, c.id, 'STU-1003', 'Fatima', 'Bello', 'Female', 'Alh. Bello', '+2348000000003', 'High'
from public.organizations o join public.classrooms c on c.organization_id=o.id and c.name='SS2 Science'
where o.slug='greenfield-school'
on conflict (organization_id, admission_no) do update set risk_level=excluded.risk_level, updated_at=now();

insert into public.subjects(organization_id, classroom_id, teacher_id, name, code)
select o.id, c.id, t.id, 'Physics', 'PHY'
from public.organizations o
join public.classrooms c on c.organization_id=o.id and c.name='SS2 Science'
left join public.teachers t on t.organization_id=o.id and t.staff_no='TCH-202'
where o.slug='greenfield-school';

insert into public.invoices(organization_id, student_id, invoice_no, amount, amount_paid, status, due_date, payment_probability)
select o.id, s.id, 'INV-2026-001', 145000, 145000, 'PAID', '2026-06-10', 100
from public.organizations o join public.students s on s.organization_id=o.id and s.admission_no='STU-1001'
where o.slug='greenfield-school'
on conflict (invoice_no) do update set amount_paid=excluded.amount_paid, status=excluded.status, updated_at=now();

insert into public.invoices(organization_id, student_id, invoice_no, amount, amount_paid, status, due_date, payment_probability)
select o.id, s.id, 'INV-2026-002', 120000, 72000, 'PARTIAL', '2026-06-12', 82
from public.organizations o join public.students s on s.organization_id=o.id and s.admission_no='STU-1002'
where o.slug='greenfield-school'
on conflict (invoice_no) do update set amount_paid=excluded.amount_paid, status=excluded.status, updated_at=now();

insert into public.invoices(organization_id, student_id, invoice_no, amount, amount_paid, status, due_date, payment_probability)
select o.id, s.id, 'INV-2026-003', 135000, 0, 'OVERDUE', '2026-05-25', 38
from public.organizations o join public.students s on s.organization_id=o.id and s.admission_no='STU-1003'
where o.slug='greenfield-school'
on conflict (invoice_no) do update set amount_paid=excluded.amount_paid, status=excluded.status, updated_at=now();

insert into public.attendance_records(organization_id, student_id, classroom_id, attendance_date, period, status, note)
select o.id, s.id, s.classroom_id, current_date, 'Morning', 'PRESENT', 'Demo seed attendance'
from public.organizations o join public.students s on s.organization_id=o.id
where o.slug='greenfield-school'
on conflict (student_id, attendance_date, period) do nothing;

insert into public.audit_events(organization_id, actor_name, actor_role, action, resource_type, resource_id, risk_level)
select id, 'System Seed', 'Automation', 'Initialized Supabase schema and demo data', 'database', 'initial_schema', 'Low'
from public.organizations where slug='greenfield-school';
