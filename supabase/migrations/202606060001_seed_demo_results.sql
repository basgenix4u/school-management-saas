-- EduManage School OS - Demo academic results seed

insert into public.subjects(organization_id, classroom_id, name, code)
select o.id, c.id, s.name, s.code
from public.organizations o
join public.classrooms c on c.organization_id = o.id and c.name = 'SS2 Science'
cross join (values
  ('Mathematics','MTH'),
  ('English','ENG'),
  ('Physics','PHY'),
  ('Chemistry','CHM'),
  ('Biology','BIO')
) as s(name, code)
where o.slug='greenfield-school'
and not exists (
  select 1 from public.subjects existing
  where existing.organization_id=o.id and existing.name=s.name and coalesce(existing.classroom_id, c.id)=c.id
);

insert into public.results(organization_id, student_id, subject_id, term, session, ca_score, exam_score, grade, remark, status, teacher_comment, principal_comment)
select o.id, st.id, sub.id, 'Second Term', '2025/2026', r.ca, r.exam, r.grade, r.remark, 'APPROVED',
  'Strong academic performance. Continue improving consistency and class participation.',
  'Good performance. Maintain discipline and academic focus.'
from public.organizations o
join public.students st on st.organization_id=o.id and st.admission_no='STU-1001'
join public.subjects sub on sub.organization_id=o.id
join (values
  ('Mathematics',28::numeric,54::numeric,'A','Excellent'),
  ('English',26::numeric,50::numeric,'B','Very Good'),
  ('Physics',30::numeric,58::numeric,'A','Excellent'),
  ('Chemistry',29::numeric,57::numeric,'A','Excellent'),
  ('Biology',31::numeric,59::numeric,'A','Excellent')
) as r(subject_name, ca, exam, grade, remark) on r.subject_name=sub.name
where o.slug='greenfield-school'
on conflict (student_id, subject_id, term, session) do update set
  ca_score=excluded.ca_score,
  exam_score=excluded.exam_score,
  grade=excluded.grade,
  remark=excluded.remark,
  status=excluded.status,
  teacher_comment=excluded.teacher_comment,
  principal_comment=excluded.principal_comment,
  updated_at=now();

insert into public.results(organization_id, student_id, subject_id, term, session, ca_score, exam_score, grade, remark, status, teacher_comment, principal_comment)
select o.id, st.id, sub.id, 'Second Term', '2025/2026', r.ca, r.exam, r.grade, r.remark, 'REVIEW',
  'Creative student. Mathematics support and punctuality improvement recommended.',
  'Good effort. Improve consistency and time management.'
from public.organizations o
join public.students st on st.organization_id=o.id and st.admission_no='STU-1002'
join public.subjects sub on sub.organization_id=o.id
join (values
  ('Mathematics',20::numeric,43::numeric,'C','Good'),
  ('English',30::numeric,55::numeric,'A','Excellent'),
  ('Physics',24::numeric,49::numeric,'B','Very Good')
) as r(subject_name, ca, exam, grade, remark) on r.subject_name=sub.name
where o.slug='greenfield-school'
on conflict (student_id, subject_id, term, session) do update set
  ca_score=excluded.ca_score,
  exam_score=excluded.exam_score,
  grade=excluded.grade,
  remark=excluded.remark,
  status=excluded.status,
  teacher_comment=excluded.teacher_comment,
  principal_comment=excluded.principal_comment,
  updated_at=now();

insert into public.results(organization_id, student_id, subject_id, term, session, ca_score, exam_score, grade, remark, status, teacher_comment, principal_comment)
select o.id, st.id, sub.id, 'Second Term', '2025/2026', r.ca, r.exam, r.grade, r.remark, 'DRAFT',
  'Excellent academic ability. Attendance intervention required.',
  'Outstanding academic result. Attendance should improve before final publication.'
from public.organizations o
join public.students st on st.organization_id=o.id and st.admission_no='STU-1003'
join public.subjects sub on sub.organization_id=o.id
join (values
  ('English',29::numeric,56::numeric,'A','Excellent'),
  ('Mathematics',27::numeric,52::numeric,'B','Very Good'),
  ('Biology',32::numeric,59::numeric,'A','Excellent')
) as r(subject_name, ca, exam, grade, remark) on r.subject_name=sub.name
where o.slug='greenfield-school'
on conflict (student_id, subject_id, term, session) do update set
  ca_score=excluded.ca_score,
  exam_score=excluded.exam_score,
  grade=excluded.grade,
  remark=excluded.remark,
  status=excluded.status,
  teacher_comment=excluded.teacher_comment,
  principal_comment=excluded.principal_comment,
  updated_at=now();
