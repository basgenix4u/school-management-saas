import { ArrowRight, Building2, CheckCircle2, Rocket } from "lucide-react";
import { launchChecklist } from "@/lib/intelligence-data";

export default function OnboardingPage() {
  return (
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><Rocket size={14} /> Workspace Launch</span>
        <h1>Premium onboarding for schools that want to go live fast.</h1>
        <p>Guide a new school from setup to active operations with class setup, staff invites, student import, payment configuration and parent portal publishing.</p>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><Building2 size={14} /> Greenfield International School</span>
          <h2>Launch readiness</h2>
          <div className="launch-list">
            {launchChecklist.map((item) => (
              <article key={item.item}>
                <div className="launch-top"><strong>{item.item}</strong><span>{item.status}</span></div>
                <div className="progress-track"><span style={{ width: `${item.progress}%` }} /></div>
              </article>
            ))}
          </div>
        </div>

        <div className="card premium-panel launch-card">
          <CheckCircle2 size={38} color="#10b981" />
          <h2>Designed for real client onboarding</h2>
          <p>Instead of only showing dashboards, EduManage includes a commercial SaaS onboarding concept — a major sign of product maturity.</p>
          <a className="btn btn-primary" href="/dashboard">Return to Command Center <ArrowRight size={18} /></a>
        </div>
      </section>
    </div>
  );
}
