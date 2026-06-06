-- EduManage School OS - Result publishing and locking workflow

alter table public.results add column if not exists published_at timestamptz;
alter table public.results add column if not exists locked_at timestamptz;
alter table public.results add column if not exists unlocked_at timestamptz;
alter table public.results add column if not exists lock_reason text;

create table if not exists public.result_publication_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  term text not null,
  session text not null,
  action text not null,
  actor_email text,
  note text,
  created_at timestamptz not null default now()
);

alter table public.result_publication_events enable row level security;

do $$ begin
  create policy "authenticated_read_result_publication_events" on public.result_publication_events for select to authenticated using (true);
exception when duplicate_object then null; end $$;

create index if not exists idx_result_publication_events_org on public.result_publication_events(organization_id, created_at desc);
create index if not exists idx_results_lock_status on public.results(student_id, term, session, status, locked_at);
