"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarCheck, Download, Loader2, Printer } from "lucide-react";
import { EduManageLogo } from "@/components/brand/EduManageLogo";
import { getAverage, getGrade, resultStudents } from "@/lib/results-center";

type MockStudent = typeof resultStudents[number];
type LiveSubject = { name: string; ca: number; exam: number; total: number; teacher: string };
type LiveReport = {
  id: string;
  name: string;
  className: string;
  term: string;
  session: string;
  attendance: number;
  position: string;
  status: string;
  teacherComment: string;
  principalComment: string;
  subjects: LiveSubject[];
};

type ResultApiResponse = {
  status: string;
  source?: "none" | "supabase";
  data?: {
    student?: Record<string, unknown>;
    results?: Array<Record<string, unknown>>;
  } | MockStudent;
  message?: string;
};

function normalizeLiveReport(payload: ResultApiResponse, fallback: MockStudent): LiveReport {
  if (payload.source !== "supabase" || !payload.data || !("results" in payload.data)) {
    return fallback;
  }

  const student = payload.data.student ?? {};
  const rows = payload.data.results ?? [];
  const subjects = rows.map((row) => {
    const subject = row.subjects as Record<string, unknown> | null;
    return {
      name: String(subject?.name ?? "Subject"),
      ca: Number(row.ca_score ?? 0),
      exam: Number(row.exam_score ?? 0),
      total: Number(row.total_score ?? 0),
      teacher: "Live teacher",
    };
  });
  return {
    id: String(student.admission_no ?? fallback.id),
    name: `${student.first_name ?? ""} ${student.last_name ?? ""}`.trim() || fallback.name,
    className: "Live Supabase",
    term: String(rows[0]?.term ?? fallback.term),
    session: String(rows[0]?.session ?? fallback.session),
    attendance: fallback.attendance,
    position: fallback.position,
    status: String(rows[0]?.status ?? fallback.status),
    teacherComment: String(rows[0]?.teacher_comment ?? fallback.teacherComment),
    principalComment: String(rows[0]?.principal_comment ?? fallback.principalComment),
    subjects: subjects.length ? subjects : fallback.subjects,
  };
}

export function ReportCardPreview({ student = resultStudents[0] }: { student?: MockStudent }) {
  const [report, setReport] = useState<LiveReport>(student);
  const [source, setSource] = useState("none");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Loading report card...");

  const loadReport = useCallback(async () => {
    setLoading(true);
    setMessage("Loading report card...");
    try {
      const response = await fetch(`/api/results/${student.id}`, { cache: "no-store" });
      const payload = await response.json() as ResultApiResponse;
      if (!response.ok) throw new Error(payload.message ?? "Unable to load report card");
      setSource(payload.source ?? "none");
      setReport(normalizeLiveReport(payload, student));
      setMessage(payload.source === "supabase" ? "Report card loaded." : (payload.message ?? "Connect your database to load report cards."));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Report card unavailable.");
      setReport(student);
    } finally {
      setLoading(false);
    }
  }, [student]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadReport(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadReport]);

  const average = useMemo(() => getAverage(report.subjects), [report.subjects]);
  const grade = getGrade(average);

  return (
    <div className="report-card-shell">
      <section className="live-status-card">
        {loading ? <Loader2 className="spin" size={18} /> : <CalendarCheck size={18} />}
        <span>{message} Source: {source === "supabase" ? "live" : "not connected"}.</span>
        <button type="button" onClick={loadReport}>Refresh</button>
      </section>
      <div className="report-card-actions"><button className="btn btn-primary" type="button"><Printer size={18} /> Print</button><button className="btn btn-secondary" type="button"><Download size={18} /> Download PDF</button></div>
      <article className="report-card">
        <header>
          <div className="report-logo brand-report-logo"><EduManageLogo href="" uploaded /></div>
          <div><h1>School Academic Report</h1><p>Academic Report Card • {report.term} • {report.session}</p></div>
          <span className="status good">{report.status}</span>
        </header>
        <section className="report-student-grid">
          <div><span>Student</span><strong>{report.name}</strong></div>
          <div><span>Admission No.</span><strong>{report.id}</strong></div>
          <div><span>Class</span><strong>{report.className}</strong></div>
          <div><span>Position</span><strong>{report.position}</strong></div>
          <div><span>Attendance</span><strong>{report.attendance}%</strong></div>
          <div><span>Average</span><strong>{average}% • {grade.grade}</strong></div>
        </section>
        <table className="report-table"><thead><tr><th>Subject</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th><th>Remark</th></tr></thead><tbody>{report.subjects.map((subject) => { const subjectGrade = getGrade(subject.total); return <tr key={subject.name}><td>{subject.name}</td><td>{subject.ca}</td><td>{subject.exam}</td><td>{subject.total}</td><td>{subjectGrade.grade}</td><td>{subjectGrade.remark}</td></tr>; })}</tbody></table>
        <section className="report-comments"><div><strong>Class Teacher Comment</strong><p>{report.teacherComment}</p></div><div><strong>Principal Comment</strong><p>{report.principalComment}</p></div></section>
        <footer><span><CalendarCheck size={15} /> Attendance verified</span><span>Generated by EduManage School OS</span></footer>
      </article>
    </div>
  );
}
