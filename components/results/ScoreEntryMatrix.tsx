"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardCheck, FileText, Loader2, Save } from "lucide-react";
import { TERMS, currentSession } from "@/lib/format";
import { getAverage, getGrade } from "@/lib/results/grading";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Table } from "@/components/ui/Table";
import { Textarea } from "@/components/ui/Textarea";

type RosterStudent = { admissionNo: string; name: string; classroom: string };
type RosterPayload = { status: string; students?: RosterStudent[]; message?: string };

type SubjectRow = { name: string; ca: number; exam: number; total: number; status: string };
type StudentPayload = {
  status: string;
  data?: { student?: Record<string, unknown>; results?: Array<Record<string, unknown>> };
  message?: string;
};

async function requestStudentResults(admissionNo: string, term: string, session: string): Promise<SubjectRow[]> {
  const response = await fetch(`/api/results/${encodeURIComponent(admissionNo)}`, { cache: "no-store" });
  const payload = await response.json() as StudentPayload;
  if (!response.ok) throw new Error(payload.message ?? "Unable to load student results");
  const rows = (payload.data?.results ?? []) as Array<Record<string, unknown>>;
  return rows
    .filter((row) => String(row.term ?? "") === term && String(row.session ?? "") === session)
    .map((row) => {
      const subject = row.subjects as Record<string, unknown> | null;
      return {
        name: String(subject?.name ?? "Subject"),
        ca: Number(row.ca_score ?? 0),
        exam: Number(row.exam_score ?? 0),
        total: Number(row.total_score ?? 0),
        status: String(row.status ?? "DRAFT"),
      };
    });
}

