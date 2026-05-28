import { Activity, AlertTriangle, History, ShieldCheck } from "lucide-react";
import { auditEvents } from "@/lib/audit-data";

export default function AuditPage() {
  return (
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><History size={14} /> Audit Trail</span>
        <h1>Every sensitive school action should be traceable.</h1>
        <p>Enterprise-grade school software needs visibility over results, payments, attendance, user access and system intelligence events.</p>
      </section>

      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><Activity /></div><span>Events Today</span><strong>1,842</strong><small>+18%</small><p>All dashboard, finance, academic and portal actions.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><AlertTriangle /></div><span>Review Queue</span><strong>12</strong><small>4 urgent</small><p>Actions that require principal or owner review.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><ShieldCheck /></div><span>Policy Pass Rate</span><strong>98%</strong><small>healthy</small><p>Role and workspace boundaries are being respected.</p></article>
        <article className="premium-metric tone-violet"><div className="metric-icon"><History /></div><span>Retention</span><strong>365d</strong><small>planned</small><p>Recommended audit retention for school operations.</p></article>
      </section>

      <section className="card premium-panel">
        <div className="panel-header compact"><div><span className="premium-kicker">Live Audit Feed</span><h2>Recent sensitive events</h2></div></div>
        <div className="audit-table-wrap">
          <table className="table premium-table">
            <thead><tr><th>ID</th><th>Actor</th><th>Role</th><th>Action</th><th>Resource</th><th>Time</th><th>Risk</th></tr></thead>
            <tbody>{auditEvents.map((event) => <tr key={event.id}><td>{event.id}</td><td>{event.actor}</td><td>{event.role}</td><td>{event.action}</td><td>{event.resource}</td><td>{event.time}</td><td><span className={`status ${event.risk === "High" ? "bad" : event.risk === "Medium" ? "warn" : "good"}`}>{event.risk}</span></td></tr>)}</tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
