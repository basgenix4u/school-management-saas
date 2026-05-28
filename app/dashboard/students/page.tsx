import { students } from "@/lib/mock-data";

export default function StudentsPage() {
  return (
    <section className="card" style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Students</h1>
      <p style={{ color: "#64748b" }}>Manage enrollment, guardians, classes and fee status.</p>
      <table className="table">
        <thead><tr><th>ID</th><th>Name</th><th>Class</th><th>Guardian</th><th>Status</th><th>Fees</th></tr></thead>
        <tbody>{students.map((student) => <tr key={student.id}><td>{student.id}</td><td>{student.name}</td><td>{student.className}</td><td>{student.guardian}</td><td>{student.status}</td><td><span className={`status ${student.fee === "Paid" ? "good" : student.fee === "Partial" ? "warn" : "bad"}`}>{student.fee}</span></td></tr>)}</tbody>
      </table>
    </section>
  );
}
