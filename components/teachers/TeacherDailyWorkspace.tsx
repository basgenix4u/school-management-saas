"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bell, BookOpenCheck, CalendarCheck, CheckCircle2, ClipboardCheck, Clock, Loader2, Send, Sparkles, UsersRound } from "lucide-react";
import { attendanceHeatmap, attendanceRegister, AttendanceStatus, getAttendanceSummary, lessonPlan, teacherClasses, teacherInsights, teacherProfile } from "@/lib/teacher-workspace";

const statuses: AttendanceStatus[] = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

type RegisterStudent = {
  id: string;
  name: string;
  className: string;
  status: AttendanceStatus;
  risk: string;
  lastSeen: string;
  note: string;
};

type AttendanceApiResponse = {
  status: string;
  source?: "mock" | "supabase";
  summary?: Record<string, number>;
  register?: Array<Record<string, unknown>>;
  message?: string;
};

function statusClass(status: AttendanceStatus) {
  if (status === "PRESENT") return "good";
  if (status === "ABSENT") return "bad";
  if (status === "LATE") return "warn";
  return "good";
}

function severityClass(severity: string) {
  if (severity === "High") return "bad";
  if (severity === "Medium") return "warn";
  return "good";
}

function normalizeAttendance(row: Record<string, unknown>): RegisterStudent {
  if (row.students) {
    const student = row.students as Record<string, unknown>;
    const classroom = row.classrooms as Record<string, unknown> | null;
    const name = `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim() || String(student.admission_no ?? "Student");
    return {
      id: String(student.admission_no ?? row.id),
      name,
      className: String(classroom?.name ?? "Live class"),
      status: String(row.status ?? "PRESENT") as AttendanceStatus,
      risk: "Live",
      lastSeen: String(row.attendance_date ?? "Today"),
      note: String(row.note ?? `Period: ${row.period ?? "Morning"}`),
    };
  }

  return row as unknown as RegisterStudent;
}

export function TeacherDailyWorkspace() {
  const [selectedClass, setSelectedClass] = useState(teacherClasses[0].id);
  const [register, setRegister] = useState<RegisterStudent[]>(attendanceRegister);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState("mock");
  const [message, setMessage] = useState("Loading attendance register...");

  const activeClass = useMemo(() => teacherClasses.find((item) => item.id === selectedClass) ?? teacherClasses[0], [selectedClass]);
  const summary = useMemo(() => {
    const total = register.length;
    const present = register.filter((item) => item.status === "PRESENT").length;
    const absent = register.filter((item) => item.status === "ABSENT").length;
    const late = register.filter((item) => item.status === "LATE").length;
    const excused = register.filter((item) => item.status === "EXCUSED").length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, late, excused, rate };
  }, [register]);

  async function loadAttendance() {
    setLoading(true);
    setMessage("Loading attendance register...");
    try {
      const response = await fetch("/api/attendance", { cache: "no-store" });
      const payload = await response.json() as AttendanceApiResponse;
      if (!response.ok) throw new Error(payload.message ?? "Unable to load attendance");
      setSource(payload.source ?? "mock");
      setRegister((payload.register ?? []).map(normalizeAttendance));
      setMessage(payload.source === "supabase" ? "Live Supabase attendance loaded." : "Demo attendance register loaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Attendance unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadAttendance(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function updateStatus(studentId: string, status: AttendanceStatus) {
    setSubmitted(false);
    setRegister((current) => current.map((student) => student.id === studentId ? { ...student, status } : student));
  }

  async function submitRegister() {
    setSaving(true);
    setMessage("Submitting attendance register...");
    try {
      const results = await Promise.all(register.map((student) => fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionNo: student.id, status: student.status, period: "Morning", note: student.note }),
      })));
      const failed = results.find((response) => !response.ok);
      if (failed) {
        const payload = await failed.json().catch(() => ({ message: "Submission failed" }));
        throw new Error(payload.message ?? "Submission failed");
      }
      setSubmitted(true);
      setMessage("Attendance register saved successfully.");
      await loadAttendance();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit attendance.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="teacher-workspace premium-dashboard">
      <section className="card-aurora teacher-hero">
        <div>
          <span className="premium-kicker"><Sparkles size={14} /> Teacher Daily Workspace • {source}</span>
          <h1>One focused cockpit for every teaching day.</h1>
          <p>Teachers can mark attendance, review class risk, follow lesson flow, submit registers and trigger parent/admin follow-up from one workspace.</p>
          <div className="role-metrics"><span>{teacherProfile.name}</span><span>{teacherProfile.department}</span><span>{teacherProfile.todayClasses} classes today</span></div>
        </div>
        <div className="teacher-hero-card">
          <strong>{activeClass.name}</strong>
          <span>{activeClass.subject} • {activeClass.room}</span>
          <div><Clock size={18} /> {activeClass.time}</div>
        </div>
      </section>

      <section className="live-status-card">
        {loading ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
        <span>{message}</span>
        <button type="button" onClick={loadAttendance}>Refresh</button>
      </section>

      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><UsersRound /></div><span>Students Today</span><strong>{summary.total}</strong><small>{source} register</small><p>Daily teaching load across assigned class periods.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><CalendarCheck /></div><span>Register Rate</span><strong>{summary.rate}%</strong><small>{summary.present}/{summary.total} present</small><p>Current attendance register completion state.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><BookOpenCheck /></div><span>Pending Scores</span><strong>{teacherProfile.pendingScores}</strong><small>assessment entries</small><p>Scores waiting for teacher entry or review.</p></article>
        <article className="premium-metric tone-rose"><div className="metric-icon"><AlertTriangle /></div><span>Class Risks</span><strong>{activeClass.riskCount}</strong><small>needs attention</small><p>Students or class patterns requiring follow-up.</p></article>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <div className="panel-header compact"><div><span className="premium-kicker"><ClipboardCheck size={14} /> Smart Attendance Register</span><h2>{activeClass.name}</h2></div><select value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>{teacherClasses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
          <div className="attendance-summary-row">
            <span><strong>{summary.present}</strong> Present</span><span><strong>{summary.absent}</strong> Absent</span><span><strong>{summary.late}</strong> Late</span><span><strong>{summary.excused}</strong> Excused</span>
          </div>
          <div className="register-list">
            {!loading && register.length === 0 ? <div className="empty-state-card">No attendance records found.</div> : null}
            {register.map((student) => (
              <article key={student.id} className="register-item">
                <div className="register-person"><div className="student-avatar mini">{student.name.split(" ").map((part) => part[0]).join("")}</div><div><strong>{student.name}</strong><span>{student.id} • Last seen: {student.lastSeen}</span><p>{student.note}</p></div></div>
                <div className="status-switcher">{statuses.map((status) => <button key={status} type="button" className={student.status === status ? `active ${statusClass(status)}` : ""} onClick={() => updateStatus(student.id, status)}>{status}</button>)}</div>
              </article>
            ))}
          </div>
          <div className="register-actions"><button className="btn btn-primary" type="button" onClick={submitRegister} disabled={saving}>{saving ? <Loader2 className="spin" size={18} /> : <Send size={18} />} Submit Register</button>{submitted ? <span><CheckCircle2 size={18} /> Register submitted for review</span> : null}</div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker"><BookOpenCheck size={14} /> Lesson Flow</span>
          <h2>Today’s teaching plan</h2>
          <div className="timeline-list lesson-flow">{lessonPlan.map((item) => <article key={item.time}><time>{item.time}</time><div><strong>{item.title}</strong><p>{item.detail}</p></div></article>)}</div>
          <div className="teacher-note"><Bell size={18} /><p>After attendance submission, high-risk absences should appear in the principal decision queue and parent follow-up workflow.</p></div>
        </div>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><AlertTriangle size={14} /> Teacher Insight Queue</span>
          <h2>Recommended follow-up</h2>
          <div className="signal-list">{teacherInsights.map((insight) => <article className="signal-item" key={insight.title}><div><strong>{insight.title}</strong><p>{insight.detail}</p><small>{insight.action}</small></div><span className={`status ${severityClass(insight.severity)}`}>{insight.severity}</span></article>)}</div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker"><CalendarCheck size={14} /> Attendance Heatmap</span>
          <h2>Weekly class reliability</h2>
          <div className="teacher-heatmap">{attendanceHeatmap.flatMap((row, rowIndex) => row.map((value, colIndex) => <span key={`${rowIndex}-${colIndex}`} style={{ opacity: value / 100 }}>{value}%</span>))}</div>
          <p className="muted-copy">Heatmap shows attendance consistency across class periods and school days.</p>
        </div>
      </section>
    </div>
  );
}

export function AttendanceMarkingWorkspace() {
  const summary = getAttendanceSummary();
  return (
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><ClipboardCheck size={14} /> Attendance Marking</span>
        <h1>Fast, auditable attendance marking for every class period.</h1>
        <p>Designed for teachers to capture present, absent, late and excused statuses with immediate risk visibility and admin follow-up readiness.</p>
      </section>
      <section className="premium-metrics">
        <article className="premium-metric tone-emerald"><div className="metric-icon"><CheckCircle2 /></div><span>Present</span><strong>{summary.present}</strong><small>{summary.rate}% rate</small><p>Students marked present in demo register.</p></article>
        <article className="premium-metric tone-rose"><div className="metric-icon"><AlertTriangle /></div><span>Absent</span><strong>{summary.absent}</strong><small>follow-up</small><p>Absences that should flow to intervention queue.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><Clock /></div><span>Late</span><strong>{summary.late}</strong><small>pattern watch</small><p>Late arrivals tracked for discipline and parent engagement.</p></article>
        <article className="premium-metric tone-blue"><div className="metric-icon"><CalendarCheck /></div><span>Excused</span><strong>{summary.excused}</strong><small>verified</small><p>Admin or guardian-approved attendance exceptions.</p></article>
      </section>
      <TeacherDailyWorkspace />
    </div>
  );
}
