import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { currency, invoices } from "@/lib/finance-center";

function statusClass(status: string) {
  if (status === "PAID") return "good";
  if (status === "OVERDUE") return "bad";
  return "warn";
}

export default function InvoicesPage() {
  return (
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><FileText size={14} /> Invoice Intelligence</span>
        <h1>Track every fee invoice from billing to reconciliation.</h1>
        <p>Invoice board designed for accountants to see payment status, outstanding balances, guardian responsibility and collection probability.</p>
      </section>
      <section className="card premium-panel">
        <table className="table premium-table">
          <thead><tr><th>Invoice</th><th>Student</th><th>Guardian</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th><th>Probability</th><th></th></tr></thead>
          <tbody>{invoices.map((invoice) => <tr key={invoice.id}><td>{invoice.id}</td><td>{invoice.student}<br /><small>{invoice.className}</small></td><td>{invoice.guardian}</td><td>{currency(invoice.amount)}</td><td>{currency(invoice.paid)}</td><td>{currency(invoice.amount - invoice.paid)}</td><td><span className={`status ${statusClass(invoice.status)}`}>{invoice.status}</span></td><td>{invoice.probability}%</td><td><Link className="mini-link" href={`/dashboard/fees/${invoice.id}`}>Open <ArrowRight size={14} /></Link></td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}
