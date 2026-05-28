import { Activity, ArrowUpRight, BrainCircuit, CalendarCheck, CreditCard, GraduationCap, ShieldAlert, UsersRound, Zap } from "lucide-react";
import { attendanceTrend, commandModules, executiveMetrics, experienceTimeline, financeTrend, intelligenceSignals, roleExperiences } from "@/lib/intelligence-data";
import { IntelligenceCopilot } from "@/components/premium/IntelligenceCopilot";
import { RadialScore } from "@/components/premium/RadialScore";
import { TrendLine } from "@/components/premium/TrendLine";

const iconMap = [Activity, CreditCard, ShieldAlert, UsersRound];

export function ExecutiveCommandCenter() {
  return (
    <div className="premium-dashboard">
      <section className="hero-command card-aurora">
        <div>
          <span className="premium-kicker"><Zap size={14} /> Executive Command Center</span>
          <h1>Run the entire school from one intelligent cockpit.</h1>
          <p>
            A high-end operating system for school owners, principals, teachers, accountants, parents and students — built around speed, clarity and decision intelligence.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="/dashboard/intelligence">Open Intelligence Center <ArrowUpRight size={18} /></a>
            <a className="btn btn-secondary" href="/dashboard/onboarding">Launch Workspace</a>
          </div>
        </div>
        <div className="hero-live-card">
          <div className="live-pulse"><span /> Live school health</div>
          <RadialScore score={96} label="Health" />
          <div className="mini-stat-grid">
            <span><strong>1,248</strong> Students</span>
            <span><strong>86</strong> Staff</span>
            <span><strong>94%</strong> Attendance</span>
            <span><strong>₦24.8M</strong> Forecast</span>
          </div>
        </div>
      </section>

      <section className="premium-metrics">
        {executiveMetrics.map((metric, index) => {
          const Icon = iconMap[index] ?? Activity;
          return (
            <article className={`premium-metric tone-${metric.tone}`} key={metric.label}>
              <div className="metric-icon"><Icon size={20} /></div>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>{metric.change}</small>
              <p>{metric.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="premium-grid-2">
        <div className="card premium-panel">
          <div className="panel-header">
            <div>
              <span className="premium-kicker"><CreditCard size={14} /> Finance Intelligence</span>
              <h2>Collection momentum</h2>
            </div>
            <strong className="panel-value">₦18.4M</strong>
          </div>
          <TrendLine data={financeTrend} color="#2563eb" />
          <div className="insight-row">
            <span>Paid invoices</span><strong>78%</strong>
          </div>
          <div className="insight-row">
            <span>High probability pending</span><strong>₦4.1M</strong>
          </div>
          <div className="insight-row">
            <span>Overdue risk</span><strong>₦2.3M</strong>
          </div>
        </div>

        <div className="card premium-panel">
          <div className="panel-header">
            <div>
              <span className="premium-kicker"><CalendarCheck size={14} /> Attendance Signal</span>
              <h2>Daily reliability</h2>
            </div>
            <strong className="panel-value">94.2%</strong>
          </div>
          <TrendLine data={attendanceTrend} color="#10b981" />
          <div className="heat-map" aria-label="Attendance heat map">
            {attendanceTrend.map((value, index) => <span key={`${value}-${index}`} style={{ opacity: value / 100 }} />)}
          </div>
          <p className="muted-copy">Attendance is healthy overall, but intelligence signals recommend reviewing SS2 Science afternoon attendance.</p>
        </div>
      </section>

      <section className="premium-grid-2 align-start">
        <IntelligenceCopilot />

        <div className="card premium-panel">
          <div className="panel-header compact">
            <div>
              <span className="premium-kicker"><BrainCircuit size={14} /> Risk Radar</span>
              <h2>Signals that need attention</h2>
            </div>
          </div>
          <div className="signal-list">
            {intelligenceSignals.map((signal) => (
              <article key={signal.title} className="signal-item">
                <div>
                  <strong>{signal.title}</strong>
                  <p>{signal.message}</p>
                  <small>{signal.action}</small>
                </div>
                <span className={`severity severity-${signal.severity.toLowerCase()}`}>{signal.severity}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <div className="panel-header compact">
            <div>
              <span className="premium-kicker"><GraduationCap size={14} /> Command Modules</span>
              <h2>Fast actions for daily operations</h2>
            </div>
          </div>
          <div className="command-list">
            {commandModules.map((module) => (
              <article key={module.title} className="command-item">
                <div>
                  <strong>{module.title}</strong>
                  <p>{module.description}</p>
                </div>
                <div className="command-meta"><kbd>{module.shortcut}</kbd><span>{module.status}</span></div>
              </article>
            ))}
          </div>
        </div>

        <div className="card premium-panel timeline-panel">
          <div className="panel-header compact">
            <div>
              <span className="premium-kicker"><Activity size={14} /> Live Timeline</span>
              <h2>Today’s operating pulse</h2>
            </div>
          </div>
          <div className="timeline-list">
            {experienceTimeline.map((item) => (
              <article key={item.time}>
                <time>{item.time}</time>
                <div><strong>{item.title}</strong><p>{item.text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="card premium-panel role-panel">
        <div className="panel-header compact">
          <div>
            <span className="premium-kicker"><UsersRound size={14} /> Role-Based Experience</span>
            <h2>One system, different premium experiences</h2>
          </div>
        </div>
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
    </div>
  );
}
