-- Invoice numbers are per-school sequences, not global ones.
--
-- The original schema declared invoice_no globally unique, so the second
-- school to raise INV-2026-001 would collide on day one. Numbers now repeat
-- safely across schools while staying unique within each workspace.

alter table public.invoices drop constraint if exists invoices_invoice_no_key;
alter table public.invoices add constraint invoices_org_no_key unique (organization_id, invoice_no);

-- Hot-path indexes for desk-sized reads.
create index if not exists idx_invoices_org_status on public.invoices (organization_id, status);
create index if not exists idx_results_org on public.results (organization_id);
create index if not exists idx_attendance_org_student on public.attendance_records (organization_id, student_id);
