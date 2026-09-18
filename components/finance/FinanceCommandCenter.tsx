"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { BellRing, CheckCircle2, FileText, Loader2, PlusCircle, WalletCards } from "lucide-react";
import { formatDate, formatNairaCompact } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Metric, MetricGrid } from "@/components/ui/Metric";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";

type InvoiceCard = {
  id: string;
  student: string;
  admissionNo: string;
  guardian: string;
  amount: number;
  paid: number;
  status: string;
  due?: string;
};

type InvoiceApiResponse = {
  status: string;
  source?: "none" | "supabase";
  summary?: Record<string, number>;
  data?: Array<Record<string, unknown>>;
  message?: string;
};

type AuditEvent = { id: string; action: string; actor_name: string | null; created_at: string; metadata: Record<string, unknown> };

type AuditPayload = {
  status: string;
  events?: AuditEvent[];
};

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

function studentName(student: unknown) {
  if (!student || typeof student !== "object") return "Unknown student";
  const row = student as Record<string, unknown>;
  return `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || String(row.admission_no ?? "Unknown student");
}

function normalizeInvoice(row: Record<string, unknown>): InvoiceCard {
  const student = row.students as Record<string, unknown> | undefined;
  return {
    id: String(row.invoice_no ?? row.id),
    student: row.invoice_no ? studentName(row.students) : String(row.student),
    admissionNo: String(student?.admission_no ?? row.admissionNo ?? ""),
    guardian: String(student?.guardian_name ?? row.guardian ?? "—"),
    amount: Number(row.amount ?? 0),
    paid: Number(row.amount_paid ?? row.paid ?? 0),
    status: String(row.status ?? "PENDING"),
    due: row.due_date ? String(row.due_date) : undefined,
  };
}

export function FinanceCommandCenter() {
  const [invoiceRows, setInvoiceRows] = useState<InvoiceCard[]>([]);
  const [activity, setActivity] = useState<AuditEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState("Loading invoices...");

  const summary = useMemo(() => {
    const total = invoiceRows.reduce((sum, invoice) => sum + invoice.amount, 0);
    const paid = invoiceRows.reduce((sum, invoice) => sum + invoice.paid, 0);
    const outstanding = Math.max(0, total - paid);
    const overdueRows = invoiceRows.filter((invoice) => invoice.status === "OVERDUE");
    const overdue = overdueRows.reduce((sum, invoice) => sum + invoice.amount - invoice.paid, 0);
    return { total, paid, outstanding, overdue, overdueCount: overdueRows.length, collectionRate: total > 0 ? Math.round((paid / total) * 100) : 0 };
  }, [invoiceRows]);

  const priorities = useMemo(() => {
    const open = invoiceRows
      .map((invoice) => ({ invoice, balance: Math.max(0, invoice.amount - invoice.paid) }))
      .filter((row) => row.balance > 0)
      .sort((a, b) => (a.invoice.status === "OVERDUE" ? 0 : 1) - (b.invoice.status === "OVERDUE" ? 0 : 1) || b.balance - a.balance)
      .slice(0, 5);
    return open.map(({ invoice, balance }) => ({
      id: invoice.id,
      title: `${invoice.id} — ${formatNairaCompact(balance)} outstanding`,
      detail: `${invoice.student}${invoice.guardian !== "—" ? ` · guardian: ${invoice.guardian}` : ""}${invoice.due ? ` · due ${formatDate(invoice.due)}` : ""}`,
      action: invoice.status === "OVERDUE" ? "Overdue — follow up now" : "Send a reminder before it slips",
      tone: (invoice.status === "OVERDUE" ? "danger" : "warning") as BadgeTone,
    }));
  }, [invoiceRows]);

  async function loadInvoices() {
    setLoading(true);
    setMessage("Loading invoice records...");
    try {
      const response = await fetch("/api/finance/invoices", { cache: "no-store" });
      const payload = await response.json() as InvoiceApiResponse;
      if (!response.ok) throw new Error(payload.message ?? "Unable to load invoices");
      setConnected(payload.source === "supabase");
      setInvoiceRows((payload.data ?? []).map(normalizeInvoice));
      setMessage(payload.source === "supabase" ? "Invoice records loaded." : (payload.message ?? "Connect your database to load invoices."));
    } catch (error) {
      setConnected(false);
      setMessage(error instanceof Error ? error.message : "Invoices unavailable.");
    } finally {
      setLoading(false);
    }
  }

  async function loadActivity() {
    try {
      const response = await fetch("/api/audit?action=payment,invoice", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json() as AuditPayload;
      setActivity((payload.events ?? []).slice(0, 8));
    } catch {
      // Activity is supplementary; the invoice board stands on its own.
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadInvoices(); void loadActivity(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function createInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setMessage("Creating invoice...");
    try {
      const response = await fetch("/api/finance/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionNo: form.get("admissionNo"),
          invoiceNo: form.get("invoiceNo"),
          title: form.get("title"),
          amount: Number(form.get("amount")),
          amountPaid: Number(form.get("amountPaid") || 0),
          status: form.get("status"),
          dueDate: form.get("dueDate") || undefined,
        }),
      });
      const payload = await response.json() as InvoiceApiResponse;
      if (!response.ok) throw new Error(payload.message ?? "Unable to create invoice");
      setMessage("Invoice created successfully.");
      setFormOpen(false);
      event.currentTarget.reset();
      await loadInvoices();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create invoice.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Finance</p>
        <h1 className="page-title">Fees, invoices and collection.</h1>
        <p className="page-subtitle">What has been billed, what has landed, and what needs chasing.</p>
      </header>

      <div className="action-row">
        <Button href="/dashboard/fees/invoices"><FileText size={18} /> View invoices</Button>
        <Button variant="secondary" onClick={() => setFormOpen(true)}><PlusCircle size={18} /> Create invoice</Button>
        <Button variant="secondary" href="/dashboard/communications"><BellRing size={18} /> Send reminders</Button>
      </div>

      <Alert tone={loading ? "info" : connected ? "success" : "warning"}>
        <p>{message}</p>
        <p><Button variant="secondary" size="sm" onClick={loadInvoices} disabled={loading}>Refresh</Button></p>
      </Alert>

      <Dialog
        open={formOpen}
        title="Create invoice"
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" form="create-invoice" disabled={saving}>
              {saving ? <Loader2 className="spin" size={18} /> : <PlusCircle size={18} />} Save invoice
            </Button>
          </>
        }
      >
        <form id="create-invoice" className="ui-form" onSubmit={createInvoice}>
          <Field label="Admission number" required>{(id) => <Input id={id} name="admissionNo" required placeholder="STU-2001" autoComplete="off" />}</Field>
          <Field label="Invoice number" required hint="Unique for this invoice, e.g. INV-2026-001">{(id) => <Input id={id} name="invoiceNo" required placeholder="INV-2026-001" autoComplete="off" />}</Field>
          <Field label="Title">{(id) => <Input id={id} name="title" placeholder="First Term Fees" autoComplete="off" />}</Field>
          <Field label="Amount (₦)" required>{(id) => <Input id={id} name="amount" required type="number" min="0" step="1" placeholder="145000" />}</Field>
          <Field label="Amount already paid (₦)">{(id) => <Input id={id} name="amountPaid" type="number" min="0" step="1" placeholder="0" />}</Field>
          <Field label="Due date">{(id) => <Input id={id} name="dueDate" type="date" />}</Field>
          <Field label="Status">
            {(id) => (
              <Select id={id} name="status" defaultValue="PENDING">
                <option value="PENDING">Pending</option>
                <option value="PARTIAL">Part paid</option>
                <option value="PAID">Paid</option>
                <option value="OVERDUE">Overdue</option>
              </Select>
            )}
          </Field>
        </form>
      </Dialog>

      <MetricGrid>
        <Metric icon={<WalletCards size={20} />} label="Collected" value={formatNairaCompact(summary.paid)} caption={`${summary.collectionRate}% of billed`} />
        <Metric icon={<FileText size={20} />} label="Outstanding" value={formatNairaCompact(summary.outstanding)} caption={`${invoiceRows.length} invoices`} />
        <Metric icon={<BellRing size={20} />} label="Overdue" value={formatNairaCompact(summary.overdue)} caption={`${summary.overdueCount} invoices past due`} />
        <Metric icon={<CheckCircle2 size={20} />} label="Total billed" value={formatNairaCompact(summary.total)} caption="this workspace" />
      </MetricGrid>

      <div className="premium-grid-2 align-start">
        <Card title="Priority follow-ups" subtitle={priorities.length ? "Largest open balances, overdue first." : "Nothing outstanding right now."}>
          {priorities.length === 0 ? (
            <EmptyState icon={<CheckCircle2 size={22} />} title="Books are clean" body="No invoice carries an outstanding balance." />
          ) : (
            <div className="signal-list">
              {priorities.map((item) => (
                <article key={item.id} className="signal-item">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                    <small>{item.action}</small>
                  </div>
                  <Badge tone={item.tone}>{item.tone === "danger" ? "Overdue" : "Open"}</Badge>
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card title="Recent finance activity" subtitle="Invoice and payment events as they were recorded.">
          {activity.length === 0 ? (
            <EmptyState icon={<FileText size={22} />} title="No activity yet" body="Creations, payments and verifications will appear here." />
          ) : (
            <div className="trust-list">
              {activity.map((item) => (
                <article key={item.id}>
                  <div>
                    <strong>{item.action.replace(/\./g, " · ")}</strong>
                    <p>{item.actor_name ?? "System"} · {formatDate(item.created_at)}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Invoice board" subtitle={invoiceRows.length ? `Showing ${Math.min(8, invoiceRows.length)} of ${invoiceRows.length} invoices.` : "No invoices raised yet."}>
        {invoiceRows.length === 0 ? (
          <EmptyState
            icon={<FileText size={22} />}
            title="No invoices yet"
            body="Raise the term's first invoice to start the collection picture."
            action={<Button onClick={() => setFormOpen(true)}><PlusCircle size={18} /> Create invoice</Button>}
          />
        ) : (
          <Table>
            <thead><tr><th>Invoice</th><th>Student</th><th className="numeric">Amount</th><th className="numeric">Paid</th><th className="numeric">Balance</th><th>Status</th><th>Due</th></tr></thead>
            <tbody>
              {invoiceRows.slice(0, 8).map((invoice) => (
                <tr key={invoice.id}>
                  <td><a href={`/dashboard/fees/${invoice.id}`}>{invoice.id}</a></td>
                  <td>{invoice.student}</td>
                  <td className="numeric">{formatNairaCompact(invoice.amount)}</td>
                  <td className="numeric">{formatNairaCompact(invoice.paid)}</td>
                  <td className="numeric">{formatNairaCompact(Math.max(0, invoice.amount - invoice.paid))}</td>
                  <td><Badge tone={invoiceTone(invoice.status)}>{invoiceLabel(invoice.status)}</Badge></td>
                  <td style={{ whiteSpace: "nowrap" }}>{invoice.due ? formatDate(invoice.due) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
