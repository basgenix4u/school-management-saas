-- EduManage School OS - Database intelligence views

create or replace view public.v_command_center_summary as
select
  o.id as organization_id,
  o.name as organization_name,
  count(distinct s.id)::int as total_students,
  count(distinct t.id)::int as total_teachers,
  count(distinct c.id)::int as total_classrooms,
  count(distinct i.id)::int as total_invoices,
  coalesce(sum(distinct i.amount), 0)::numeric(12,2) as amount_billed,
  coalesce(sum(distinct i.amount_paid), 0)::numeric(12,2) as amount_collected,
  coalesce(sum(distinct (i.amount - i.amount_paid)), 0)::numeric(12,2) as outstanding_balance,
  count(distinct a.id)::int as attendance_records,
  count(distinct ae.id)::int as audit_events
from public.organizations o
left join public.students s on s.organization_id = o.id
left join public.teachers t on t.organization_id = o.id
left join public.classrooms c on c.organization_id = o.id
left join public.invoices i on i.organization_id = o.id
left join public.attendance_records a on a.organization_id = o.id
left join public.audit_events ae on ae.organization_id = o.id
group by o.id, o.name;

create or replace view public.v_student_360 as
select
  s.id,
  s.organization_id,
  s.admission_no,
  concat(s.first_name, ' ', s.last_name) as student_name,
  c.name as classroom,
  s.guardian_name,
  s.guardian_phone,
  s.risk_level,
  count(distinct ar.id)::int as attendance_records,
  count(distinct i.id)::int as invoices,
  coalesce(sum(i.amount - i.amount_paid), 0)::numeric(12,2) as balance
from public.students s
left join public.classrooms c on c.id = s.classroom_id
left join public.attendance_records ar on ar.student_id = s.id
left join public.invoices i on i.student_id = s.id
group by s.id, c.name;

create or replace view public.v_finance_summary as
select
  o.id as organization_id,
  o.name as organization_name,
  count(i.id)::int as invoice_count,
  coalesce(sum(i.amount), 0)::numeric(12,2) as total_billed,
  coalesce(sum(i.amount_paid), 0)::numeric(12,2) as total_collected,
  coalesce(sum(i.amount - i.amount_paid), 0)::numeric(12,2) as total_outstanding,
  count(*) filter (where i.status = 'OVERDUE')::int as overdue_count,
  count(*) filter (where i.status = 'PAID')::int as paid_count
from public.organizations o
left join public.invoices i on i.organization_id = o.id
group by o.id, o.name;

create or replace view public.v_attendance_daily as
select
  organization_id,
  attendance_date,
  count(*)::int as total_marked,
  count(*) filter (where status = 'PRESENT')::int as present_count,
  count(*) filter (where status = 'ABSENT')::int as absent_count,
  count(*) filter (where status = 'LATE')::int as late_count,
  count(*) filter (where status = 'EXCUSED')::int as excused_count
from public.attendance_records
group by organization_id, attendance_date;

create or replace view public.v_results_summary as
select
  r.organization_id,
  r.term,
  r.session,
  count(distinct r.student_id)::int as student_count,
  count(*)::int as subject_results,
  round(avg(r.total_score), 2) as average_score,
  count(*) filter (where r.status = 'APPROVED')::int as approved_count,
  count(*) filter (where r.status = 'DRAFT')::int as draft_count,
  count(*) filter (where r.status = 'REVIEW')::int as review_count,
  count(*) filter (where r.status = 'PUBLISHED')::int as published_count
from public.results r
group by r.organization_id, r.term, r.session;

create or replace function public.get_school_command_center(org_slug text default 'greenfield-school')
returns table (
  organization_name text,
  total_students int,
  total_teachers int,
  total_classrooms int,
  total_invoices int,
  amount_billed numeric,
  amount_collected numeric,
  outstanding_balance numeric,
  attendance_records int,
  audit_events int
)
language sql
security definer
set search_path = public
as $$
  select
    v.organization_name,
    v.total_students,
    v.total_teachers,
    v.total_classrooms,
    v.total_invoices,
    v.amount_billed,
    v.amount_collected,
    v.outstanding_balance,
    v.attendance_records,
    v.audit_events
  from public.v_command_center_summary v
  join public.organizations o on o.id = v.organization_id
  where o.slug = org_slug
  limit 1;
$$;
