"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Filter, Loader2, Search, UserPlus, UsersRound, Wallet } from "lucide-react";
import { formatNairaCompact } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Metric, MetricGrid } from "@/components/ui/Metric";
import { Select } from "@/components/ui/Select";

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

function riskTone(risk: string): BadgeTone {
  if (risk === "High") return "danger";
  if (risk === "Medium") return "warning";
  return "success";
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
      balance: formatNairaCompact(row.balance),
      lastActivity: `Live record • ${row.invoices ?? 0} invoice(s)`,
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
  const [connected, setConnected] = useState(false);
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
      setConnected(payload.source === "supabase");
      setSummary(payload.summary ?? {});
      setStudents((payload.data ?? []).map(normalizeStudent));
      setMessage(payload.source === "supabase" ? "Student records loaded." : (payload.message ?? "Connect your database to load student records."));
    } catch (error) {
      setConnected(false);
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
  const feeFollowUp = summary.withBalance ?? students.filter((student) => student.balance !== "₦0" && student.balance !== "NGN 0").length;
  const classCount = useMemo(() => new Set(students.map((student) => student.className)).size, [students]);

  return (
    <div className="student-directory">
      <section className="card-aurora student-hero">
        <span className="premium-kicker"><UserPlus size={14} /> Student records</span>
        <h1>Know every learner beyond a row in a spreadsheet.</h1>
        <p>Each record combines biodata, guardians, finance, attendance and performance signals in one place.</p>
        <div className="hero-actions">
          <Button onClick={() => setFormOpen(true)}><UserPlus size={18} /> Enroll Student</Button>
        </div>
      </section>

      <Alert tone={loading ? "info" : connected ? "success" : "warning"}>
        <p>{message}</p>
        <p><Button variant="secondary" size="sm" onClick={loadStudents} disabled={loading}>Refresh</Button></p>
      </Alert>

      <Dialog
        open={formOpen}
        title="Enroll student"
        onClose={() => setFormOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" form="enroll-student" disabled={saving}>
              {saving ? <Loader2 className="spin" size={18} /> : <UserPlus size={18} />} Save student
            </Button>
          </>
        }
      >
        <form id="enroll-student" className="ui-form" onSubmit={createStudent}>
          <Field label="First name" required>{(id) => <Input id={id} name="firstName" required placeholder="Amina" autoComplete="off" />}</Field>
          <Field label="Last name" required>{(id) => <Input id={id} name="lastName" required placeholder="Yusuf" autoComplete="off" />}</Field>
          <Field label="Admission number" required hint="Unique for this student, e.g. STU-2001">{(id) => <Input id={id} name="admissionNo" required placeholder="STU-2001" autoComplete="off" />}</Field>
          <Field label="Class">{(id) => <Input id={id} name="className" placeholder="SS2 Science" autoComplete="off" />}</Field>
          <Field label="Guardian name">{(id) => <Input id={id} name="guardianName" placeholder="Mr. Yusuf" autoComplete="off" />}</Field>
          <Field label="Guardian phone">{(id) => <Input id={id} name="guardianPhone" placeholder="0803 123 4567" inputMode="tel" autoComplete="off" />}</Field>
          <Field label="Risk level">
            {(id) => (
              <Select id={id} name="riskLevel" defaultValue="Low">
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </Select>
            )}
          </Field>
        </form>
      </Dialog>

      <MetricGrid>
        <Metric icon={<UsersRound size={20} />} label="Total students" value={String(summary.total ?? students.length)} caption="enrolled records" />
        <Metric icon={<Filter size={20} />} label="High risk" value={String(highRisk)} caption="urgent review" />
        <Metric icon={<Wallet size={20} />} label="Fee follow-up" value={String(feeFollowUp)} caption="balance watch" />
        <Metric icon={<UsersRound size={20} />} label="Classes" value={String(classCount)} caption="represented" />
      </MetricGrid>

      <section className="card premium-panel">
        <div className="ui-toolbar">
          <Field label="Search students">
            {(id) => <Input id={id} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by student, ID, class or guardian..." leading={<Search size={18} aria-hidden="true" />} />}
          </Field>
          <Field label="Risk">
            {(id) => (
              <Select id={id} value={risk} onChange={(event) => setRisk(event.target.value)} aria-label="Filter by risk">
                <option>All</option><option>Low</option><option>Medium</option><option>High</option>
              </Select>
            )}
          </Field>
        </div>

        {!loading && filteredStudents.length === 0 ? (
          <EmptyState
            icon={<Search size={22} />}
            title={students.length === 0 ? "No students enrolled yet" : "No students match your search"}
            body={students.length === 0 ? "Enroll your first student to start building records." : "Try a different name, admission number or class."}
            action={students.length === 0 ? <Button onClick={() => setFormOpen(true)}><UserPlus size={18} /> Enroll Student</Button> : undefined}
          />
        ) : (
          <div className="student-card-grid">
            {filteredStudents.map((student) => (
              <article className="student-card" key={student.id}>
                <div className="student-avatar">{initials(student.name)}</div>
                <div className="student-card-main">
                  <div className="student-card-top"><div><strong>{student.name}</strong><span>{student.id} • {student.className}</span></div><Badge tone={riskTone(student.risk)}>{student.risk}</Badge></div>
                  <div className="student-micro-grid"><span>Attendance <strong>{student.attendance}</strong></span><span>Average <strong>{student.average}</strong></span><span>Balance <strong>{student.balance}</strong></span></div>
                  <p>{student.lastActivity}</p>
                  <Link href={`/dashboard/students/${student.slug}`}>Open Student 360 <ArrowRight size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
