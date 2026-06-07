-- EduManage School OS - Live analytics and risk scoring views

create or replace view public.v_student_risk_scores as
with attendance as (
  select
    student_id,
    count(*)::int as attendance_records,
    count(*) filter (where status = 'ABSENT')::int as absent_count,
    count(*) filter (where status = 'LATE')::int as late_count,
    round((count(*) filter (where status = 'PRESENT')::numeric / nullif(count(*), 0)) * 100, 2) as attendance_rate
  from public.attendance_records
  group by student_id
), finance as (
  select
    student_id,
    count(*)::int as invoice_count,
    coalesce(sum(amount - amount_paid), 0)::numeric(12,2) as outstanding_balance,
    count(*) filter (where status = 'OVERDUE')::int as overdue_invoices
  from public.invoices
  group by student_id
), academics as (
  select
    student_id,
    round(avg(total_score), 2) as average_score,
    count(*)::int as result_records
  from public.results
  group by student_id
)
select
  s.organization_id,
  s.id as student_id,
  s.admission_no,
  concat(s.first_name, ' ', s.last_name) as student_name,
  c.name as classroom,
  coalesce(a.attendance_records, 0)::int as attendance_records,
  coalesce(a.absent_count, 0)::int as absent_count,
  coalesce(a.late_count, 0)::int as late_count,
  coalesce(a.attendance_rate, 0)::numeric(5,2) as attendance_rate,
  coalesce(f.invoice_count, 0)::int as invoice_count,
  coalesce(f.outstanding_balance, 0)::numeric(12,2) as outstanding_balance,
  coalesce(f.overdue_invoices, 0)::int as overdue_invoices,
  coalesce(ac.average_score, 0)::numeric(5,2) as average_score,
  coalesce(ac.result_records, 0)::int as result_records,
  (
    case when coalesce(a.attendance_rate, 100) < 75 then 30 when coalesce(a.attendance_rate, 100) < 90 then 15 else 0 end +
    case when coalesce(f.outstanding_balance, 0) > 0 then 25 else 0 end +
    case when coalesce(f.overdue_invoices, 0) > 0 then 20 else 0 end +
    case when coalesce(ac.average_score, 100) < 50 and coalesce(ac.result_records,0) > 0 then 25 when coalesce(ac.average_score, 100) < 65 and coalesce(ac.result_records,0) > 0 then 12 else 0 end +
    case when s.risk_level = 'High' then 20 when s.risk_level = 'Medium' then 10 else 0 end
  )::int as risk_score,
  case
    when (
      case when coalesce(a.attendance_rate, 100) < 75 then 30 when coalesce(a.attendance_rate, 100) < 90 then 15 else 0 end +
      case when coalesce(f.outstanding_balance, 0) > 0 then 25 else 0 end +
      case when coalesce(f.overdue_invoices, 0) > 0 then 20 else 0 end +
      case when coalesce(ac.average_score, 100) < 50 and coalesce(ac.result_records,0) > 0 then 25 when coalesce(ac.average_score, 100) < 65 and coalesce(ac.result_records,0) > 0 then 12 else 0 end +
      case when s.risk_level = 'High' then 20 when s.risk_level = 'Medium' then 10 else 0 end
    ) >= 60 then 'High'
    when (
      case when coalesce(a.attendance_rate, 100) < 75 then 30 when coalesce(a.attendance_rate, 100) < 90 then 15 else 0 end +
      case when coalesce(f.outstanding_balance, 0) > 0 then 25 else 0 end +
      case when coalesce(f.overdue_invoices, 0) > 0 then 20 else 0 end +
      case when coalesce(ac.average_score, 100) < 50 and coalesce(ac.result_records,0) > 0 then 25 when coalesce(ac.average_score, 100) < 65 and coalesce(ac.result_records,0) > 0 then 12 else 0 end +
      case when s.risk_level = 'High' then 20 when s.risk_level = 'Medium' then 10 else 0 end
    ) >= 30 then 'Medium'
    else 'Low'
  end as risk_level_computed
from public.students s
left join public.classrooms c on c.id = s.classroom_id
left join attendance a on a.student_id = s.id
left join finance f on f.student_id = s.id
left join academics ac on ac.student_id = s.id;

create or replace view public.v_school_operating_metrics as
select
  o.id as organization_id,
  o.name as organization_name,
  count(distinct s.id)::int as students_count,
  count(distinct t.id)::int as teachers_count,
  count(distinct c.id)::int as classes_count,
  count(distinct i.id)::int as invoices_count,
  coalesce(sum(distinct i.amount), 0)::numeric(12,2) as total_billed,
  coalesce(sum(distinct i.amount_paid), 0)::numeric(12,2) as total_collected,
  coalesce(sum(distinct (i.amount - i.amount_paid)), 0)::numeric(12,2) as outstanding_balance,
  count(distinct r.student_id)::int as students_with_results,
  round(avg(r.total_score), 2) as average_result_score,
  count(distinct ar.id)::int as attendance_records,
  round((count(distinct ar.id) filter (where ar.status = 'PRESENT')::numeric / nullif(count(distinct ar.id),0)) * 100, 2) as attendance_rate,
  count(distinct risk.student_id) filter (where risk.risk_level_computed = 'High')::int as high_risk_students,
  count(distinct risk.student_id) filter (where risk.risk_level_computed = 'Medium')::int as medium_risk_students,
  count(distinct inv.id) filter (where inv.status = 'pending')::int as pending_invitations
from public.organizations o
left join public.students s on s.organization_id = o.id
left join public.teachers t on t.organization_id = o.id
left join public.classrooms c on c.organization_id = o.id
left join public.invoices i on i.organization_id = o.id
left join public.results r on r.organization_id = o.id
left join public.attendance_records ar on ar.organization_id = o.id
left join public.v_student_risk_scores risk on risk.organization_id = o.id
left join public.user_invitations inv on inv.organization_id = o.id
group by o.id, o.name;
