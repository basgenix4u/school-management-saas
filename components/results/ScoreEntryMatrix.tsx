"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, Loader2, Save } from "lucide-react";
import { getAverage, getGrade, resultStudents } from "@/lib/results-center";

export function ScoreEntryMatrix() {
  const [selectedStudent, setSelectedStudent] = useState(resultStudents[0].slug);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("Enter scores and save them to the live results API when Supabase is configured.");
  const student = useMemo(() => resultStudents.find((item) => item.slug === selectedStudent) ?? resultStudents[0], [selectedStudent]);
  const average = getAverage(student.subjects);
  const grade = getGrade(average);

  async function saveResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setSaved(false);
    setMessage("Saving result...");

    try {
      const response = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admissionNo: form.get("admissionNo"),
          subjectName: form.get("subjectName"),
          term: form.get("term"),
          session: form.get("session"),
          caScore: Number(form.get("caScore")),
          examScore: Number(form.get("examScore")),
          status: form.get("status"),
          teacherComment: form.get("teacherComment"),
          principalComment: form.get("principalComment"),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Unable to save result");
      setSaved(true);
      setMessage(payload.source === "supabase" ? "Result saved to Supabase successfully." : "Result accepted in configuration mode.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save result.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker">Score Entry Matrix</span>
        <h1>Enter, validate and review scores with confidence.</h1>
        <p>Designed for teachers and class teachers to enter continuous assessment, exam scores, totals, comments and approval-ready result data.</p>
      </section>

      <section className="live-status-card">
        {saving ? <Loader2 className="spin" size={18} /> : saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
        <span>{message}</span>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <div className="panel-header compact"><div><span className="premium-kicker">Active Student</span><h2>{student.name}</h2></div><select value={selectedStudent} onChange={(event) => { setSelectedStudent(event.target.value); setSaved(false); }}>{resultStudents.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></div>
          <div className="score-summary-card"><strong>{average}%</strong><span>{grade.grade} • {grade.remark}</span><small>{student.className} • {student.term} • {student.session}</small></div>
          <div className="score-table-wrap">
            <table className="table premium-table">
              <thead><tr><th>Subject</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>Teacher</th></tr></thead>
              <tbody>{student.subjects.map((subject) => { const subjectGrade = getGrade(subject.total); return <tr key={subject.name}><td>{subject.name}</td><td>{subject.ca}</td><td>{subject.exam}</td><td><strong>{subject.total}</strong></td><td><span className="status good">{subjectGrade.grade}</span></td><td>{subject.teacher}</td></tr>; })}</tbody>
            </table>
          </div>
          <div className="register-actions"><Link className="btn btn-secondary" href={`/dashboard/results/report-card/${student.slug}`}><FileText size={18} /> Preview Report</Link>{saved ? <span><CheckCircle2 size={18} /> Scores saved for review</span> : null}</div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker">Live score entry</span>
          <h2>Save a result</h2>
          <form className="live-form-grid result-entry-form" onSubmit={saveResult}>
            <label><span>Admission no.</span><input name="admissionNo" required defaultValue={student.id} placeholder="STU-1001" /></label>
            <label><span>Subject</span><input name="subjectName" required defaultValue={student.subjects[0]?.name ?? "Physics"} /></label>
            <label><span>Term</span><input name="term" required defaultValue={student.term} /></label>
            <label><span>Session</span><input name="session" required defaultValue={student.session} /></label>
            <label><span>CA score</span><input name="caScore" type="number" min="0" max="40" required defaultValue={student.subjects[0]?.ca ?? 30} /></label>
            <label><span>Exam score</span><input name="examScore" type="number" min="0" max="60" required defaultValue={student.subjects[0]?.exam ?? 58} /></label>
            <label><span>Status</span><select name="status" defaultValue="APPROVED"><option>DRAFT</option><option>REVIEW</option><option>APPROVED</option><option>PUBLISHED</option></select></label>
            <label className="full"><span>Teacher comment</span><textarea name="teacherComment" defaultValue={student.teacherComment} /></label>
            <label className="full"><span>Principal comment</span><textarea name="principalComment" defaultValue={student.principalComment} /></label>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Save result</button>
          </form>
        </div>
      </section>
    </div>
  );
}
