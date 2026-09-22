"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Award, BookOpenCheck, ClipboardCheck, FileText, Send, ShieldCheck } from "lucide-react";
import { getGrade } from "@/lib/results/grading";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Metric, MetricGrid } from "@/components/ui/Metric";
import { Table } from "@/components/ui/Table";

type ResultApiRow = Record<string, unknown>;
type ResultBoardStudent = {
  id: string;
  name: string;
  average: number;
  status: string;
  subjectCount: number;
};

type ResultsApiResponse = {
  status: string;
  source?: "none" | "supabase";
  summary?: { records: number; average: number; draft: number; review: number; approved: number; published: number };
  data?: ResultApiRow[];
  page?: { total: number; offset: number; hasMore: boolean };
  message?: string;
};

const emptyTotals = { records: 0, average: 0, draft: 0, review: 0, approved: 0, published: 0 };

function statusTone(status: string): BadgeTone {
  if (status === "APPROVED" || status === "PUBLISHED") return "success";
  if (status === "REVIEW") return "warning";
  if (status === "DRAFT") return "neutral";
  return "info";
}

function groupLiveResults(rows: ResultApiRow[]): { students: ResultBoardStudent[]; subjects: Array<{ name: string; average: number; count: number }> } {
  const grouped = new Map<string, { id: string; name: string; totals: number[]; statuses: string[]; subjectCount: number }>();
  const subjectTotals = new Map<string, { total: number; count: number }>();
  for (const row of rows) {
    const student = row.students as Record<string, unknown> | null;
    const subject = row.subjects as Record<string, unknown> | null;
    const id = String(student?.admission_no ?? row.student_id ?? "unknown");
    const name = `${student?.first_name ?? ""} ${student?.last_name ?? ""}`.trim() || id;
    const current = grouped.get(id) ?? { id, name, totals: [], statuses: [], subjectCount: 0 };
    current.totals.push(Number(row.total_score ?? 0));
    current.statuses.push(String(row.status ?? "DRAFT"));
    current.subjectCount += 1;
    grouped.set(id, current);

    const subjectName = String(subject?.name ?? "Unassigned");
    const entry = subjectTotals.get(subjectName) ?? { total: 0, count: 0 };
    entry.total += Number(row.total_score ?? 0);
    entry.count += 1;
    subjectTotals.set(subjectName, entry);
  }
  const students = Array.from(grouped.values()).map((item) => {
    const average = item.totals.length ? Math.round(item.totals.reduce((sum, value) => sum + value, 0) / item.totals.length) : 0;
    const status = item.statuses.includes("DRAFT") ? "DRAFT" : item.statuses.includes("REVIEW") ? "REVIEW" : item.statuses.includes("APPROVED") ? "APPROVED" : item.statuses[0] ?? "DRAFT";
    return { id: item.id, name: item.name, average, status, subjectCount: item.subjectCount };
  });
  const subjects = Array.from(subjectTotals.entries())
    .map(([name, entry]) => ({ name, average: entry.count ? Math.round(entry.total / entry.count) : 0, count: entry.count }))
    .sort((a, b) => a.average - b.average);
  return { students, subjects };
}

