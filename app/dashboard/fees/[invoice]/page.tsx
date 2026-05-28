import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BellRing, CreditCard, FileText, UserRound } from "lucide-react";
import { currency, getInvoiceById } from "@/lib/finance-center";

function statusClass(status: string) {
  if (status === "PAID") return "good";
  if (status === "OVERDUE") return "bad";
  return "warn";
}

export default async function InvoicePage({ params }: { params: Promise<{ invoice: string }> }) {
  const { invoice: invoiceId } = await params;
  const invoice = getInvoiceById(invoiceId);
  if (!invoice) notFound();
  const balance = invoice.amount - invoice.paid;

  return (
    <div className="premium-dashboard">
      <Link className="back-link" href="/dashboard/fees/invoices"><ArrowLeft size={16} /> Back to invoices</Link>
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><FileText size={14} /> Invoice Detail</span>
        <h1>{invoice.id}</h1>
        <p>{invoice.student} • {invoice.className} • Guardian: {invoice.guardian}</p>
        <div className="role-metrics"><span className={`status ${statusClass(invoice.status)}`}>{invoice.status}</span><span>Due {invoice.due}</span><span>{invoice.probability}% collection probability</span></div>
      </section>
      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><CreditCard /></div><span>Invoice Amount</span><strong>{currency(invoice.amount)}</strong><small>term billing</small><p>Total billed amount for this student.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><CreditCard /></div><span>Amount Paid</span><strong>{currency(invoice.paid)}</strong><small>{invoice.method}</small><p>Verified or reconciled payment amount.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><BellRing /></div><span>Balance</span><strong>{currency(balance)}</strong><small>remaining</small><p>Outstanding amount for follow-up.</p></article>
        <article className="premium-metric tone-violet"><div className="metric-icon"><UserRound /></div><span>Guardian</span><strong style={{ fontSize: 22 }}>{invoice.guardian}</strong><small>payer profile</small><p>Responsible parent/guardian for payment communication.</p></article>
      </section>
    </div>
  );
}