export function ScoreEntryMatrix() {
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [selected, setSelected] = useState("");
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [term, setTerm] = useState<string>(TERMS[0]);
  const [session, setSession] = useState<string>(currentSession());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("Loading the class roster...");

  async function loadRoster() {
    setLoading(true);
    try {
      const response = await fetch("/api/results/roster", { cache: "no-store" });
      const payload = await response.json() as RosterPayload;
      if (!response.ok) throw new Error(payload.message ?? "Unable to load roster");
      const students = payload.students ?? [];
      setRoster(students);
      if (students.length > 0) setSelected((current) => current || students[0].admissionNo);
      setMessage(students.length ? "Roster loaded. Select a student to enter scores." : "No enrolled students yet.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Roster unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadRoster(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Subject list follows the selected student, term and session. The fetch
  // resolves in a continuation so the effect sets nothing synchronously.
  useEffect(() => {
    let cancelled = false;
    if (!selected) return;
    void requestStudentResults(selected, term, session).then(
      (rows) => {
        if (!cancelled) setSubjects(rows);
      },
      () => {
        if (!cancelled) setSubjects([]);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [selected, term, session]);

  const student = useMemo(() => roster.find((row) => row.admissionNo === selected) ?? null, [roster, selected]);
  const average = getAverage(subjects);
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
          admissionNo: selected,
          subjectName: form.get("subjectName"),
          term,
          session,
          caScore: Number(form.get("caScore")),
          examScore: Number(form.get("examScore")),
          status: form.get("status"),
          teacherComment: form.get("teacherComment") || undefined,
          principalComment: form.get("principalComment") || undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Unable to save result");
      setSaved(true);
      setMessage("Result saved. It will move through review to publishing.");
      event.currentTarget.reset();
      try {
        setSubjects(await requestStudentResults(selected, term, session));
      } catch {
        setSubjects([]);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save result.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Score entry</p>
        <h1 className="page-title">Enter scores with confidence.</h1>
        <p className="page-subtitle">Continuous assessment and exam scores, saved per subject into the review flow.</p>
      </header>

      <Alert tone={saving || loading ? "info" : saved ? "success" : "info"}>
        <p>{message}</p>
        <p><Button variant="secondary" size="sm" onClick={loadRoster} disabled={loading}>Refresh</Button></p>
      </Alert>

      {roster.length === 0 && !loading ? (
        <EmptyState
          icon={<ClipboardCheck size={22} />}
          title="No students to score"
          body="Enrol students first — the roster for entry comes straight from enrolment."
          action={<Button href="/dashboard/students">Open students</Button>}
        />
      ) : (
        <div className="premium-grid-2 align-start">
          <Card title={student?.name ?? "Student"} subtitle={student ? `${student.admissionNo} · ${student.classroom}` : "Loading…"}>
            <div className="ui-toolbar">
              <Field label="Student">
                {(id) => (
                  <Select id={id} value={selected} onChange={(event) => { setSelected(event.target.value); setSaved(false); }}>
                    {roster.map((row) => <option key={row.admissionNo} value={row.admissionNo}>{row.name} · {row.admissionNo}</option>)}
                  </Select>
                )}
              </Field>
              <Field label="Term">
                {(id) => (
                  <Select id={id} value={term} onChange={(event) => setTerm(event.target.value)}>
                    {TERMS.map((item) => <option key={item} value={item}>{item}</option>)}
                  </Select>
                )}
              </Field>
              <Field label="Session">
                {(id) => <Input id={id} value={session} onChange={(event) => setSession(event.target.value)} placeholder="2026/2027" />}
              </Field>
            </div>
            <p>
              <strong>{subjects.length ? `${average}% · ${grade.grade} (${grade.remark})` : "No scores yet"}</strong>{" "}
              <span className="ui-hint">{term} · {session}</span>
            </p>
            {subjects.length === 0 ? (
              <EmptyState icon={<FileText size={22} />} title="No scores this term" body="Saved subjects for this term and session will list here." />
            ) : (
              <Table>
                <thead><tr><th>Subject</th><th className="numeric">CA / 40</th><th className="numeric">Exam / 60</th><th className="numeric">Total</th><th>Grade</th><th>Status</th></tr></thead>
                <tbody>
                  {subjects.map((subject) => (
                    <tr key={subject.name}>
                      <td>{subject.name}</td>
                      <td className="numeric">{subject.ca}</td>
                      <td className="numeric">{subject.exam}</td>
                      <td className="numeric"><strong>{subject.total}</strong></td>
                      <td><Badge tone="neutral">{getGrade(subject.total).grade}</Badge></td>
                      <td>{subject.status}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
            {selected ? <p><Button variant="secondary" href={`/dashboard/results/report-card/${selected}`}><FileText size={18} /> Preview report</Button></p> : null}
          </Card>

          <Card title="Save a result" subtitle="One subject at a time. Totals and grades compute automatically.">
            <form className="ui-form" onSubmit={saveResult}>
              <Field label="Subject" required>{(id) => <Input id={id} name="subjectName" required placeholder="Mathematics" autoComplete="off" />}</Field>
              <Field label="CA score (0–40)" required>{(id) => <Input id={id} name="caScore" type="number" min="0" max="40" required placeholder="32" />}</Field>
              <Field label="Exam score (0–60)" required>{(id) => <Input id={id} name="examScore" type="number" min="0" max="60" required placeholder="48" />}</Field>
              <Field label="Status">
                {(id) => (
                  <Select id={id} name="status" defaultValue="DRAFT">
                    <option value="DRAFT">Draft</option>
                    <option value="REVIEW">Send to review</option>
                    <option value="APPROVED">Approved</option>
                  </Select>
                )}
              </Field>
              <Field label="Teacher comment">{(id) => <Textarea id={id} name="teacherComment" rows={2} placeholder="Optional comment for the report card" />}</Field>
              <Field label="Principal comment">{(id) => <Textarea id={id} name="principalComment" rows={2} placeholder="Optional comment for the report card" />}</Field>
              <div>
                <Button type="submit" disabled={saving || !selected}>
                  {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Save result
                </Button>
              </div>
              {saved ? <Alert tone="success"><p><CheckCircle2 size={18} aria-hidden="true" /> Saved — visible above and ready for review.</p></Alert> : null}
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
