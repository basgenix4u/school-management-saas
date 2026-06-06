"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Award, BookOpenCheck, CheckCircle2, ClipboardCheck, FileText, GraduationCap, Loader2, Send, ShieldCheck } from "lucide-react";
import { approvalSteps, getGrade, resultInsights, subjectAverages } from "@/lib/results-center";

type ResultApiRow = Record<string, unknown>;
type ResultBoardStudent = {
  id: string;
  slug: string;
  name: string;
  className: string;
  average: number;
  status: string;
  subjectCount: number;
};

type ResultsApiResponse = {
  status: string;
  source?: "none" | "supabase";
  summary?: Record<string, number>;
  data?: ResultApiRow[];
  insights?: typeof resultInsights;
  message?: string;
};

function statusClass(status: string) {
  if (status === "APPROVED" || status === "PUBLISHED") return "good";
  if (status === "REVIEW") return "warn";
  return "bad";
}

function groupLiveResults(rows: ResultApiRow[]): ResultBoardStudent[] {
  const grouped = new Map<string, { id: string; name: string; totals: number[]; statuses: string[]; subjectCount: number }>();
  for (const row of rows) {
    const student = row.students as Record<string, unknown> | null;
    const id = String(student?.admission_no ?? row.student_id ?? "unknown");
    const name = `${student?.first_name ?? ""} ${student?.last_name ?? ""}`.trim() || id;
    const current = grouped.get(id) ?? { id, name, totals: [], statuses: [], subjectCount: 0 };
    current.totals.push(Number(row.total_score ?? 0));
    current.statuses.push(String(row.status ?? "DRAFT"));
    current.subjectCount += 1;
    grouped.set(id, current);
  }
  return Array.from(grouped.values()).map((item) => {
    const average = item.totals.length ? Math.round(item.totals.reduce((sum, value) => sum + value, 0) / item.totals.length) : 0;
    const status = item.statuses.includes("DRAFT") ? "DRAFT" : item.statuses.includes("REVIEW") ? "REVIEW" : item.statuses.includes("APPROVED") ? "APPROVED" : item.statuses[0] ?? "DRAFT";
    return { id: item.id, slug: item.id, name: item.name, className: "Live Supabase", average, status, subjectCount: item.subjectCount };
  });
}

export function ResultsCommandCenter() {
  const [students, setStudents] = useState<ResultBoardStudent[]>([]);
  const [source, setSource] = useState("none");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Loading academic records...");

  async function loadResults() {
    setLoading(true);
    setMessage("Loading academic records...");
    try {
      const response = await fetch("/api/results", { cache: "no-store" });
      const payload = await response.json() as ResultsApiResponse;
      if (!response.ok) throw new Error(payload.message ?? "Unable to load results");
      setSource(payload.source ?? "none");
      const rows = payload.data ?? [];
      setStudents(payload.source === "supabase" ? groupLiveResults(rows) : []);
      setMessage(payload.source === "supabase" ? "Result records loaded." : (payload.message ?? "Connect your database to load results."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Results unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadResults(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const summary = useMemo(() => {
    const total = students.length;
    const approved = students.filter((student) => student.status === "APPROVED" || student.status === "PUBLISHED").length;
    const review = students.filter((student) => student.status === "REVIEW").length;
    const draft = students.filter((student) => student.status === "DRAFT").length;
    const average = total ? Math.round(students.reduce((sum, student) => sum + student.average, 0) / total) : 0;
    return { total, approved, review, draft, average };
  }, [students]);

  return (
    <div className="results-center premium-dashboard">
      <section className="card-aurora results-hero">
        <div>
          <span className="premium-kicker"><Award size={14} /> Results Command Center • {source}</span>
          <h1>From score entry to polished report cards.</h1>
          <p>Manage academic scores, approval workflows, comments, performance signals and parent-ready report cards with a premium school SaaS experience.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/dashboard/results/entry"><ClipboardCheck size={18} /> Enter Scores</Link>
            <Link className="btn btn-secondary" href={`/dashboard/results/report-card/${students[0]?.slug ?? "amina-yusuf"}`}><FileText size={18} /> Preview Report Card</Link>
          </div>
        </div>
        <div className="results-hero-card">
          <span>Academic Average</span>
          <strong>{summary.average}%</strong>
          <small>{summary.approved} approved • {summary.review} in review • {summary.draft} draft</small>
        </div>
      </section>

      <section className="live-status-card">
        {loading ? <Loader2 className="spin" size={18} /> : source === "supabase" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span>{message}</span>
        <button type="button" onClick={loadResults}>Refresh</button>
      </section>

      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><BookOpenCheck /></div><span>Result Records</span><strong>{summary.total}</strong><small>{source} students</small><p>Academic records ready for entry, review and publishing.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><ShieldCheck /></div><span>Approved</span><strong>{summary.approved}</strong><small>ready</small><p>Results approved for parent/student access.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><ClipboardCheck /></div><span>In Review</span><strong>{summary.review}</strong><small>principal queue</small><p>Results that need review before release.</p></article>
        <article className="premium-metric tone-rose"><div className="metric-icon"><Send /></div><span>Drafts</span><strong>{summary.draft}</strong><small>teacher entry</small><p>Results still waiting for completion.</p></article>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <div className="panel-header compact"><div><span className="premium-kicker"><GraduationCap size={14} /> Student Result Board</span><h2>Academic records</h2></div><Link className="mini-link" href="/dashboard/results/entry">Score entry <ArrowRight size={15} /></Link></div>
          <div className="result-list">
            {!loading && students.length === 0 ? <div className="empty-state-card">No results found. Enter the first score to begin.</div> : null}
            {students.map((student) => {
              const grade = getGrade(student.average);
              return (
                <Link className="result-row" href={`/dashboard/results/report-card/${student.slug}`} key={student.id}>
                  <div><strong>{student.name}</strong><span>{student.id} • {student.className} • {student.subjectCount} subject(s)</span></div>
                  <div><strong>{student.average}%</strong><span>{grade.grade} • {grade.remark}</span></div>
                  <span className={`status ${statusClass(student.status)}`}>{student.status}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker"><ShieldCheck size={14} /> Approval Workflow</span>
          <h2>Publishing pipeline</h2>
          <div className="approval-list">{approvalSteps.map((step) => <article key={step.title}><div><strong>{step.title}</strong><p>{step.description}</p></div><span>{step.status}</span></article>)}</div>
        </div>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><Award size={14} /> Subject Performance</span>
          <h2>Average by subject</h2>
          <div className="subject-bars">{subjectAverages.map((item) => <article key={item.subject}><div><strong>{item.subject}</strong><span>{item.average}%</span></div><div className="progress-track"><span style={{ width: `${item.average}%` }} /></div></article>)}</div>
        </div>
        <div className="card premium-panel">
          <span className="premium-kicker">Academic Intelligence</span>
          <h2>Result insights</h2>
          <div className="signal-list">{resultInsights.map((insight) => <article className="signal-item" key={insight.title}><div><strong>{insight.title}</strong><p>{insight.detail}</p><small>{insight.action}</small></div><span className={`status ${insight.severity === "High" ? "bad" : insight.severity === "Medium" ? "warn" : "good"}`}>{insight.severity}</span></article>)}</div>
        </div>
      </section>
    </div>
  );
}
