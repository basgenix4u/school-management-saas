"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Bell, CreditCard, Download, FileText, GraduationCap, Loader2, Receipt, ShieldCheck, UsersRound, Wallet } from "lucide-react";
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

function studentName(row: Record<string, unknown>) { return String(row.student_name ?? row.admission_no ?? "Student"); }
function invoiceBalance(row: Record<string, unknown>) { return Number(row.amount ?? 0) - Number(row.amount_paid ?? 0); }

function invoiceTone(status: string): BadgeTone {
  if (status === "PAID") return "success";
  if (status === "OVERDUE") return "danger";
  if (status === "PARTIAL") return "info";
  return "warning";
}

function invoiceLabel(status: string) {
  if (status === "PAID") return "Paid";
  if (status === "OVERDUE") return "Overdue";
  if (status === "PARTIAL") return "Part paid";
  return "Pending";
}

export function ParentPortal() {
  const [data, setData] = useState<PortalPayload>({ status: "loading", students: [], invoices: [], results: [], attendance: [], receipts: [] });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/portal/parent", { cache: "no-store" });
      const payload = await response.json() as PortalPayload;
      setData(payload);
    } catch (error) {
      setData({ status: "error", message: error instanceof Error ? error.message : "Unable to load parent portal", students: [], invoices: [], results: [], attendance: [], receipts: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);

  const students = useMemo(() => data.students ?? [], [data.students]);
  const invoices = useMemo(() => data.invoices ?? [], [data.invoices]);
  const results = useMemo(() => data.results ?? [], [data.results]);
  const receipts = useMemo(() => data.receipts ?? [], [data.receipts]);
  const totalBalance = useMemo(() => invoices.reduce((sum, invoice) => sum + invoiceBalance(invoice), 0), [invoices]);
  const attendanceCount = data.attendance?.length ?? 0;

  const receiptsByInvoice = useMemo(() => {
    const map = new Map<string, Array<Record<string, unknown>>>();
    for (const receipt of receipts) {
      const key = String(receipt.invoice_id ?? "");
      if (!key) continue;
      const list = map.get(key) ?? [];
      list.push(receipt);
      map.set(key, list);
    }
    return map;
  }, [receipts]);

  const resultsByStudent = useMemo(() => {
    const map = new Map<string, { count: number; average: number; latest: string }>();
    const groups = new Map<string, Array<Record<string, unknown>>>();
    for (const row of results) {
      const key = String(row.student_id ?? "");
      if (!key) continue;
      const list = groups.get(key) ?? [];
      list.push(row);
      groups.set(key, list);
    }
    for (const [key, rows] of groups) {
      const average = Math.round(rows.reduce((sum, row) => sum + Number(row.total_score ?? 0), 0) / rows.length);
      const first = rows[0];
      map.set(key, { count: rows.length, average, latest: `${String(first.term ?? "")} · ${String(first.session ?? "")}`.trim() });
    }
    return map;
  }, [results]);

  return (
    <main className="portal-shell">
      <PortalTopbar label="Parent portal" homeHref="/portal/parent" />
      <a className="skip-link" href="#portal-content">Skip to content</a>
      <section className="portal-hero card-aurora" id="portal-content" tabIndex={-1}>
        <div>
          <span className="ui-eyebrow ui-eyebrow-light"><GraduationCap size={14} /> Parent Portal</span>
          <h1>Stay connected to your child’s school life.</h1>
          <p>View linked children, invoices, receipts, attendance activity and report cards from one secure parent workspace.</p>
          <div className="role-metrics"><span>{data.profile?.name ?? "Parent account"}</span><span>{students.length} linked child(ren)</span><span>{formatNairaCompact(totalBalance)} balance</span></div>
        </div>
        <div className="portal-live-card"><strong>{students.length}</strong><span>Linked children</span><small>{loading ? "Loading..." : data.status}</small></div>
      </section>

      <Alert tone={loading ? "info" : data.status === "ok" ? "success" : "warning"}>
        <p>{loading ? "Loading your children's records…" : (data.message ?? (data.status === "ok" ? "Parent portal data loaded." : "Portal is ready once records are linked."))}</p>
        <p><Button variant="secondary" size="sm" onClick={load} disabled={loading}>{loading ? <Loader2 className="spin" size={16} /> : null} Refresh</Button></p>
      </Alert>

      <MetricGrid>
        <Metric icon={<GraduationCap size={20} />} label="Children" value={String(students.length)} caption="linked profiles" />
        <Metric icon={<ShieldCheck size={20} />} label="Attendance records" value={String(attendanceCount)} caption="available" />
        <Metric icon={<Wallet size={20} />} label="Balance" value={formatNairaCompact(totalBalance)} caption="outstanding" />
        <Metric icon={<Receipt size={20} />} label="Receipts" value={String(receipts.length)} caption="verified payments" />
      </MetricGrid>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="ui-eyebrow"><UsersRound size={14} /> Children Overview</span>
          <h2>Linked students</h2>
          {students.length === 0 ? (
            <EmptyState
              icon={<UsersRound size={22} />}
              title="No children linked yet"
              body="Ask the school to link your parent email to each child's student record."
            />
          ) : (
            <div className="portal-child-list">
              {students.map((child) => (
                <article key={String(child.student_id)}>
                  <div className="student-avatar mini">{studentName(child).slice(0, 2).toUpperCase()}</div>
                  <div>
                    <strong>{studentName(child)}</strong>
                    <span>{String(child.admission_no ?? "")} • {String(child.classroom ?? "No class assigned")}</span>
                    <p>Risk level: {String(child.risk_level ?? "Not set")}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="card premium-panel">
          <span className="ui-eyebrow"><CreditCard size={14} /> Fees</span>
          <h2>Invoices and receipts</h2>
          {invoices.length === 0 ? (
            <EmptyState
              icon={<CreditCard size={22} />}
              title="No invoices yet"
              body="Invoices raised for your children will appear here with their due dates."
            />
          ) : (
            <div className="portal-invoice-list">
              {invoices.map((invoice) => {
                const status = String(invoice.status ?? "PENDING");
                const invoiceReceipts = receiptsByInvoice.get(String(invoice.id ?? "")) ?? [];
                return (
                  <article key={String(invoice.id)}>
                    <div>
                      <strong>{String(invoice.title ?? "Invoice")}</strong>
                      <span>{String(invoice.invoice_no ?? "")} • Due {formatDate(String(invoice.due_date ?? ""))}</span>
                      {invoiceReceipts.map((receipt) => (
                        <p key={String(receipt.id)}>
                          <Button variant="ghost" size="sm" href={`/portal/receipts/${receipt.reference}?from=parent`}>
                            <Receipt size={16} /> Receipt {String(receipt.receipt_no ?? "")} · {formatNairaCompact(receipt.amount)}
                          </Button>
                        </p>
                      ))}
                    </div>
                    <div><strong>{formatNairaCompact(invoiceBalance(invoice))}</strong><Badge tone={invoiceTone(status)}>{invoiceLabel(status)}</Badge></div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="card premium-panel">
        <span className="ui-eyebrow"><Award size={14} /> Report cards</span>
        <h2>Results by child</h2>
        {students.length === 0 ? (
          <EmptyState
            icon={<Award size={22} />}
            title="No children linked"
            body="Report cards appear here once your children are linked and results are published."
          />
        ) : (
          <div className="portal-child-list">
            {students.map((child) => {
              const summary = resultsByStudent.get(String(child.student_id ?? ""));
              const admissionNo = String(child.admission_no ?? "");
              return (
                <article key={String(child.student_id)}>
                  <div className="student-avatar mini">{studentName(child).slice(0, 2).toUpperCase()}</div>
                  <div>
                    <strong>{studentName(child)}</strong>
                    <span>
                      {summary ? `${summary.count} subject records · ${summary.average}% average · ${summary.latest}` : "No results published yet"}
                    </span>
                    {summary ? (
                      <p style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <Button variant="secondary" size="sm" href={`/dashboard/results/report-card/${admissionNo}`}>
                          <FileText size={16} /> View report
                        </Button>
                        <Button variant="secondary" size="sm" href={`/api/results/${admissionNo}/pdf`}>
                          <Download size={16} /> Download PDF
                        </Button>
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="card premium-panel">
        <span className="ui-eyebrow"><Bell size={14} /> Academic activity</span>
        <h2>Results and attendance</h2>
        <div className="portal-activity-grid"><div><strong>{results.length}</strong><span>Result records</span></div><div><strong>{attendanceCount}</strong><span>Attendance records</span></div></div>
      </section>
    </main>
  );
}
