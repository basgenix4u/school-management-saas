"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Award, BookOpenCheck, CalendarCheck, GraduationCap, ListChecks, Loader2, Trophy } from "lucide-react";

type PortalPayload = {
  status: string;
  profile?: { name?: string; email?: string; role?: string } | null;
  students?: Array<Record<string, unknown>>;
  invoices?: Array<Record<string, unknown>>;
  results?: Array<Record<string, unknown>>;
  attendance?: Array<Record<string, unknown>>;
  message?: string;
};

function scoreAverage(results: Array<Record<string, unknown>>) {
  if (!results.length) return 0;
  return Math.round(results.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / results.length);
}

export function StudentPortal() {
  const [data, setData] = useState<PortalPayload>({ status: "loading", students: [], results: [], attendance: [], invoices: [] });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/portal/student", { cache: "no-store" });
      const payload = await response.json() as PortalPayload;
      setData(payload);
    } catch (error) {
      setData({ status: "error", message: error instanceof Error ? error.message : "Unable to load student portal", students: [], results: [], attendance: [], invoices: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);

  const student = data.students?.[0];
  const results = useMemo(() => data.results ?? [], [data.results]);
  const attendance = useMemo(() => data.attendance ?? [], [data.attendance]);
  const average = useMemo(() => scoreAverage(results), [results]);

  return (
    <main className="portal-shell">
      <section className="portal-hero card-aurora">
        <div>
          <span className="premium-kicker"><GraduationCap size={14} /> Student Portal</span>
          <h1>Your learning progress in one secure place.</h1>
          <p>View your academic results, attendance activity and school updates connected to your student account.</p>
          <div className="role-metrics"><span>{String(student?.student_name ?? data.profile?.name ?? "Student account")}</span><span>{String(student?.classroom ?? "No class assigned")}</span><span>{average}% average</span></div>
        </div>
        <div className="portal-live-card"><strong>{average}%</strong><span>Academic average</span><small>{loading ? "Loading..." : data.status}</small></div>
      </section>

      <section className="live-status-card">
        {loading ? <Loader2 className="spin" size={18} /> : data.status === "ok" ? <CalendarCheck size={18} /> : <AlertCircle size={18} />}
        <span>{data.message ?? (data.status === "ok" ? "Student portal data loaded." : "Portal is ready once your student email is linked.")}</span>
        <button type="button" onClick={load}>Refresh</button>
      </section>

      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><Award /></div><span>Average</span><strong>{average}%</strong><small>{results.length} records</small><p>Current academic performance from published result records.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><CalendarCheck /></div><span>Attendance</span><strong>{attendance.length}</strong><small>records</small><p>Attendance records connected to your student profile.</p></article>
        <article className="premium-metric tone-violet"><div className="metric-icon"><Trophy /></div><span>Subjects</span><strong>{results.length}</strong><small>tracked</small><p>Subjects with available result entries.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><ListChecks /></div><span>Actions</span><strong>{student ? 1 : 0}</strong><small>available</small><p>Student actions and next steps appear here.</p></article>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><BookOpenCheck size={14} /> Subject Progress</span>
          <h2>Current performance</h2>
          <div className="subject-progress-list">
            {results.length === 0 ? <div className="empty-state-card">No results are available yet.</div> : null}
            {results.map((result) => <article key={String(result.id)}><div><strong>{String((result.subjects as Record<string, unknown> | null)?.name ?? "Subject")}</strong><span>{String(result.term ?? "")} • {String(result.session ?? "")}</span></div><div><strong>{Number(result.total_score ?? 0)}%</strong><span className="status good">{String(result.grade ?? "-")}</span></div></article>)}
          </div>
          {student ? <Link className="btn btn-primary" href={`/dashboard/results/report-card/${String(student.admission_no)}`}>View Report Card</Link> : null}
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker"><CalendarCheck size={14} /> Attendance</span>
          <h2>Recent attendance</h2>
          <div className="trust-list">{attendance.length === 0 ? <article><div><strong>No attendance yet</strong><p>Attendance records will appear after your teachers submit class registers.</p></div><span>Pending</span></article> : attendance.slice(0, 6).map((item) => <article key={String(item.id)}><div><strong>{String(item.status)}</strong><p>{String(item.attendance_date)} • {String(item.period ?? "")}</p></div><span>{String(item.status)}</span></article>)}</div>
        </div>
      </section>
    </main>
  );
}
