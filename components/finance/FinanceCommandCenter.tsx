"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Banknote, BellRing, CheckCircle2, CreditCard, FileText, Loader2, PlusCircle, ShieldAlert, WalletCards } from "lucide-react";
import { collectionForecast, currency, financeInsights, paymentTimeline } from "@/lib/finance-center";
import { TrendLine } from "@/components/premium/TrendLine";

type InvoiceCard = {
  id: string;
  student: string;
  className: string;
  guardian: string;
  amount: number;
  paid: number;
  status: string;
  due?: string;
  probability?: number;
};

type InvoiceApiResponse = {
  status: string;
  source?: "none" | "supabase";
  summary?: Record<string, number>;
  data?: Array<Record<string, unknown>>;
  message?: string;
};

function statusClass(status: string) {
  if (status === "PAID" || status === "Paid") return "good";
  if (["PARTIAL", "PENDING", "Partial", "Pending"].includes(status)) return "warn";
  return "bad";
}

function toneClass(tone: string) {
  if (tone === "emerald") return "tone-emerald";
  if (tone === "amber") return "tone-amber";
  if (tone === "rose") return "tone-rose";
  return "tone-blue";
}

function studentName(student: unknown) {
  if (!student || typeof student !== "object") return "Unknown student";
  const row = student as Record<string, unknown>;
  return `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || String(row.admission_no ?? "Unknown student");
}

function normalizeInvoice(row: Record<string, unknown>): InvoiceCard {
  if (row.invoice_no) {
    return {
      id: String(row.invoice_no),
      student: studentName(row.students),
      className: String((row.students as Record<string, unknown> | undefined)?.admission_no ?? "Live Supabase"),
      guardian: String((row.students as Record<string, unknown> | undefined)?.guardian_name ?? "Guardian"),
      amount: Number(row.amount ?? 0),
      paid: Number(row.amount_paid ?? 0),
      status: String(row.status ?? "PENDING"),
      due: row.due_date ? String(row.due_date) : undefined,
      probability: Number(row.payment_probability ?? 50),
    };
  }

  return {
    id: String(row.id),
    student: String(row.student),
    className: String(row.className),
    guardian: String(row.guardian ?? "Guardian"),
    amount: Number(row.amount ?? 0),
    paid: Number(row.paid ?? 0),
    status: String(row.status),
    due: String(row.due ?? ""),
    probability: Number(row.probability ?? 50),
  };
}

export function FinanceCommandCenter() {
  const [invoiceRows, setInvoiceRows] = useState<InvoiceCard[]>([]);
  const [source, setSource] = useState("none");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [message, setMessage] = useState("Loading invoices...");

  const summary = useMemo(() => {
    const total = invoiceRows.reduce((sum, invoice) => sum + invoice.amount, 0);
    const paid = invoiceRows.reduce((sum, invoice) => sum + invoice.paid, 0);
    const outstanding = total - paid;
    const overdue = invoiceRows.filter((invoice) => invoice.status === "OVERDUE" || invoice.status === "Overdue").reduce((sum, invoice) => sum + invoice.amount - invoice.paid, 0);
    const collectionRate = total > 0 ? Math.round((paid / total) * 100) : 0;
    return { total, paid, outstanding, overdue, collectionRate };
  }, [invoiceRows]);

  async function loadInvoices() {
    setLoading(true);
    setMessage("Loading invoice records...");
    try {
      const response = await fetch("/api/finance/invoices", { cache: "no-store" });
      const payload = await response.json() as InvoiceApiResponse;
      if (!response.ok) throw new Error(payload.message ?? "Unable to load invoices");
      setSource(payload.source ?? "none");
      setInvoiceRows((payload.data ?? []).map(normalizeInvoice));
      setMessage(payload.source === "supabase" ? "Invoice records loaded." : (payload.message ?? "Connect your database to load invoices."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invoices unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadInvoices(); }, 0);
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
          dueDate: form.get("dueDate"),
          paymentProbability: Number(form.get("paymentProbability") || 50),
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

  const dynamicMetrics = [
    { label: "Collected", value: currency(summary.paid), change: `${summary.collectionRate}% collected`, tone: "emerald" },
    { label: "Outstanding", value: currency(summary.outstanding), change: `${invoiceRows.length} invoices`, tone: "amber" },
    { label: "Overdue Risk", value: currency(summary.overdue), change: "review queue", tone: "rose" },
    { label: "Data Source", value: source, change: loading ? "loading" : "ready", tone: "blue" },
  ];

  return (
    <div className="finance-center premium-dashboard">
      <section className="card-aurora finance-hero">
        <div>
          <span className="premium-kicker"><WalletCards size={14} /> Finance Command Center • {source}</span>
          <h1>Fees, invoices and payment intelligence in one place.</h1>
          <p>Give accountants and school owners a premium finance cockpit for invoice tracking, payment reconciliation, overdue risk and guardian follow-up.</p>
          <div className="hero-actions"><Link className="btn btn-primary" href="/dashboard/fees/invoices"><FileText size={18} /> View Invoices</Link><button className="btn btn-secondary" type="button" onClick={() => setFormOpen((value) => !value)}><PlusCircle size={18} /> Create Invoice</button><button className="btn btn-secondary" type="button"><BellRing size={18} /> Send Reminders</button></div>
        </div>
        <div className="finance-hero-card"><span>Total Billing</span><strong>{currency(summary.total)}</strong><small>{summary.collectionRate}% collected • {currency(summary.outstanding)} outstanding</small></div>
      </section>

      <section className="live-status-card">
        {loading ? <Loader2 className="spin" size={18} /> : source === "supabase" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span>{message}</span>
        <button type="button" onClick={loadInvoices}>Refresh</button>
      </section>

      {formOpen ? (
        <section className="card premium-panel live-form-panel">
          <span className="premium-kicker">Live invoice creation</span>
          <h2>Create invoice</h2>
          <form className="live-form-grid" onSubmit={createInvoice}>
            <label><span>Admission no.</span><input name="admissionNo" required placeholder="STU-1001" /></label>
            <label><span>Invoice no.</span><input name="invoiceNo" required placeholder="INV-NEW-001" /></label>
            <label><span>Title</span><input name="title" placeholder="Second Term Fees" /></label>
            <label><span>Amount</span><input name="amount" required type="number" min="0" placeholder="145000" /></label>
            <label><span>Paid</span><input name="amountPaid" type="number" min="0" placeholder="0" /></label>
            <label><span>Due date</span><input name="dueDate" type="date" /></label>
            <label><span>Status</span><select name="status" defaultValue="PENDING"><option>PENDING</option><option>PARTIAL</option><option>PAID</option><option>OVERDUE</option></select></label>
            <label><span>Probability</span><input name="paymentProbability" type="number" min="0" max="100" defaultValue="50" /></label>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <Loader2 className="spin" size={18} /> : <PlusCircle size={18} />} Save invoice</button>
          </form>
        </section>
      ) : null}

      <section className="premium-metrics">
        {dynamicMetrics.map((metric) => <article className={`premium-metric ${toneClass(metric.tone)}`} key={metric.label}><div className="metric-icon"><CreditCard /></div><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.change}</small><p>Finance operations metric for the current academic term.</p></article>)}
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <div className="panel-header"><div><span className="premium-kicker"><Banknote size={14} /> Collection Forecast</span><h2>Expected payment momentum</h2></div><strong className="panel-value">{summary.collectionRate}%</strong></div>
          <TrendLine data={collectionForecast} color="#2563eb" />
          <div className="insight-row"><span>Total billed</span><strong>{currency(summary.total)}</strong></div>
          <div className="insight-row"><span>Collected</span><strong>{currency(summary.paid)}</strong></div>
          <div className="insight-row"><span>Overdue</span><strong>{currency(summary.overdue)}</strong></div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker"><ShieldAlert size={14} /> Payment Risk Intelligence</span>
          <h2>Recommended finance actions</h2>
          <div className="signal-list">{financeInsights.map((insight) => <article className="signal-item" key={insight.title}><div><strong>{insight.title}</strong><p>{insight.detail}</p><small>{insight.action}</small></div><span className={`status ${insight.severity === "High" ? "bad" : insight.severity === "Medium" ? "warn" : "good"}`}>{insight.severity}</span></article>)}</div>
        </div>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <div className="panel-header compact"><div><span className="premium-kicker"><FileText size={14} /> Invoice Board</span><h2>Priority invoices</h2></div><Link className="mini-link" href="/dashboard/fees/invoices">Open all <ArrowRight size={15} /></Link></div>
          <div className="invoice-list">
            {!loading && invoiceRows.length === 0 ? <div className="empty-state-card">No invoices found. Create the first invoice.</div> : null}
            {invoiceRows.slice(0, 5).map((invoice) => <Link className="invoice-row" key={invoice.id} href={`/dashboard/fees/${invoice.id}`}><div><strong>{invoice.student}</strong><span>{invoice.id} • {invoice.className}</span></div><div><strong>{currency(invoice.amount - invoice.paid)}</strong><span className={`status ${statusClass(invoice.status)}`}>{invoice.status}</span></div></Link>)}
          </div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker">Payment Timeline</span>
          <h2>Today’s finance pulse</h2>
          <div className="timeline-list">{paymentTimeline.map((item) => <article key={item.time}><time>{item.time}</time><div><strong>{item.title}</strong><p>{item.detail}</p><span className="timeline-amount">{item.amount}</span></div></article>)}</div>
        </div>
      </section>
    </div>
  );
}
