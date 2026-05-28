import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bell, CreditCard, GraduationCap, Phone, ShieldAlert } from "lucide-react";
import { getStudentBySlug } from "@/lib/student-360";

function riskClass(risk: string) {
  if (risk === "High") return "bad";
  if (risk === "Medium") return "warn";
  return "good";
}

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = getStudentBySlug(id);
  if (!student) notFound();

  return (
    <div className="premium-dashboard">
      <Link className="back-link" href="/dashboard/students"><ArrowLeft size={16} /> Back to students</Link>
      <section className="card-aurora student-profile-hero">
        <div className="student-profile-avatar">{student.name.split(" ").map((part) => part[0]).join("")}</div>
        <div>
          <span className="premium-kicker"><GraduationCap size={14} /> Student 360 Profile</span>
          <h1>{student.name}</h1>
          <p>{student.id} • {student.className} • {student.gender}</p>
          <div className="role-metrics"><span>{student.status}</span><span>{student.guardian}</span><span>{student.guardianPhone}</span></div>
        </div>
        <span className={`status ${riskClass(student.risk)}`}>{student.risk} Risk</span>
      </section>

      <section className="premium-metrics">
        <article className="premium-metric tone-emerald"><div className="metric-icon"><GraduationCap /></div><span>Academic Average</span><strong>{student.average}%</strong><small>current term</small><p>Performance snapshot for academic intervention planning.</p></article>
        <article className="premium-metric tone-blue"><div className="metric-icon"><Bell /></div><span>Attendance</span><strong>{student.attendance}%</strong><small>term rate</small><p>Attendance performance with risk scoring potential.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><CreditCard /></div><span>Fee Balance</span><strong>{student.balance}</strong><small>{student.fee}</small><p>Payment status for finance and parent follow-up.</p></article>
        <article className="premium-metric tone-violet"><div className="metric-icon"><Phone /></div><span>Guardian</span><strong style={{ fontSize: 22 }}>{student.guardian}</strong><small>{student.guardianPhone}</small><p>Guardian contact for communication workflows.</p></article>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><ShieldAlert size={14} /> Intervention Plan</span>
          <h2>Recommended actions</h2>
          <div className="trust-list">{student.interventions.map((item) => <article key={item}><div><strong>{item}</strong><p>Action generated from student profile context.</p></div><span>Recommended</span></article>)}</div>
        </div>
        <div className="card premium-panel">
          <span className="premium-kicker">Strength Profile</span>
          <h2>What the student is good at</h2>
          <div className="role-grid single-role-grid">{student.strengths.map((strength) => <article key={strength}><strong>{strength}</strong><p>Use this strength to personalize learning and motivation.</p></article>)}</div>
        </div>
      </section>
    </div>
  );
}
