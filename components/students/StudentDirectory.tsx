"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CheckCircle2, Filter, Loader2, Search, Upload, UserPlus } from "lucide-react";

type StudentCard = {
  id: string;
  slug: string;
  name: string;
  className: string;
  guardian: string;
  risk: string;
  attendance: string;
  average: string;
  balance: string;
  lastActivity: string;
};

type StudentApiResponse = {
  status: string;
  source?: "none" | "supabase";
  summary?: Record<string, number>;
  data?: Array<Record<string, unknown>>;
  message?: string;
};

function riskClass(risk: string) {
  if (risk === "High") return "bad";
  if (risk === "Medium") return "warn";
  return "good";
}

function formatCurrency(value: unknown) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("") || "ST";
}

function normalizeStudent(row: Record<string, unknown>): StudentCard {
  if (typeof row.student_name === "string") {
    return {
      id: String(row.admission_no ?? row.id),
      slug: String(row.admission_no ?? row.id),
      name: row.student_name,
      className: String(row.classroom ?? "Unassigned"),
      guardian: String(row.guardian_name ?? "No guardian linked"),
      risk: String(row.risk_level ?? "Low"),
      attendance: `${Number(row.attendance_records ?? 0)} records`,
      average: "Live",
      balance: formatCurrency(row.balance),
      lastActivity: `Live Supabase record • ${row.invoices ?? 0} invoice(s)`,
    };
  }

  return {
    id: String(row.id),
    slug: String(row.slug ?? row.id),
    name: String(row.name),
    className: String(row.className),
    guardian: String(row.guardian),
    risk: String(row.risk),
    attendance: `${row.attendance}%`,
    average: `${row.average}%`,
    balance: String(row.balance),
    lastActivity: String(row.lastActivity),
  };
}

