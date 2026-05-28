import { MetricCard } from "@/components/MetricCard";
import { attendance, feeInvoices, metrics, students } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 34, letterSpacing: "-0.04em" }}>School Overview</h1>
          <p style={{ color: "#64748b", marginTop: 8 }}>Monitor enrollment, finance, attendance and academic activity.</p>
        </div>
        <span className="badge">2026 Academic Session</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", marginBottom: 24 }}>
        {metrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1.2fr .8fr" }}>
        <section className="card" style={{ padding: 22 }}>
          <h2 style={{ marginTop: 0 }}>Recent Students</h2>
          <table className="table">
            <thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Fee</th></tr></thead>
            <tbody>{students.map((student) => <tr key={student.id}><td>{student.id}</td><td>{student.name}</td><td>{student.className}</td><td><span className={`status ${student.fee === "Paid" ? "good" : student.fee === "Partial" ? "warn" : "bad"}`}>{student.fee}</span></td></tr>)}</tbody>
          </table>
        </section>
        <section className="card" style={{ padding: 22 }}>
          <h2 style={{ marginTop: 0 }}>Attendance Snapshot</h2>
          {attendance.map((row) => (
            <div key={row.className} style={{ padding: "14px 0", borderBottom: "1px solid #e2e8f0" }}>
              <strong>{row.className}</strong>
              <div style={{ color: "#64748b", marginTop: 5 }}>{row.present} present • {row.absent} absent • {row.rate}</div>
            </div>
          ))}
          <h2>Fee Alerts</h2>
          {feeInvoices.map((invoice) => <p key={invoice.invoice} style={{ color: "#64748b" }}>{invoice.student}: <strong>{invoice.status}</strong> — {invoice.amount}</p>)}
        </section>
      </div>
    </div>
  );
}
