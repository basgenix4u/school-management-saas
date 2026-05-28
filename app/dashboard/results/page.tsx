import { results } from "@/lib/mock-data";

export default function ResultsPage() {
  return (
    <section className="card" style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Results</h1>
      <p style={{ color: "#64748b" }}>Publish scores, academic averages, positions and report cards.</p>
      <table className="table">
        <thead><tr><th>Student</th><th>Class</th><th>Average</th><th>Position</th><th>Status</th></tr></thead>
        <tbody>{results.map((result) => <tr key={result.student}><td>{result.student}</td><td>{result.className}</td><td>{result.average}</td><td>{result.position}</td><td><span className={`status ${result.status === "Published" ? "good" : "warn"}`}>{result.status}</span></td></tr>)}</tbody>
      </table>
    </section>
  );
}
