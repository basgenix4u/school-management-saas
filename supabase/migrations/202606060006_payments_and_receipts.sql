-- EduManage School OS - Payments and receipt records

create table if not exists public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  payment_id uuid references public.payments(id) on delete set null,
  receipt_no text not null unique,
  payer_email text,
  amount numeric(12,2) not null,
  provider text not null default 'paystack',
  reference text not null unique,
  issued_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

alter table public.payment_receipts enable row level security;

do $$ begin
  create policy "authenticated_read_payment_receipts" on public.payment_receipts for select to authenticated using (true);
exception when duplicate_object then null; end $$;

create index if not exists idx_payment_receipts_org on public.payment_receipts(organization_id, issued_at desc);
create index if not exists idx_payment_receipts_invoice on public.payment_receipts(invoice_id);

create or replace view public.v_payment_receipts as
select
  r.id,
  r.organization_id,
  o.name as organization_name,
  r.receipt_no,
  r.reference,
  r.amount,
  r.provider,
  r.payer_email,
  r.issued_at,
  i.invoice_no,
  i.title as invoice_title,
  i.amount as invoice_amount,
  i.amount_paid,
  i.status as invoice_status,
  s.admission_no,
  concat(s.first_name, ' ', s.last_name) as student_name,
  s.guardian_name,
  s.guardian_email
from public.payment_receipts r
join public.organizations o on o.id = r.organization_id
join public.invoices i on i.id = r.invoice_id
join public.students s on s.id = i.student_id;
