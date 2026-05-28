"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText, Save } from "lucide-react";
import { getAverage, getGrade, resultStudents } from "@/lib/results-center";

export function ScoreEntryMatrix() {
  const [selectedStudent, setSelectedStudent] = useState(resultStudents[0].slug);
  const [saved, setSaved] = useState(false);
  const student = useMemo(() => resultStudents.find((item) => item.slug === selectedStudent) ?? resultStudents[0], [selectedStudent]);
  const average = getAverage(student.subjects);
  const grade = getGrade(average);

  return (
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker">Score Entry Matrix</span>
        <h1>Enter, validate and review scores with confidence.</h1>
        <p>Designed for teachers and class teachers to enter continuous assessment, exam scores, totals, comments and approval-ready result data.</p>
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
          <div className="register-actions"><button className="btn btn-primary" type="button" onClick={() => setSaved(true)}><Save size={18} /> Save Scores</button><Link className="btn btn-secondary" href={`/dashboard/results/report-card/${student.slug}`}><FileText size={18} /> Preview Report</Link>{saved ? <span><CheckCircle2 size={18} /> Scores saved for review</span> : null}</div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker">Comments</span>
          <h2>Teacher and principal remarks</h2>
          <div className="comment-card"><strong>Teacher Comment</strong><p>{student.teacherComment}</p></div>
          <div className="comment-card"><strong>Principal Comment</strong><p>{student.principalComment}</p></div>
          <div className="comment-card"><strong>Publishing Status</strong><p>{student.status}</p></div>
        </div>
      </section>
    </div>
  );
}
