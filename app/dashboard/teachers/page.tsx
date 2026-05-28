import { teachers } from "@/lib/mock-data";

export default function TeachersPage() {
  return (
    <section className="card" style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Teachers</h1>
      <p style={{ color: "#64748b" }}>Manage teacher profiles, subjects, classes and availability.</p>
      <table className="table">
        <thead><tr><th>ID</th><th>Name</th><th>Subject</th><th>Classes</th><th>Status</th></tr></thead>
        <tbody>{teachers.map((teacher) => <tr key={teacher.id}><td>{teacher.id}</td><td>{teacher.name}</td><td>{teacher.subject}</td><td>{teacher.classes}</td><td><span className="status good">{teacher.status}</span></td></tr>)}</tbody>
      </table>
    </section>
  );
}
