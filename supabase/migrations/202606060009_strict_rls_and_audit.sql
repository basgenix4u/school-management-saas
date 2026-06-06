-- EduManage School OS - Strict organization-scoped RLS and audit hardening

-- Helper functions for org-scoped policies
create or replace function public.current_app_user_org_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organization_id
  from public.app_users
  where auth_user_id = auth.uid()
    and active = true
  limit 1;
$$;

create or replace function public.current_app_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.app_users
  where auth_user_id = auth.uid()
    and active = true
  limit 1;
$$;

create or replace function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users
    where auth_user_id = auth.uid()
      and organization_id = target_org
      and active = true
  );
$$;

-- Remove broad demo/setup policies where they exist
DROP POLICY IF EXISTS "authenticated_read_organizations" ON public.organizations;
DROP POLICY IF EXISTS "authenticated_read_app_users" ON public.app_users;
DROP POLICY IF EXISTS "authenticated_read_classrooms" ON public.classrooms;
DROP POLICY IF EXISTS "authenticated_read_teachers" ON public.teachers;
DROP POLICY IF EXISTS "authenticated_read_students" ON public.students;
DROP POLICY IF EXISTS "authenticated_read_subjects" ON public.subjects;
DROP POLICY IF EXISTS "authenticated_read_attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "authenticated_read_results" ON public.results;
DROP POLICY IF EXISTS "authenticated_read_invoices" ON public.invoices;
DROP POLICY IF EXISTS "authenticated_read_announcements" ON public.announcements;
DROP POLICY IF EXISTS "authenticated_read_academic_sessions" ON public.academic_sessions;
DROP POLICY IF EXISTS "authenticated_read_fee_categories" ON public.fee_categories;
DROP POLICY IF EXISTS "authenticated_read_user_invitations" ON public.user_invitations;
DROP POLICY IF EXISTS "authenticated_read_user_student_links" ON public.user_student_links;
DROP POLICY IF EXISTS "authenticated_read_payment_receipts" ON public.payment_receipts;
DROP POLICY IF EXISTS "authenticated_read_communication_deliveries" ON public.communication_deliveries;
DROP POLICY IF EXISTS "authenticated_read_result_publication_events" ON public.result_publication_events;

-- Strict organization-scoped read policies
create policy "org_members_read_organizations" on public.organizations for select to authenticated using (id = public.current_app_user_org_id());
create policy "org_members_read_app_users" on public.app_users for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_classrooms" on public.classrooms for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_teachers" on public.teachers for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_students" on public.students for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_subjects" on public.subjects for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_attendance" on public.attendance_records for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_results" on public.results for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_invoices" on public.invoices for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_payments" on public.payments for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_announcements" on public.announcements for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_audit_events" on public.audit_events for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_academic_sessions" on public.academic_sessions for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_fee_categories" on public.fee_categories for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_user_invitations" on public.user_invitations for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_user_student_links" on public.user_student_links for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_payment_receipts" on public.payment_receipts for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_communication_deliveries" on public.communication_deliveries for select to authenticated using (organization_id = public.current_app_user_org_id());
create policy "org_members_read_result_publication_events" on public.result_publication_events for select to authenticated using (organization_id = public.current_app_user_org_id());

-- Owner/admin style direct-write policies for future client usage.
-- Server routes still use service role and bypass RLS, but these restrict any client-side direct mutations.
create policy "owners_manage_invitations" on public.user_invitations for all to authenticated using (organization_id = public.current_app_user_org_id() and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL')) with check (organization_id = public.current_app_user_org_id() and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL'));
create policy "owners_manage_announcements" on public.announcements for all to authenticated using (organization_id = public.current_app_user_org_id() and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL')) with check (organization_id = public.current_app_user_org_id() and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL'));

-- Strengthen audit table for structured metadata if old migrations predate it
alter table public.audit_events add column if not exists request_id text;
create index if not exists idx_audit_events_action on public.audit_events(organization_id, action, created_at desc);
