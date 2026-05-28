export function MetricCard({ label, value, change, tone = "good" }: { label: string; value: string; change: string; tone?: string }) {
  return (
    <div className="metric">
      <div style={{ color: "#64748b", fontWeight: 800, fontSize: 13 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 14, marginTop: 10 }}>
        <strong style={{ fontSize: 30 }}>{value}</strong>
        <span className={`status ${tone === "warn" ? "warn" : tone === "bad" ? "bad" : "good"}`}>{change}</span>
      </div>
    </div>
  );
}
