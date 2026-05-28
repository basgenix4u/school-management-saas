import Link from "next/link";
import { ArrowRight, Banknote, BellRing, CreditCard, FileText, ShieldAlert, WalletCards } from "lucide-react";
import { collectionForecast, currency, financeInsights, financeMetrics, getFinanceSummary, invoices, paymentTimeline } from "@/lib/finance-center";
import { TrendLine } from "@/components/premium/TrendLine";

function statusClass(status: string) {
  if (status === "PAID") return "good";
  if (status === "PARTIAL" || status === "PENDING") return "warn";
  return "bad";
}

function toneClass(tone: string) {
  if (tone === "emerald") return "tone-emerald";
  if (tone === "amber") return "tone-amber";
  if (tone === "rose") return "tone-rose";
  return "tone-blue";
}

export function FinanceCommandCenter() {
  const summary = getFinanceSummary();
  return (
    <div className="finance-center premium-dashboard">
      <section className="card-aurora finance-hero">
        <div>
          <span className="premium-kicker"><WalletCards size={14} /> Finance Command Center</span>
          <h1>Fees, invoices and payment intelligence in one place.</h1>
          <p>Give accountants and school owners a premium finance cockpit for invoice tracking, payment reconciliation, overdue risk and guardian follow-up.</p>
          <div className="hero-actions"><Link className="btn btn-primary" href="/dashboard/fees/invoices"><FileText size={18} /> View Invoices</Link><button className="btn btn-secondary" type="button"><BellRing size={18} /> Send Reminders</button></div>
        </div>
        <div className="finance-hero-card"><span>Total Billing</span><strong>{currency(summary.total)}</strong><small>{summary.collectionRate}% collected • {currency(summary.outstanding)} outstanding</small></div>
      </section>

      <section className="premium-metrics">
        {financeMetrics.map((metric) => <article className={`premium-metric ${toneClass(metric.tone)}`} key={metric.label}><div className="metric-icon"><CreditCard /></div><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.change}</small><p>Finance operations metric for the current academic term.</p></article>)}
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <div className="panel-header"><div><span className="premium-kicker"><Banknote size={14} /> Collection Forecast</span><h2>Expected payment momentum</h2></div><strong className="panel-value">97%</strong></div>
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
          <div className="invoice-list">{invoices.slice(0, 5).map((invoice) => <Link className="invoice-row" key={invoice.id} href={`/dashboard/fees/${invoice.id}`}><div><strong>{invoice.student}</strong><span>{invoice.id} • {invoice.className}</span></div><div><strong>{currency(invoice.amount - invoice.paid)}</strong><span className={`status ${statusClass(invoice.status)}`}>{invoice.status}</span></div></Link>)}</div>
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
