import { CheckCircle2, Rocket, ShieldCheck, Video } from "lucide-react";
import { clientProductScript, deploymentChecklist, launchReadiness } from "@/lib/launch-readiness";
import { RadialScore } from "@/components/premium/RadialScore";

export function LaunchCenter() {
  const overall = Math.round(launchReadiness.reduce((sum, item) => sum + item.score, 0) / launchReadiness.length);
  return (
    <div className="premium-dashboard">
      <section className="card-aurora launch-hero">
        <div>
          <span className="premium-kicker"><Rocket size={14} /> Production Launch Center</span>
          <h1>Prepare the SaaS for deployment, school onboarding and client handover.</h1>
          <p>A professional product needs a launch checklist, readiness scoring, product flow and deployment plan so clients can understand the value quickly.</p>
        </div>
        <div className="launch-score-card"><RadialScore score={overall} label="Ready" /></div>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><ShieldCheck size={14} /> Readiness Score</span>
          <h2>Product readiness areas</h2>
          <div className="launch-readiness-list">{launchReadiness.map((item) => <article key={item.area}><div><strong>{item.area}</strong><p>{item.detail}</p></div><div><span>{item.status}</span><strong>{item.score}%</strong></div></article>)}</div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker"><CheckCircle2 size={14} /> Deployment Checklist</span>
          <h2>Next release tasks</h2>
          <div className="launch-checklist">{deploymentChecklist.map((item) => <article key={item.title} className={item.done ? "done" : ""}><span>{item.done ? "✓" : ""}</span><strong>{item.title}</strong></article>)}</div>
        </div>
      </section>

      <section className="card premium-panel">
        <span className="premium-kicker"><Video size={14} /> Client Product Script</span>
        <h2>How to present this SaaS to schools and clients</h2>
        <div className="product-script-grid">{clientProductScript.map((step, index) => <article key={step}><span>{String(index + 1).padStart(2, "0")}</span><p>{step}</p></article>)}</div>
      </section>
    </div>
  );
}
