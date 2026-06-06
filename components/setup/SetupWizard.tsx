"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, CheckCircle2, GraduationCap, Loader2, Receipt, Rocket, School, UsersRound } from "lucide-react";

const steps = [
  { id: "school", label: "School profile", icon: Building2 },
  { id: "session", label: "Academic session", icon: CalendarDays },
  { id: "classes", label: "Classes", icon: School },
  { id: "staff", label: "Staff", icon: UsersRound },
  { id: "students", label: "Students", icon: GraduationCap },
  { id: "fees", label: "Fees", icon: Receipt },
  { id: "launch", label: "Launch", icon: Rocket },
];

type Readiness = {
  organization_name?: string;
  readiness_score?: number;
  students_count?: number;
  teachers_count?: number;
  classes_count?: number;
  fee_categories_count?: number;
  academic_sessions_count?: number;
};

async function postJson(url: string, body: unknown) {
  const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message ?? "Unable to save");
  return payload;
}

export function SetupWizard() {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Start by creating your school profile.");
  const [readiness, setReadiness] = useState<Readiness | null>(null);

  async function loadReadiness() {
    try {
      const response = await fetch("/api/setup/status", { cache: "no-store" });
      const payload = await response.json();
      setReadiness(payload.readiness ?? null);
    } catch {
      setReadiness(null);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadReadiness(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      if (step === 0) {
        await postJson("/api/setup/organization", { name: form.get("name"), slug: form.get("slug"), email: form.get("email"), phone: form.get("phone"), address: form.get("address") });
        setMessage("School profile saved.");
      }
      if (step === 1) {
        await postJson("/api/setup/session", { name: form.get("name"), currentTerm: form.get("currentTerm"), startsOn: form.get("startsOn"), endsOn: form.get("endsOn") });
        setMessage("Academic session saved.");
      }
      if (step === 2) {
        await postJson("/api/setup/classes", { classes: [{ name: form.get("name"), level: form.get("level"), arm: form.get("arm"), capacity: Number(form.get("capacity") || 0) || undefined }] });
        setMessage("Class saved.");
      }
      if (step === 3) {
        await postJson("/api/setup/teachers", { teachers: [{ staffNo: form.get("staffNo"), name: form.get("name"), email: form.get("email"), phone: form.get("phone"), department: form.get("department"), title: form.get("title") }] });
        setMessage("Staff member saved.");
      }
      if (step === 4) {
        await postJson("/api/setup/students", { students: [{ firstName: form.get("firstName"), lastName: form.get("lastName"), admissionNo: form.get("admissionNo"), className: form.get("className"), gender: form.get("gender"), guardianName: form.get("guardianName"), guardianPhone: form.get("guardianPhone"), guardianEmail: form.get("guardianEmail") }] });
        setMessage("Student saved.");
      }
      if (step === 5) {
        await postJson("/api/setup/fees", { fees: [{ name: form.get("name"), amount: Number(form.get("amount") || 0), billingCycle: form.get("billingCycle"), required: form.get("required") === "on" }] });
        setMessage("Fee category saved.");
      }
      event.currentTarget.reset();
      await loadReadiness();
      setStep((current) => Math.min(current + 1, steps.length - 1));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save setup step.");
    } finally {
      setSaving(false);
    }
  }

  const score = readiness?.readiness_score ?? 0;

  return (
    <div className="setup-wizard premium-dashboard">
      <section className="card-aurora setup-hero">
        <div>
          <span className="premium-kicker"><Rocket size={14} /> First-run setup</span>
          <h1>Set up your school before daily operations begin.</h1>
          <p>Create the foundation your school needs: profile, session, classes, staff, students and fee categories. No fake records. Only your real school data.</p>
        </div>
        <div className="setup-score-card"><strong>{score}%</strong><span>Setup readiness</span><small>{readiness?.organization_name ?? "No school profile yet"}</small></div>
      </section>

      <section className="setup-stepper card premium-panel">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return <button key={item.id} type="button" className={index === step ? "active" : index < step ? "done" : ""} onClick={() => setStep(index)}><Icon size={17} /><span>{item.label}</span></button>;
        })}
      </section>

      <section className="live-status-card">
        {saving ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
        <span>{message}</span>
      </section>

      <section className="premium-grid-2 align-start">
        <form className="card premium-panel setup-form" onSubmit={handleSubmit}>
          {step === 0 ? <SchoolProfileFields /> : null}
          {step === 1 ? <SessionFields /> : null}
          {step === 2 ? <ClassFields /> : null}
          {step === 3 ? <StaffFields /> : null}
          {step === 4 ? <StudentFields /> : null}
          {step === 5 ? <FeeFields /> : null}
          {step < 6 ? <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <Loader2 className="spin" size={18} /> : <ArrowRight size={18} />} Save and continue</button> : <LaunchStep readiness={readiness} />}
        </form>

        <aside className="card premium-panel setup-summary">
          <span className="premium-kicker">Setup summary</span>
          <h2>What is ready?</h2>
          <div className="setup-readiness-list">
            <ReadinessItem label="School profile" value={readiness?.organization_name ? "Ready" : "Pending"} />
            <ReadinessItem label="Academic sessions" value={String(readiness?.academic_sessions_count ?? 0)} />
            <ReadinessItem label="Classes" value={String(readiness?.classes_count ?? 0)} />
            <ReadinessItem label="Staff" value={String(readiness?.teachers_count ?? 0)} />
            <ReadinessItem label="Students" value={String(readiness?.students_count ?? 0)} />
            <ReadinessItem label="Fee categories" value={String(readiness?.fee_categories_count ?? 0)} />
          </div>
          <p>When setup is complete, your live modules will begin showing real school records instead of empty states.</p>
        </aside>
      </section>
    </div>
  );
}

