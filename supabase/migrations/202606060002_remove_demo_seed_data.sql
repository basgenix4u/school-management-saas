-- EduManage School OS - Remove all demo/seed data for production readiness
-- This migration leaves schema, views and functions intact but clears sample records.

truncate table
  public.payments,
  public.invoices,
  public.results,
  public.attendance_records,
  public.announcements,
  public.audit_events,
  public.subjects,
  public.students,
  public.teachers,
  public.classrooms,
  public.app_users,
  public.organizations
restart identity cascade;

delete from auth.identities
where user_id in (
  select id from auth.users
  where email in (
    'admin@greenfield.test',
    'principal@greenfield.test',
    'teacher@greenfield.test',
    'accountant@greenfield.test',
    'parent@greenfield.test',
    'student@greenfield.test'
  )
);

delete from auth.users
where email in (
  'admin@greenfield.test',
  'principal@greenfield.test',
  'teacher@greenfield.test',
  'accountant@greenfield.test',
  'parent@greenfield.test',
  'student@greenfield.test'
);
