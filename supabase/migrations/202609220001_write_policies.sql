-- Tenant write policies: role-aware INSERT/UPDATE for every table the app mutates.
--
-- Reads were scoped in 202606060009, but no write policies were ever created,
-- so with RLS enabled every authenticated INSERT/UPDATE fails closed. These
-- policies mirror lib/rbac.ts: the app authorizes the action, the database
-- re-checks organization and role. Anything not listed here stays unwritable
-- through the request client, which is intentional:
--   organizations / app_users / payments / payment_receipts are service-role
--   only (bootstrap, membership, and verified-payment paths).
-- Nothing in the product deletes rows, so no DELETE policies exist at all.

-- Students and portal links: students.manage
create policy "staff_insert_students" on public.students for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','ACCOUNTANT'));
create policy "staff_update_students" on public.students for update to authenticated
  using (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','ACCOUNTANT'))
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','ACCOUNTANT'));

create policy "staff_insert_user_student_links" on public.user_student_links for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','ACCOUNTANT'));
create policy "staff_update_user_student_links" on public.user_student_links for update to authenticated
  using (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','ACCOUNTANT'))
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','ACCOUNTANT'));

-- Staff directory: teachers.manage
create policy "staff_insert_teachers" on public.teachers for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL'));
create policy "staff_update_teachers" on public.teachers for update to authenticated
  using (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL'))
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL'));

-- School structure: workspace.manage
create policy "owners_insert_classrooms" on public.classrooms for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER'));
create policy "owners_update_classrooms" on public.classrooms for update to authenticated
  using (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER'))
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER'));

create policy "owners_insert_academic_sessions" on public.academic_sessions for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER'));
create policy "owners_update_academic_sessions" on public.academic_sessions for update to authenticated
  using (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER'))
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER'));

create policy "owners_insert_fee_categories" on public.fee_categories for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER'));
create policy "owners_update_fee_categories" on public.fee_categories for update to authenticated
  using (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER'))
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER'));

-- Attendance: attendance.mark
create policy "staff_insert_attendance" on public.attendance_records for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','TEACHER'));
create policy "staff_update_attendance" on public.attendance_records for update to authenticated
  using (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','TEACHER'))
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','TEACHER'));

-- Results: results.manage (subjects are created implicitly during score entry)
create policy "staff_insert_results" on public.results for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','TEACHER'));
create policy "staff_update_results" on public.results for update to authenticated
  using (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','TEACHER'))
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','TEACHER'));

create policy "staff_insert_subjects" on public.subjects for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','TEACHER'));
create policy "staff_update_subjects" on public.subjects for update to authenticated
  using (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','TEACHER'))
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','TEACHER'));

create policy "staff_insert_publication_events" on public.result_publication_events for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','TEACHER'));

-- Invoices: fees.manage
create policy "staff_insert_invoices" on public.invoices for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','ACCOUNTANT'));
create policy "staff_update_invoices" on public.invoices for update to authenticated
  using (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','ACCOUNTANT'))
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','ACCOUNTANT'));

-- Announcements and deliveries: announcements.manage. This replaces the
-- earlier owners-only policy, which denied teachers the app authorizes.
drop policy if exists "owners_manage_announcements" on public.announcements;
create policy "staff_insert_announcements" on public.announcements for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','TEACHER'));
create policy "staff_update_announcements" on public.announcements for update to authenticated
  using (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','TEACHER'))
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','TEACHER'));

create policy "staff_insert_deliveries" on public.communication_deliveries for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER','PRINCIPAL','TEACHER'));

-- Invitations: workspace.manage. Recreated to match the app exactly (owners
-- only) and narrowed from FOR ALL, since nothing deletes invitations.
drop policy if exists "owners_manage_invitations" on public.user_invitations;
create policy "owners_insert_invitations" on public.user_invitations for insert to authenticated
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER'));
create policy "owners_update_invitations" on public.user_invitations for update to authenticated
  using (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER'))
  with check (organization_id = public.current_app_user_org_id()
    and public.current_app_user_role() in ('SUPER_ADMIN','SCHOOL_OWNER'));

-- Audit: every mutation writes events, so every member role may insert.
-- Events are append-only: no update policy exists by design. Anonymous intake
-- (support tickets filed logged-out) may attach unattributed rows; the API
-- rate limit bounds that path.
create policy "members_insert_audit_events" on public.audit_events for insert to authenticated
  with check (organization_id = public.current_app_user_org_id() or organization_id is null);
create policy "anon_insert_audit_events" on public.audit_events for insert to anon
  with check (organization_id is null);

-- Public intake: signed-in users report against their school (or none, when
-- the report predates any membership); anonymous visitors may only file
-- reports unattached to a school.
create policy "members_insert_support_tickets" on public.support_tickets for insert to authenticated
  with check (organization_id = public.current_app_user_org_id() or organization_id is null);
create policy "anon_insert_support_tickets" on public.support_tickets for insert to anon
  with check (organization_id is null);
create policy "members_insert_error_events" on public.app_error_events for insert to authenticated
  with check (organization_id = public.current_app_user_org_id() or organization_id is null);
create policy "anon_insert_error_events" on public.app_error_events for insert to anon
  with check (organization_id is null);