function Field({ name, label, placeholder, type = "text", required = false }: { name: string; label: string; placeholder?: string; type?: string; required?: boolean }) {
  return <label><span>{label}</span><input name={name} type={type} placeholder={placeholder} required={required} /></label>;
}
function SchoolProfileFields() { return <><span className="premium-kicker">Step 1</span><h2>School profile</h2><div className="live-form-grid"><Field name="name" label="School name" required placeholder="Example International School" /><Field name="slug" label="Workspace slug" placeholder="example-school" /><Field name="email" label="School email" type="email" /><Field name="phone" label="Phone" /><label className="full"><span>Address</span><textarea name="address" placeholder="School address" /></label></div></>; }
function SessionFields() { return <><span className="premium-kicker">Step 2</span><h2>Academic session</h2><div className="live-form-grid"><Field name="name" label="Session" required placeholder="2026/2027" /><Field name="currentTerm" label="Current term" required placeholder="First Term" /><Field name="startsOn" label="Start date" type="date" /><Field name="endsOn" label="End date" type="date" /></div></>; }
function ClassFields() { return <><span className="premium-kicker">Step 3</span><h2>Classes and arms</h2><div className="live-form-grid"><Field name="name" label="Class name" required placeholder="SS2 Science" /><Field name="level" label="Level" placeholder="Senior Secondary" /><Field name="arm" label="Arm" placeholder="Science" /><Field name="capacity" label="Capacity" type="number" /></div></>; }
function StaffFields() { return <><span className="premium-kicker">Step 4</span><h2>Staff member</h2><div className="live-form-grid"><Field name="staffNo" label="Staff number" required placeholder="TCH-001" /><Field name="name" label="Full name" required /><Field name="email" label="Email" type="email" /><Field name="phone" label="Phone" /><Field name="department" label="Department" /><Field name="title" label="Title" placeholder="Mathematics Teacher" /></div></>; }
function StudentFields() { return <><span className="premium-kicker">Step 5</span><h2>Student record</h2><div className="live-form-grid"><Field name="firstName" label="First name" required /><Field name="lastName" label="Last name" required /><Field name="admissionNo" label="Admission no." required placeholder="STU-001" /><Field name="className" label="Class" placeholder="SS2 Science" /><Field name="gender" label="Gender" /><Field name="guardianName" label="Guardian name" /><Field name="guardianPhone" label="Guardian phone" /><Field name="guardianEmail" label="Guardian email" type="email" /></div></>; }
function FeeFields() { return <><span className="premium-kicker">Step 6</span><h2>Fee category</h2><div className="live-form-grid"><Field name="name" label="Fee name" required placeholder="Tuition" /><Field name="amount" label="Amount" type="number" required /><Field name="billingCycle" label="Billing cycle" placeholder="termly" /><label className="setup-checkbox"><input name="required" type="checkbox" defaultChecked /> Required fee</label></div></>; }
function ReadinessItem({ label, value }: { label: string; value: string }) { return <article><span>{label}</span><strong>{value}</strong></article>; }
function LaunchStep({ readiness }: { readiness: Readiness | null }) { return <div className="setup-launch-step"><Rocket size={42} /><h2>Setup review</h2><p>Your readiness score is {readiness?.readiness_score ?? 0}%. Continue adding real records until every core module is ready.</p><div className="hero-actions"><Link className="btn btn-primary" href="/dashboard">Open command center</Link><Link className="btn btn-secondary" href="/dashboard/students">Manage students</Link></div></div>; }
