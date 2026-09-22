import { FileText } from "lucide-react";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { listLiveInvoices } from "@/lib/supabase/school-data";
import { formatDate, formatNairaCompact } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table } from "@/components/ui/Table";

/**
 * Full invoice register for the bursar.
 *
 * Server-rendered from live invoices: each row links to its detail page
 * where payment links are raised. Excel-like on purpose — bursars think in
 * rows, balances and due dates.
 */
export const dynamic = "force-dynamic";

function invoiceTone(status: string): BadgeTone {
  if (status === "PAID") return "success";
  if (status === "OVERDUE") return "danger";
  if (status === "PARTIAL") return "info";
  return "warning";
}

function invoiceLabel(status: string) {
  if (status === "PAID") return "Paid";
  if (status === "OVERDUE") return "Overdue";
  if (status === "PARTIAL") return "Part paid";
  return "Pending";
}

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ offset?: string }> }) {
  const supabase = await requestClientOrNull();
  const { offset: offsetParam } = await searchParams;
  const offset = Math.max(0, Number(offsetParam ?? 0) || 0);
  const result = supabase ? await listLiveInvoices(supabase, { offset }).catch(() => null) : null;
  const invoices = result?.data ?? null;
  const page = result?.page ?? null;

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Finance</p>
        <h1 className="page-title">Invoice register.</h1>
        <p className="page-subtitle">
          {invoices && page ? `${page.total} invoices · newest first.` : "Connect your database to load invoices."}
        </p>
      </header>

      {!invoices ? (
        <Alert tone="info"><p>Connect your database to load the invoice register.</p></Alert>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={<FileText size={22} />}
          title="No invoices yet"
          body="Raise the term's first invoice from the finance desk."
          action={<Button href="/dashboard/fees">Open finance desk</Button>}
        />
      ) : (
        <>
        <Table caption="Newest invoices first">
          <thead>
            <tr><th>Invoice</th><th>Student</th><th>Guardian</th><th className="numeric">Amount</th><th className="numeric">Paid</th><th className="numeric">Balance</th><th>Status</th><th>Due</th></tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => {
              const student = invoice.students as Record<string, unknown> | null;
              const name = `${String(student?.first_name ?? "")} ${String(student?.last_name ?? "")}`.trim() || String(student?.admission_no ?? "—");
              const balance = Math.max(0, Number(invoice.amount ?? 0) - Number(invoice.amount_paid ?? 0));
              return (
                <tr key={invoice.id}>
                  <td><a href={`/dashboard/fees/${invoice.invoice_no}`}>{invoice.invoice_no}</a></td>
                  <td>{name}<br /><small>{String(student?.admission_no ?? "")}</small></td>
                  <td>{String(student?.guardian_name ?? "—")}</td>
                  <td className="numeric">{formatNairaCompact(invoice.amount)}</td>
                  <td className="numeric">{formatNairaCompact(invoice.amount_paid)}</td>
                  <td className="numeric">{formatNairaCompact(balance)}</td>
                  <td><Badge tone={invoiceTone(invoice.status)}>{invoiceLabel(invoice.status)}</Badge></td>
                  <td style={{ whiteSpace: "nowrap" }}>{invoice.due_date ? formatDate(invoice.due_date) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {page && (page.offset > 0 || page.hasMore) ? (
          <div className="action-row">
            {page.offset > 0 ? <Button variant="secondary" href={`/dashboard/fees/invoices?offset=${Math.max(0, page.offset - page.limit)}`}>Previous</Button> : null}
            {page.hasMore ? <Button variant="secondary" href={`/dashboard/fees/invoices?offset=${page.offset + page.limit}`}>Next</Button> : null}
            <span className="ui-hint">Showing {page.offset + 1}–{page.offset + invoices.length} of {page.total}</span>
          </div>
        ) : null}
        </>
      )}
    </div>
  );
}