export function StudentDirectory() {
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("All");
  const [students, setStudents] = useState<StudentCard[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({ total: 0, highRisk: 0, withBalance: 0 });
  const [source, setSource] = useState("none");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Loading student records...");
  const [formOpen, setFormOpen] = useState(false);

  async function loadStudents() {
    setLoading(true);
    setMessage("Loading student records...");
    try {
      const response = await fetch("/api/students", { cache: "no-store" });
      const payload = await response.json() as StudentApiResponse;
      if (!response.ok) throw new Error(payload.message ?? "Unable to load students");
      setSource(payload.source ?? "none");
      setSummary(payload.summary ?? {});
      setStudents((payload.data ?? []).map(normalizeStudent));
      setMessage(payload.source === "supabase" ? "Student records loaded." : (payload.message ?? "Connect your database to load student records."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Student records unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadStudents(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function createStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setMessage("Creating student record...");
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          admissionNo: form.get("admissionNo"),
          className: form.get("className"),
          guardianName: form.get("guardianName"),
          guardianPhone: form.get("guardianPhone"),
          riskLevel: form.get("riskLevel"),
        }),
      });
      const payload = await response.json() as StudentApiResponse;
      if (!response.ok) throw new Error(payload.message ?? "Unable to create student");
      setMessage("Student created successfully.");
      setFormOpen(false);
      event.currentTarget.reset();
      await loadStudents();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create student.");
    } finally {
      setSaving(false);
    }
  }

  const filteredStudents = useMemo(() => {
    const value = query.trim().toLowerCase();
    return students.filter((student) => {
      const matchesQuery = !value || `${student.name} ${student.id} ${student.className} ${student.guardian}`.toLowerCase().includes(value);
      const matchesRisk = risk === "All" || student.risk === risk;
      return matchesQuery && matchesRisk;
    });
  }, [query, risk, students]);

  const highRisk = summary.highRisk ?? students.filter((student) => student.risk === "High").length;
  const feeFollowUp = summary.withBalance ?? summary.pendingFees ?? students.filter((student) => student.balance !== "₦0" && student.balance !== "NGN 0").length;

  return (
    <div className="student-directory">
      <section className="card-aurora student-hero">
        <span className="premium-kicker"><UserPlus size={14} /> Student 360 • {source}</span>
        <h1>Know every learner beyond a row in a spreadsheet.</h1>
        <p>Student 360 combines biodata, guardians, finance, attendance, performance and intervention signals into one premium student management experience.</p>
        <div className="hero-actions">
          <button className="btn btn-primary" type="button" onClick={() => setFormOpen((value) => !value)}><UserPlus size={18} /> Enroll Student</button>
          <button className="btn btn-secondary" type="button"><Upload size={18} /> Bulk Import</button>
        </div>
      </section>

      <section className="live-status-card">
        {loading ? <Loader2 className="spin" size={18} /> : source === "supabase" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span>{message}</span>
        <button type="button" onClick={loadStudents}>Refresh</button>
      </section>

      {formOpen ? (
        <section className="card premium-panel live-form-panel">
          <span className="premium-kicker">Live student creation</span>
          <h2>Create student record</h2>
          <form className="live-form-grid" onSubmit={createStudent}>
            <label><span>First name</span><input name="firstName" required placeholder="Amina" /></label>
            <label><span>Last name</span><input name="lastName" required placeholder="Yusuf" /></label>
            <label><span>Admission no.</span><input name="admissionNo" required placeholder="STU-2001" /></label>
            <label><span>Class</span><input name="className" placeholder="SS2 Science" /></label>
            <label><span>Guardian</span><input name="guardianName" placeholder="Mr. Yusuf" /></label>
            <label><span>Guardian phone</span><input name="guardianPhone" placeholder="+234..." /></label>
            <label><span>Risk level</span><select name="riskLevel" defaultValue="Low"><option>Low</option><option>Medium</option><option>High</option></select></label>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <Loader2 className="spin" size={18} /> : <UserPlus size={18} />} Save student</button>
          </form>
        </section>
      ) : null}

      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><UserPlus /></div><span>Total Students</span><strong>{summary.total ?? students.length}</strong><small>{source} records</small><p>Searchable enrollment records and class placement.</p></article>
        <article className="premium-metric tone-rose"><div className="metric-icon"><Filter /></div><span>High Risk</span><strong>{highRisk}</strong><small>urgent review</small><p>Risk combines attendance, finance and performance signals.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><Filter /></div><span>Fee Follow-Up</span><strong>{feeFollowUp}</strong><small>balance watch</small><p>Students with pending balances or payment follow-up.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><Filter /></div><span>Data Source</span><strong>{source}</strong><small>runtime</small><p>Uses live Supabase when environment variables are configured.</p></article>
      </section>

      <section className="card premium-panel">
        <div className="student-toolbar">
          <div className="student-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by student, ID, class or guardian..." /></div>
          <select value={risk} onChange={(event) => setRisk(event.target.value)} aria-label="Filter by risk">
            <option>All</option><option>Low</option><option>Medium</option><option>High</option>
          </select>
        </div>

        <div className="student-card-grid">
          {!loading && filteredStudents.length === 0 ? <div className="empty-state-card">No students match your search.</div> : null}
          {filteredStudents.map((student) => (
            <article className="student-card" key={student.id}>
              <div className="student-avatar">{initials(student.name)}</div>
              <div className="student-card-main">
                <div className="student-card-top"><div><strong>{student.name}</strong><span>{student.id} • {student.className}</span></div><span className={`status ${riskClass(student.risk)}`}>{student.risk}</span></div>
                <div className="student-micro-grid"><span>Attendance <strong>{student.attendance}</strong></span><span>Average <strong>{student.average}</strong></span><span>Balance <strong>{student.balance}</strong></span></div>
                <p>{student.lastActivity}</p>
                <Link href={`/dashboard/students/${student.slug}`}>Open Student 360 <ArrowRight size={16} /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
