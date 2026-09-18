"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CreditCard, GraduationCap, Loader2, MessageCircle, ShieldCheck, UsersRound, Wallet } from "lucide-react";
import { formatDate, formatNairaCompact } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Metric, MetricGrid } from "@/components/ui/Metric";

type PortalPayload = {
  status: string;
  profile?: { name?: string; email?: string; role?: string } | null;
  students?: Array<Record<string, unknown>>;
  invoices?: Array<Record<string, unknown>>;
  results?: Array<Record<string, unknown>>;
  attendance?: Array<Record<string, unknown>>;
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
  const [data, setData] = useState<PortalPayload>({ status: "loading", students: [], invoices: [], results: [], attendance: [] });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/portal/parent", { cache: "no-store" });
      const payload = await response.json() as PortalPayload;
      setData(payload);
    } catch (error) {
      setData({ status: "error", message: error instanceof Error ? error.message : "Unable to load parent portal", students: [], invoices: [], results: [], attendance: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);

  const students = useMemo(() => data.students ?? [], [data.students]);
  const invoices = useMemo(() => data.invoices ?? [], [data.invoices]);
  const totalBalance = useMemo(() => invoices.reduce((sum, invoice) => sum + invoiceBalance(invoice), 0), [invoices]);
  const attendanceCount = data.attendance?.length ?? 0;
  const resultsCount = data.results?.length ?? 0;

  return (
    <main className="portal-shell">
      <section className="portal-hero card-aurora">
        <div>
          <span className="premium-kicker"><GraduationCap size={14} /> Parent Portal</span>
          <h1>Stay connected to your child’s school life.</h1>
          <p>View linked children, invoices, attendance activity and academic updates from one secure parent workspace.</p>
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
        <Metric icon={<MessageCircle size={20} />} label="Results" value={String(resultsCount)} caption="subject records" />
      </MetricGrid>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><UsersRound size={14} /> Children Overview</span>
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
          <span className="premium-kicker"><CreditCard size={14} /> Fees</span>
          <h2>Invoices and balances</h2>
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
                return (
                  <article key={String(invoice.id)}>
                    <div>
                      <strong>{String(invoice.title ?? "Invoice")}</strong>
                      <span>{String(invoice.invoice_no ?? "")} • Due {formatDate(String(invoice.due_date ?? ""))}</span>
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
        <span className="premium-kicker"><Bell size={14} /> Academic activity</span>
        <h2>Results and attendance</h2>
        <div className="portal-activity-grid"><div><strong>{resultsCount}</strong><span>Result records</span></div><div><strong>{attendanceCount}</strong><span>Attendance records</span></div></div>
      </section>
    </main>
  );
}
