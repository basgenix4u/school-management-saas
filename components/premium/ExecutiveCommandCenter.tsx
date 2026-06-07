"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, BrainCircuit, CalendarCheck, CreditCard, GraduationCap, Loader2, ShieldAlert, UsersRound, Zap } from "lucide-react";
import { commandModules, experienceTimeline, roleExperiences } from "@/lib/intelligence-data";
import { IntelligenceCopilot } from "@/components/premium/IntelligenceCopilot";
import { RadialScore } from "@/components/premium/RadialScore";
import { TrendLine } from "@/components/premium/TrendLine";

const iconMap = [Activity, CreditCard, ShieldAlert, UsersRound];

type InsightMetric = { label: string; value: string; change: string; tone: string; detail: string };
type InsightSignal = { title: string; severity: string; message: string; action: string };
type InsightPayload = {
  status: string;
  message?: string;
  summary?: Record<string, unknown> | null;
  metrics?: InsightMetric[];
  signals?: InsightSignal[];
  trends?: { attendance?: number[]; finance?: number[] };
};

export function ExecutiveCommandCenter() {
  const [payload, setPayload] = useState<InsightPayload>({ status: "loading", metrics: [], signals: [], trends: { attendance: [], finance: [] } });
  const [loading, setLoading] = useState(true);

  async function loadInsights() {
    setLoading(true);
    try {
      const response = await fetch("/api/insights", { cache: "no-store" });
      const data = await response.json() as InsightPayload;
      setPayload(data);
    } catch (error) {
      setPayload({ status: "error", message: error instanceof Error ? error.message : "Unable to load analytics", metrics: [], signals: [], trends: { attendance: [], finance: [] } });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const timer = window.setTimeout(() => { void loadInsights(); }, 0); return () => window.clearTimeout(timer); }, []);

  const metrics = useMemo(() => payload.metrics ?? [], [payload.metrics]);
  const signals = useMemo(() => payload.signals ?? [], [payload.signals]);
  const summary = useMemo(() => payload.summary ?? {}, [payload.summary]);
  const healthScore = useMemo(() => Number(String(metrics[0]?.value ?? "0").replace(/[^0-9]/g, "")) || 0, [metrics]);
  const attendanceTrend = payload.trends?.attendance?.length ? payload.trends.attendance : [0, 0, 0, 0, 0];
  const financeTrend = payload.trends?.finance?.length ? payload.trends.finance : [0, 0, 0];

  return (
    <div className="premium-dashboard">
      <section className="hero-command card-aurora">
        <div>
          <span className="premium-kicker"><Zap size={14} /> Executive Command Center</span>
          <h1>Run the entire school from one intelligent cockpit.</h1>
          <p>
            Live analytics give school leaders a fast view of attendance, fees, results, risk and daily operations.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="/dashboard/intelligence">Open Intelligence Center <ArrowUpRight size={18} /></a>
            <a className="btn btn-secondary" href="/dashboard/setup">Set Up School</a>
          </div>
        </div>
        <div className="hero-live-card">
          <div className="live-pulse"><span /> {loading ? "Loading live health" : payload.status === "ok" ? "Live school health" : "Setup required"}</div>
          {loading ? <Loader2 className="spin" size={46} /> : <RadialScore score={healthScore} label="Health" />}
          <div className="mini-stat-grid">
            <span><strong>{String(summary.students_count ?? 0)}</strong> Students</span>
            <span><strong>{String(summary.teachers_count ?? 0)}</strong> Staff</span>
            <span><strong>{String(summary.attendance_rate ?? 0)}%</strong> Attendance</span>
            <span><strong>{String(summary.high_risk_students ?? 0)}</strong> High Risk</span>
          </div>
        </div>
      </section>

      {payload.status !== "ok" ? (
        <section className="live-status-card">
          {loading ? <Loader2 className="spin" size={18} /> : <ShieldAlert size={18} />}
          <span>{payload.message ?? "Create a school profile and add records to activate live analytics."}</span>
          <button type="button" onClick={loadInsights}>Refresh</button>
        </section>
      ) : null}

      <section className="premium-metrics">
        {metrics.length === 0 ? ["Students", "Fees", "Attendance", "Risk"].map((label, index) => {
          const Icon = iconMap[index] ?? Activity;
          return <article className="premium-metric tone-blue" key={label}><div className="metric-icon"><Icon size={20} /></div><span>{label}</span><strong>0</strong><small>setup pending</small><p>Add school records to activate this metric.</p></article>;
        }) : metrics.map((metric, index) => {
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
            <strong className="panel-value">{String(metrics[1]?.value ?? "₦0")}</strong>
          </div>
          <TrendLine data={financeTrend} color="#2563eb" />
          <div className="insight-row"><span>Total billed</span><strong>{String(summary.total_billed ?? "0")}</strong></div>
          <div className="insight-row"><span>Collected</span><strong>{String(summary.total_collected ?? "0")}</strong></div>
          <div className="insight-row"><span>Outstanding</span><strong>{String(summary.outstanding_balance ?? "0")}</strong></div>
        </div>

        <div className="card premium-panel">
          <div className="panel-header">
            <div>
              <span className="premium-kicker"><CalendarCheck size={14} /> Attendance Signal</span>
              <h2>Daily reliability</h2>
            </div>
            <strong className="panel-value">{String(summary.attendance_rate ?? 0)}%</strong>
          </div>
          <TrendLine data={attendanceTrend} color="#10b981" />
          <div className="heat-map" aria-label="Attendance heat map">
            {attendanceTrend.map((value, index) => <span key={`${value}-${index}`} style={{ opacity: Math.max(0.15, value / 100) }} />)}
          </div>
          <p className="muted-copy">Attendance signals update as teachers submit class registers.</p>
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
            {signals.length === 0 ? <div className="empty-state-card">No risk signals yet. Add students, attendance, invoices and results to activate the risk engine.</div> : signals.map((signal) => (
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
          <div className="panel-header compact"><div><span className="premium-kicker"><GraduationCap size={14} /> Command Modules</span><h2>Fast actions for daily operations</h2></div></div>
          <div className="command-list">{commandModules.map((module) => <article key={module.title} className="command-item"><div><strong>{module.title}</strong><p>{module.description}</p></div><div className="command-meta"><kbd>{module.shortcut}</kbd><span>{module.status}</span></div></article>)}</div>
        </div>
        <div className="card premium-panel timeline-panel">
          <div className="panel-header compact"><div><span className="premium-kicker"><Activity size={14} /> Operating Timeline</span><h2>Recent operating pulse</h2></div></div>
          <div className="timeline-list">{experienceTimeline.map((item) => <article key={item.time}><time>{item.time}</time><div><strong>{item.title}</strong><p>{item.text}</p></div></article>)}</div>
        </div>
      </section>

      <section className="card premium-panel role-panel">
        <div className="panel-header compact"><div><span className="premium-kicker"><UsersRound size={14} /> Role-Based Experience</span><h2>One system, different premium experiences</h2></div></div>
        <div className="role-grid">{roleExperiences.map((role) => <article key={role.role}><strong>{role.role}</strong><p>{role.promise}</p><div>{role.features.map((feature) => <span key={feature}>{feature}</span>)}</div></article>)}</div>
      </section>
    </div>
  );
}
