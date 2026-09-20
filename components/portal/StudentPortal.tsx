"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, BookOpenCheck, CalendarCheck, Download, GraduationCap, ListChecks, Loader2, Receipt, Trophy } from "lucide-react";
import { formatDate, formatNairaCompact } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Metric, MetricGrid } from "@/components/ui/Metric";
import { PortalTopbar } from "@/components/portal/PortalTopbar";

type PortalPayload = {
  status: string;
  profile?: { name?: string; email?: string; role?: string } | null;
  students?: Array<Record<string, unknown>>;
  invoices?: Array<Record<string, unknown>>;
  results?: Array<Record<string, unknown>>;
  attendance?: Array<Record<string, unknown>>;
  receipts?: Array<Record<string, unknown>>;
  message?: string;
};

function scoreAverage(results: Array<Record<string, unknown>>) {
  if (!results.length) return 0;
  return Math.round(results.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / results.length);
}

function gradeTone(grade: string): BadgeTone {
  if (grade === "A") return "success";
  if (grade === "B" || grade === "C") return "info";
  if (grade === "D") return "warning";
  if (grade === "F") return "danger";
  return "neutral";
}

function attendanceTone(status: string): BadgeTone {
  if (status === "PRESENT") return "success";
  if (status === "ABSENT") return "danger";
  if (status === "LATE") return "warning";
  return "neutral";
}

function attendanceLabel(status: string) {
  if (status === "PRESENT") return "Present";
  if (status === "ABSENT") return "Absent";
  if (status === "LATE") return "Late";
  if (status === "EXCUSED") return "Excused";
  return status;
}

export function StudentPortal() {
  const [data, setData] = useState<PortalPayload>({ status: "loading", students: [], results: [], attendance: [], invoices: [], receipts: [] });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/portal/student", { cache: "no-store" });
      const payload = await response.json() as PortalPayload;
      setData(payload);
    } catch (error) {
      setData({ status: "error", message: error instanceof Error ? error.message : "Unable to load student portal", students: [], results: [], attendance: [], invoices: [], receipts: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);

  const student = data.students?.[0];
  const results = useMemo(() => data.results ?? [], [data.results]);
  const attendance = useMemo(() => data.attendance ?? [], [data.attendance]);
  const receipts = useMemo(() => data.receipts ?? [], [data.receipts]);
  const average = useMemo(() => scoreAverage(results), [results]);
  const admissionNo = String(student?.admission_no ?? "");

  return (
    <main className="portal-shell">
      <PortalTopbar label="Student portal" homeHref="/portal/student" />
      <section className="portal-hero card-aurora">
        <div>
          <span className="ui-eyebrow ui-eyebrow-light"><GraduationCap size={14} /> Student Portal</span>
          <h1>Your learning progress in one secure place.</h1>
          <p>View your academic results, attendance activity and school updates connected to your student account.</p>
          <div className="role-metrics"><span>{String(student?.student_name ?? data.profile?.name ?? "Student account")}</span><span>{String(student?.classroom ?? "No class assigned")}</span><span>{average}% average</span></div>
        </div>
        <div className="portal-live-card"><strong>{average}%</strong><span>Academic average</span><small>{loading ? "Loading..." : data.status}</small></div>
      </section>

      <Alert tone={loading ? "info" : data.status === "ok" ? "success" : "warning"}>
        <p>{loading ? "Loading your records…" : (data.message ?? (data.status === "ok" ? "Student portal data loaded." : "Portal is ready once your student email is linked."))}</p>
        <p><Button variant="secondary" size="sm" onClick={load} disabled={loading}>{loading ? <Loader2 className="spin" size={16} /> : null} Refresh</Button></p>
      </Alert>

      <MetricGrid>
        <Metric icon={<Award size={20} />} label="Average" value={`${average}%`} caption={`${results.length} records`} />
        <Metric icon={<CalendarCheck size={20} />} label="Attendance" value={String(attendance.length)} caption="records" />
        <Metric icon={<Trophy size={20} />} label="Subjects" value={String(results.length)} caption="tracked" />
        <Metric icon={<ListChecks size={20} />} label="Linked profile" value={student ? "1" : "0"} caption={student ? String(student.classroom ?? "assigned") : "not linked"} />
      </MetricGrid>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="ui-eyebrow"><BookOpenCheck size={14} /> Subject Progress</span>
          <h2>Current performance</h2>
          {results.length === 0 ? (
            <EmptyState
              icon={<BookOpenCheck size={22} />}
              title="No results yet"
              body="Your scores will appear here once your teachers enter and publish them."
            />
          ) : (
            <div className="subject-progress-list">
              {results.map((result) => (
                <article key={String(result.id)}>
                  <div>
                    <strong>{String((result.subjects as Record<string, unknown> | null)?.name ?? "Subject")}</strong>
                    <span>{String(result.term ?? "")} • {String(result.session ?? "")}</span>
                  </div>
                  <div><strong>{Number(result.total_score ?? 0)}%</strong><Badge tone={gradeTone(String(result.grade ?? "-"))}>{String(result.grade ?? "-")}</Badge></div>
                </article>
              ))}
            </div>
          )}
          {student && results.length > 0 ? (
            <p style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Button href={`/dashboard/results/report-card/${admissionNo}`}>View Report Card</Button>
              <Button variant="secondary" href={`/api/results/${admissionNo}/pdf`}>
                <Download size={16} /> Download PDF
              </Button>
            </p>
          ) : null}
        </div>

        <div className="card premium-panel">
          <span className="ui-eyebrow"><CalendarCheck size={14} /> Attendance</span>
          <h2>Recent attendance</h2>
          {attendance.length === 0 ? (
            <EmptyState
              icon={<CalendarCheck size={22} />}
              title="No attendance yet"
              body="Attendance records will appear after your teachers submit class registers."
            />
          ) : (
            <div className="trust-list">
              {attendance.slice(0, 6).map((item) => {
                const status = String(item.status);
                return (
                  <article key={String(item.id)}>
                    <div>
                      <strong>{attendanceLabel(status)}</strong>
                      <p>{formatDate(String(item.attendance_date))}{item.period ? ` • ${String(item.period)}` : ""}</p>
                    </div>
                    <Badge tone={attendanceTone(status)}>{attendanceLabel(status)}</Badge>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="card premium-panel">
        <span className="ui-eyebrow"><Receipt size={14} /> Receipts</span>
        <h2>Verified payments</h2>
        {receipts.length === 0 ? (
          <EmptyState
            icon={<Receipt size={22} />}
            title="No receipts yet"
            body="Receipts for verified payments on your invoices will appear here."
          />
        ) : (
          <div className="portal-invoice-list">
            {receipts.map((receipt) => (
              <article key={String(receipt.id)}>
                <div>
                  <strong>Receipt {String(receipt.receipt_no ?? "")}</strong>
                  <span>{formatDate(String(receipt.issued_at ?? ""))} · {String(receipt.provider ?? "")}</span>
                </div>
                <div>
                  <strong>{formatNairaCompact(receipt.amount)}</strong>
                  <Button variant="secondary" size="sm" href={`/portal/receipts/${receipt.reference}?from=student`}>
                    View receipt
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
