import { LockKeyhole, ShieldCheck } from "lucide-react";
import { securityScores, trustControls } from "@/lib/audit-data";
import { RadialScore } from "@/components/premium/RadialScore";

export default function TrustPage() {
  return (
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><ShieldCheck size={14} /> Trust Center</span>
        <h1>Security and trust designed into the product experience.</h1>
        <p>A high-standard SaaS should show how it protects school data, student records, payments, role permissions and audit history.</p>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel trust-score-panel">
          <span className="premium-kicker"><LockKeyhole size={14} /> Security Readiness</span>
          <h2>Trust posture</h2>
          <div className="trust-scores">
            {securityScores.map((item) => <div key={item.label}><RadialScore score={item.score} label={item.label} /></div>)}
          </div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker">Control Checklist</span>
          <h2>Enterprise controls</h2>
          <div className="trust-list">
            {trustControls.map((control) => (
              <article key={control.title}>
                <div><strong>{control.title}</strong><p>{control.detail}</p></div>
                <span>{control.status}</span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
