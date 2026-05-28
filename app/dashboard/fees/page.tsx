import { feeInvoices } from "@/lib/mock-data";

export default function FeesPage() {
  return (
    <section className="card" style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Fees & Invoices</h1>
      <p style={{ color: "#64748b" }}>Track tuition, outstanding balances and payment status.</p>
      <table className="table">
        <thead><tr><th>Invoice</th><th>Student</th><th>Amount</th><th>Status</th><th>Due Date</th></tr></thead>
        <tbody>{feeInvoices.map((invoice) => <tr key={invoice.invoice}><td>{invoice.invoice}</td><td>{invoice.student}</td><td>{invoice.amount}</td><td><span className={`status ${invoice.status === "Paid" ? "good" : invoice.status === "Partial" ? "warn" : "bad"}`}>{invoice.status}</span></td><td>{invoice.due}</td></tr>)}</tbody>
      </table>
    </section>
  );
}
