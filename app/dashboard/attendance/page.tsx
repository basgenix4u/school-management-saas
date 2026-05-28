import { attendance } from "@/lib/mock-data";

export default function AttendancePage() {
  return (
    <section className="card" style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Attendance</h1>
      <p style={{ color: "#64748b" }}>Daily attendance overview by class.</p>
      <table className="table">
        <thead><tr><th>Class</th><th>Present</th><th>Absent</th><th>Rate</th></tr></thead>
        <tbody>{attendance.map((row) => <tr key={row.className}><td>{row.className}</td><td>{row.present}</td><td>{row.absent}</td><td><span className="status good">{row.rate}</span></td></tr>)}</tbody>
      </table>
    </section>
  );
}
