"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Filter, Search, Upload, UserPlus } from "lucide-react";
import { getStudentSummary, studentRecords } from "@/lib/student-360";

function riskClass(risk: string) {
  if (risk === "High") return "bad";
  if (risk === "Medium") return "warn";
  return "good";
}

export function StudentDirectory() {
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("All");
  const summary = getStudentSummary();

  const filteredStudents = useMemo(() => {
    const value = query.trim().toLowerCase();
    return studentRecords.filter((student) => {
      const matchesQuery = !value || `${student.name} ${student.id} ${student.className} ${student.guardian}`.toLowerCase().includes(value);
      const matchesRisk = risk === "All" || student.risk === risk;
      return matchesQuery && matchesRisk;
    });
  }, [query, risk]);

  return (
    <div className="student-directory">
      <section className="card-aurora student-hero">
        <span className="premium-kicker"><UserPlus size={14} /> Student 360</span>
        <h1>Know every learner beyond a row in a spreadsheet.</h1>
        <p>Student 360 combines biodata, guardians, finance, attendance, performance and intervention signals into one premium student management experience.</p>
        <div className="hero-actions"><button className="btn btn-primary" type="button"><UserPlus size={18} /> Enroll Student</button><button className="btn btn-secondary" type="button"><Upload size={18} /> Bulk Import</button></div>
      </section>

      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><UserPlus /></div><span>Total Students</span><strong>{summary.total}</strong><small>demo records</small><p>Built for searchable enrollment records and class placement.</p></article>
        <article className="premium-metric tone-rose"><div className="metric-icon"><Filter /></div><span>High Risk</span><strong>{summary.highRisk}</strong><small>urgent review</small><p>Risk combines attendance, finance and performance signals.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><Filter /></div><span>Fee Follow-Up</span><strong>{summary.pendingFees}</strong><small>not fully paid</small><p>Students with pending or partial fee status.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><Filter /></div><span>Avg Attendance</span><strong>{summary.averageAttendance}%</strong><small>healthy</small><p>Average attendance across the active student sample.</p></article>
      </section>

      <section className="card premium-panel">
        <div className="student-toolbar">
          <div className="student-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by student, ID, class or guardian..." /></div>
          <select value={risk} onChange={(event) => setRisk(event.target.value)} aria-label="Filter by risk">
            <option>All</option><option>Low</option><option>Medium</option><option>High</option>
          </select>
        </div>

        <div className="student-card-grid">
          {filteredStudents.map((student) => (
            <article className="student-card" key={student.id}>
              <div className="student-avatar">{student.name.split(" ").map((part) => part[0]).join("")}</div>
              <div className="student-card-main">
                <div className="student-card-top"><div><strong>{student.name}</strong><span>{student.id} • {student.className}</span></div><span className={`status ${riskClass(student.risk)}`}>{student.risk}</span></div>
                <div className="student-micro-grid"><span>Attendance <strong>{student.attendance}%</strong></span><span>Average <strong>{student.average}%</strong></span><span>Balance <strong>{student.balance}</strong></span></div>
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