export function ResultsCommandCenter() {
  const [rows, setRows] = useState<ResultApiRow[]>([]);
  const [totals, setTotals] = useState(emptyTotals);
  const [pageInfo, setPageInfo] = useState<{ total: number; offset: number; hasMore: boolean }>({ total: 0, offset: 0, hasMore: false });
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [message, setMessage] = useState("Loading academic records...");

  async function loadResults(offset = 0, append = false) {
    if (append) setLoadingMore(true);
    else setLoading(true);
    if (!append) setMessage("Loading academic records...");
    try {
      const response = await fetch(`/api/results?offset=${offset}`, { cache: "no-store" });
      const payload = await response.json() as ResultsApiResponse;
      if (!response.ok) throw new Error(payload.message ?? "Unable to load results");
      setConnected(payload.source === "supabase");
      const incoming = payload.source === "supabase" ? (payload.data ?? []) : [];
      setRows((current) => (append ? [...current, ...incoming] : incoming));
      setTotals(payload.summary ?? emptyTotals);
      setPageInfo({ total: payload.page?.total ?? incoming.length, offset, hasMore: payload.page?.hasMore ?? false });
      setMessage(payload.source === "supabase" ? "Result records loaded." : (payload.message ?? "Connect your database to load results."));
    } catch (error) {
      setConnected(false);
      setMessage(error instanceof Error ? error.message : "Results unavailable.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadResults(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Workspace metrics come from the API summary so they stay exact; the
  // board groups whichever rows are loaded and converges via Load more.
  const summary = totals;
  const { students, subjects } = useMemo(() => groupLiveResults(rows), [rows]);

  const insights = useMemo(() => {
    const items: Array<{ title: string; detail: string; action: string; tone: BadgeTone }> = [];
    const struggling = students.filter((student) => student.average < 50);
    if (struggling.length > 0) {
      items.push({
        title: `${struggling.length} student${struggling.length === 1 ? "" : "s"} averaging below 50%`,
        detail: `${struggling[0].name}${struggling.length > 1 ? ` and ${struggling.length - 1} more` : ""} need academic support before results go out.`,
        action: "Schedule intervention with the class teacher",
        tone: "danger",
      });
    }
    if (summary.review > 0) {
      items.push({
        title: `${summary.review} record${summary.review === 1 ? "" : "s"} waiting in review`,
        detail: "Scores are entered but not yet approved for release.",
        action: "Clear the principal review queue",
        tone: "warning",
      });
    }
    if (summary.draft > 0) {
      items.push({
        title: `${summary.draft} draft record${summary.draft === 1 ? "" : "s"} unfinished`,
        detail: "Teachers still have scores to enter or complete.",
        action: "Follow up on score entry",
        tone: "neutral",
      });
    }
    if (summary.published > 0) {
      items.push({
        title: `${summary.published} record${summary.published === 1 ? "" : "s"} published`,
        detail: "Locked and visible to guardians on the portal.",
        action: "No action needed",
        tone: "success",
      });
    }
    return items;
  }, [students, summary]);

  const pipeline = [
    { title: "Teacher entry", count: summary.draft, caption: "drafts with teachers" },
    { title: "Review", count: summary.review, caption: "awaiting approval" },
    { title: "Approved", count: summary.approved, caption: "cleared for release" },
    { title: "Published", count: summary.published, caption: "live to guardians" },
  ];

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Results</p>
        <h1 className="page-title">From score entry to report cards.</h1>
        <p className="page-subtitle">Entry, review, approval and publishing — with every student&apos;s position visible.</p>
      </header>

      <div className="action-row">
        <Button href="/dashboard/results/entry"><ClipboardCheck size={18} /> Enter scores</Button>
        {students.length > 0 ? <Button variant="secondary" href={`/dashboard/results/report-card/${students[0].id}`}><FileText size={18} /> Preview report card</Button> : null}
        <Button variant="secondary" href="/dashboard/results/publish"><Send size={18} /> Publish results</Button>
      </div>

      <Alert tone={loading ? "info" : connected ? "success" : "warning"}>
        <p>{message}</p>
        <p><Button variant="secondary" size="sm" onClick={() => loadResults()} disabled={loading}>Refresh</Button></p>
      </Alert>

      <MetricGrid>
        <Metric icon={<BookOpenCheck size={20} />} label="Result records" value={String(summary.records)} caption={`school average ${summary.average}%`} />
        <Metric icon={<ShieldCheck size={20} />} label="Approved" value={String(summary.approved)} caption="ready for release" />
        <Metric icon={<ClipboardCheck size={20} />} label="In review" value={String(summary.review)} caption="principal queue" />
        <Metric icon={<Send size={20} />} label="Drafts" value={String(summary.draft)} caption="with teachers" />
      </MetricGrid>

      <Card title="Student result board" subtitle={students.length ? `${rows.length} of ${pageInfo.total} records loaded · select a row for the full report card.` : "Scores will appear here once teachers begin entry."}>
        {students.length === 0 ? (
          <EmptyState
            icon={<Award size={22} />}
            title="No results yet"
            body="Enter the first score to begin the review and publishing flow."
            action={<Button href="/dashboard/results/entry"><ClipboardCheck size={18} /> Enter scores</Button>}
          />
        ) : (
          <Table>
            <thead><tr><th>Student</th><th>Admission no.</th><th className="numeric">Subjects</th><th className="numeric">Average</th><th>Grade</th><th>Status</th></tr></thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td><a href={`/dashboard/results/report-card/${student.id}`}>{student.name}</a></td>
                  <td>{student.id}</td>
                  <td className="numeric">{student.subjectCount}</td>
                  <td className="numeric">{student.average}%</td>
                  <td>{getGrade(student.average).grade}</td>
                  <td><Badge tone={statusTone(student.status)}>{student.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        {pageInfo.hasMore ? (
          <p>
            <Button variant="secondary" onClick={() => loadResults(rows.length, true)} disabled={loadingMore}>
              {loadingMore ? "Loading…" : `Load more (${pageInfo.total - rows.length} remaining)`}
            </Button>
          </p>
        ) : null}
      </Card>

      <div className="premium-grid-2 align-start">
        <Card title="Publishing pipeline" subtitle="Where every record sits right now.">
          <div className="trust-list">
            {pipeline.map((step) => (
              <article key={step.title}>
                <div><strong>{step.title}</strong><p>{step.caption}</p></div>
                <Badge tone={step.count > 0 ? "info" : "neutral"}>{step.count}</Badge>
              </article>
            ))}
          </div>
        </Card>

        <Card title="Result insights" subtitle={insights.length ? "Drawn from the records above." : "Insights arrive with the first scores."}>
          {insights.length === 0 ? (
            <EmptyState icon={<Award size={22} />} title="Nothing to flag" body="Averages, review queues and publishing land here." />
          ) : (
            <div className="signal-list">
              {insights.map((insight) => (
                <article key={insight.title} className="signal-item">
                  <div><strong>{insight.title}</strong><p>{insight.detail}</p><small>{insight.action}</small></div>
                  <Badge tone={insight.tone}>{insight.tone === "danger" ? "Urgent" : insight.tone === "warning" ? "Watch" : insight.tone === "success" ? "Good" : "Info"}</Badge>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Average by subject" subtitle={subjects.length ? "Weakest subjects first." : "Subject averages arrive with the first scores."}>
        {subjects.length === 0 ? (
          <EmptyState icon={<BookOpenCheck size={22} />} title="No subject data" body="Enter scores to see how each subject performs." />
        ) : (
          <Table>
            <thead><tr><th>Subject</th><th className="numeric">Records</th><th className="numeric">Average</th><th>Grade</th></tr></thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.name}>
                  <td>{subject.name}</td>
                  <td className="numeric">{subject.count}</td>
                  <td className="numeric">{subject.average}%</td>
                  <td>{getGrade(subject.average).grade}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {students.some((student) => student.average < 50) ? (
        <Alert tone="danger"><p><AlertTriangle size={18} aria-hidden="true" /> Some students average below 50% — review the insights above before publishing.</p></Alert>
      ) : null}
    </div>
  );
}
