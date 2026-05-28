import { BrainCircuit, CheckCircle2, Sparkles, Target, WandSparkles } from "lucide-react";
import { IntelligenceCopilot } from "@/components/premium/IntelligenceCopilot";
import { intelligenceSignals, roleExperiences } from "@/lib/intelligence-data";

export default function IntelligencePage() {
  return (
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><BrainCircuit size={14} /> Intelligence Layer</span>
        <h1>Decision intelligence for modern school operations.</h1>
        <p>
          This layer turns school data into actions: who needs attention, where money is at risk, which class is dropping and what message should be sent next.
        </p>
      </section>

      <section className="premium-grid-2 align-start">
        <IntelligenceCopilot />
        <div className="card premium-panel">
          <span className="premium-kicker"><Target size={14} /> Decision Queue</span>
          <h2>Prioritized next best actions</h2>
          <div className="signal-list">
            {intelligenceSignals.map((signal) => (
              <article className="signal-item" key={signal.title}>
                <div>
                  <strong>{signal.title}</strong>
                  <p>{signal.message}</p>
                  <small>{signal.action}</small>
                </div>
                <CheckCircle2 size={20} color="#10b981" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="card premium-panel">
        <span className="premium-kicker"><WandSparkles size={14} /> Unique Product Standard</span>
        <h2>Built to feel like a real SaaS operating system</h2>
        <div className="role-grid">
          {roleExperiences.map((role) => (
            <article key={role.role}>
              <strong>{role.role}</strong>
              <p>{role.promise}</p>
              <div>{role.features.map((feature) => <span key={feature}>{feature}</span>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="premium-note">
        <Sparkles size={18} />
        <p>Next implementation step: connect this intelligence UI to real database queries, background jobs and notification workflows.</p>
      </section>
    </div>
  );
}
