"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard, FileText, Loader2, Receipt, UserRound } from "lucide-react";
import { formatDate, formatNaira, formatNairaCompact } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Metric, MetricGrid } from "@/components/ui/Metric";

type InvoicePayload = { status: string; data?: Record<string, unknown>; message?: string };

type PaymentPayload = { status: string; message?: string; authorizationUrl?: string; reference?: string; amount?: number };

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
  const status = String(invoice?.status ?? "PENDING");

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
    <div className="page">
      <p><Button variant="ghost" size="sm" href="/dashboard/fees/invoices"><ArrowLeft size={16} /> Back to invoices</Button></p>
      <header className="page-head">
        <p className="page-eyebrow">{String(invoice?.title ?? "Invoice")}</p>
        <h1 className="page-title">{String(invoice?.invoice_no ?? invoiceNo)}</h1>
        <p className="page-subtitle">{studentName(student)} · {String(student?.admission_no ?? "No admission number")}</p>
      </header>

      <p style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <Badge tone={invoiceTone(status)}>{invoiceLabel(status)}</Badge>
        <Badge tone="neutral">Due {invoice?.due_date ? formatDate(String(invoice.due_date)) : "not set"}</Badge>
      </p>

      <Alert tone={loading || paying ? "info" : invoice ? "success" : "warning"}>
        <p>{message}</p>
        <p><Button variant="secondary" size="sm" onClick={loadInvoice} disabled={loading}>Refresh</Button></p>
      </Alert>

      <MetricGrid>
        <Metric icon={<CreditCard size={20} />} label="Invoice amount" value={formatNairaCompact(amount)} caption="total billed" />
        <Metric icon={<CheckCircle2 size={20} />} label="Amount paid" value={formatNairaCompact(paid)} caption="verified and reconciled" />
        <Metric icon={<FileText size={20} />} label="Balance" value={formatNairaCompact(balance)} caption="outstanding" />
        <Metric icon={<UserRound size={20} />} label="Payer email" value={payerEmail || "Not set"} caption="used for online payment" />
      </MetricGrid>

      <div className="premium-grid-2 align-start">
        <Card title="Pay with Paystack" subtitle={`Secure link for the outstanding ${formatNaira(balance)}. Verified payments update the balance and issue a receipt automatically.`}>
          <form className="ui-form" onSubmit={(event) => { event.preventDefault(); void initializePayment(); }}>
            <Field label="Payer email" required hint="Receipts go to this address.">
              {(id) => <Input id={id} value={payerEmail} onChange={(event) => setPayerEmail(event.target.value)} placeholder="parent@example.com" type="email" required />}
            </Field>
            <div>
              <Button type="submit" disabled={paying || balance <= 0}>
                {paying ? <Loader2 className="spin" size={18} /> : <CreditCard size={18} />} Pay outstanding balance
              </Button>
            </div>
          </form>
        </Card>
        <Card
          title="Receipt records"
          subtitle="Successful payments create a payment record, update the invoice balance and generate a receipt that can be opened from the finance desk."
        >
          <p><Button variant="secondary" href="/dashboard/fees"><Receipt size={18} /> Back to finance desk</Button></p>
        </Card>
      </div>
    </div>
  );
}
