"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Bell, CreditCard, GraduationCap, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import { money } from "@/lib/portal-data";

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
          <div className="role-metrics"><span>{data.profile?.name ?? "Parent account"}</span><span>{students.length} linked child(ren)</span><span>{money(totalBalance)} balance</span></div>
        </div>
        <div className="portal-live-card"><strong>{students.length}</strong><span>Linked children</span><small>{loading ? "Loading..." : data.status}</small></div>
      </section>

      <section className="live-status-card">
        {loading ? <Loader2 className="spin" size={18} /> : data.status === "ok" ? <ShieldCheck size={18} /> : <AlertCircle size={18} />}
        <span>{data.message ?? (data.status === "ok" ? "Parent portal data loaded." : "Portal is ready once records are linked.")}</span>
        <button type="button" onClick={load}>Refresh</button>
      </section>

      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><GraduationCap /></div><span>Children</span><strong>{students.length}</strong><small>linked profiles</small><p>Children connected to your parent account.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><ShieldCheck /></div><span>Attendance records</span><strong>{attendanceCount}</strong><small>available</small><p>Recent attendance records for linked children.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><CreditCard /></div><span>Balance</span><strong>{money(totalBalance)}</strong><small>remaining</small><p>Outstanding invoice balance for linked children.</p></article>
        <article className="premium-metric tone-violet"><div className="metric-icon"><MessageCircle /></div><span>Results</span><strong>{resultsCount}</strong><small>subject records</small><p>Academic results available to this account.</p></article>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><GraduationCap size={14} /> Children Overview</span>
          <h2>Linked students</h2>
          <div className="portal-child-list">
            {students.length === 0 ? <div className="empty-state-card">No children are linked to this account yet. Ask the school to link your parent email to the student record.</div> : null}
            {students.map((child) => <article key={String(child.student_id)}><div className="student-avatar mini">{studentName(child).slice(0,2).toUpperCase()}</div><div><strong>{studentName(child)}</strong><span>{String(child.admission_no ?? "")} • {String(child.classroom ?? "No class assigned")}</span><p>Risk level: {String(child.risk_level ?? "Not set")}</p></div></article>)}
          </div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker"><CreditCard size={14} /> Fees</span>
          <h2>Invoices and balances</h2>
          <div className="portal-invoice-list">
            {invoices.length === 0 ? <div className="empty-state-card">No invoices are available yet.</div> : null}
            {invoices.map((invoice) => <article key={String(invoice.id)}><div><strong>{String(invoice.title ?? "Invoice")}</strong><span>{String(invoice.invoice_no ?? "")} • Due {String(invoice.due_date ?? "not set")}</span></div><div><strong>{money(invoiceBalance(invoice))}</strong><span className="status warn">{String(invoice.status ?? "PENDING")}</span></div></article>)}
          </div>
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
