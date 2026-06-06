"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BellRing, CheckCircle2, CreditCard, FileText, Loader2, Receipt, UserRound } from "lucide-react";
import { currency } from "@/lib/finance-center";

type InvoicePayload = { status: string; data?: Record<string, unknown>; message?: string };

type PaymentPayload = { status: string; message?: string; authorizationUrl?: string; reference?: string; amount?: number };

function statusClass(status: string) {
  if (status === "PAID") return "good";
  if (status === "OVERDUE") return "bad";
  return "warn";
}

function studentName(student: unknown) {
  if (!student || typeof student !== "object") return "Student";
  const row = student as Record<string, unknown>;
  return `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || String(row.admission_no ?? "Student");
}

export function InvoicePaymentDetail({ invoiceNo }: { invoiceNo: string }) {
  const [invoice, setInvoice] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState("Loading invoice...");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payerEmail, setPayerEmail] = useState("");

  const loadInvoice = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/finance/invoices/${invoiceNo}`, { cache: "no-store" });
      const payload = await response.json() as InvoicePayload;
      if (!response.ok) throw new Error(payload.message ?? "Unable to load invoice");
      setInvoice(payload.data ?? null);
      const student = payload.data?.students as Record<string, unknown> | undefined;
      setPayerEmail(String(student?.guardian_email ?? student?.student_email ?? ""));
      setMessage("Invoice loaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load invoice.");
    } finally {
      setLoading(false);
    }
  }, [invoiceNo]);

  useEffect(() => { const timer = window.setTimeout(() => { void loadInvoice(); }, 0); return () => window.clearTimeout(timer); }, [loadInvoice]);

  const amount = Number(invoice?.amount ?? 0);
  const paid = Number(invoice?.amount_paid ?? 0);
  const balance = Math.max(0, amount - paid);
  const student = invoice?.students as Record<string, unknown> | undefined;

  async function initializePayment() {
    setPaying(true);
    setMessage("Preparing payment link...");
    try {
      const response = await fetch("/api/payments/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceNo, email: payerEmail }),
      });
      const payload = await response.json() as PaymentPayload;
      if (!response.ok) throw new Error(payload.message ?? "Unable to initialize payment");
      if (!payload.authorizationUrl) throw new Error("Payment link was not returned.");
      window.location.href = payload.authorizationUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to initialize payment.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="premium-dashboard">
      <Link className="back-link" href="/dashboard/fees/invoices"><ArrowLeft size={16} /> Back to invoices</Link>
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><FileText size={14} /> Invoice Detail</span>
        <h1>{String(invoice?.invoice_no ?? invoiceNo)}</h1>
        <p>{studentName(student)} • {String(student?.admission_no ?? "No admission number")}</p>
        <div className="role-metrics"><span className={`status ${statusClass(String(invoice?.status ?? "PENDING"))}`}>{String(invoice?.status ?? "PENDING")}</span><span>Due {String(invoice?.due_date ?? "not set")}</span><span>{Number(invoice?.payment_probability ?? 50)}% collection probability</span></div>
      </section>

      <section className="live-status-card">
        {loading || paying ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
        <span>{message}</span>
        <button type="button" onClick={loadInvoice}>Refresh</button>
      </section>

      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><CreditCard /></div><span>Invoice Amount</span><strong>{currency(amount)}</strong><small>billing</small><p>Total billed amount for this student.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><CreditCard /></div><span>Amount Paid</span><strong>{currency(paid)}</strong><small>verified</small><p>Verified or reconciled payment amount.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><BellRing /></div><span>Balance</span><strong>{currency(balance)}</strong><small>remaining</small><p>Outstanding amount for follow-up.</p></article>
        <article className="premium-metric tone-violet"><div className="metric-icon"><UserRound /></div><span>Payer</span><strong style={{ fontSize: 18 }}>{payerEmail || "Not set"}</strong><small>email</small><p>Email used for online payment.</p></article>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><Receipt size={14} /> Online payment</span>
          <h2>Pay with Paystack</h2>
          <p className="muted-copy">Generate a secure Paystack payment link for the outstanding balance. Payments are verified and saved as receipts.</p>
          <div className="live-form-grid single-column-form">
            <label><span>Payer email</span><input value={payerEmail} onChange={(event) => setPayerEmail(event.target.value)} placeholder="parent@school.com" type="email" /></label>
            <button className="btn btn-primary" type="button" onClick={initializePayment} disabled={paying || balance <= 0}>{paying ? <Loader2 className="spin" size={18} /> : <CreditCard size={18} />} Pay outstanding balance</button>
          </div>
        </div>
        <div className="card premium-panel">
          <span className="premium-kicker">Receipt records</span>
          <h2>After payment</h2>
          <p className="muted-copy">Successful Paystack payments create a payment record, update the invoice balance and generate a receipt that can be viewed or downloaded later.</p>
        </div>
      </section>
    </div>
  );
}
