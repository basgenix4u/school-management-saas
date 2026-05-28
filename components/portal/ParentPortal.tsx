import Link from "next/link";
import { ArrowRight, Bell, CreditCard, GraduationCap, MessageCircle, ShieldCheck, UsersRound } from "lucide-react";
import { money, parentAnnouncements, parentInvoices, parentMessages, parentProfile } from "@/lib/portal-data";

function statusClass(status: string) {
  if (status === "Paid") return "good";
  if (status === "Partial") return "warn";
  return "bad";
}

export function ParentPortal() {
  const totalBalance = parentInvoices.reduce((sum, invoice) => sum + (invoice.amount - invoice.paid), 0);
  const avgAttendance = Math.round(parentProfile.children.reduce((sum, child) => sum + child.attendance, 0) / parentProfile.children.length);
  const avgPerformance = Math.round(parentProfile.children.reduce((sum, child) => sum + child.average, 0) / parentProfile.children.length);

  return (
    <main className="portal-shell">
      <section className="portal-hero card-aurora">
        <div>
          <span className="premium-kicker"><UsersRound size={14} /> Parent Portal</span>
          <h1>Everything a parent needs, in one calm mobile-first portal.</h1>
          <p>Fees, report cards, attendance, announcements and school messages are presented clearly for busy parents and guardians.</p>
          <div className="role-metrics"><span>{parentProfile.name}</span><span>{parentProfile.children.length} children</span><span>{money(totalBalance)} balance</span></div>
        </div>
        <div className="portal-live-card"><strong>{avgPerformance}%</strong><span>Average child performance</span><small>{avgAttendance}% average attendance</small></div>
      </section>

      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><GraduationCap /></div><span>Children</span><strong>{parentProfile.children.length}</strong><small>linked profiles</small><p>All child records under one guardian account.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><ShieldCheck /></div><span>Attendance</span><strong>{avgAttendance}%</strong><small>healthy</small><p>Average attendance across linked children.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><CreditCard /></div><span>Balance</span><strong>{money(totalBalance)}</strong><small>remaining</small><p>Outstanding fee balance requiring payment follow-up.</p></article>
        <article className="premium-metric tone-violet"><div className="metric-icon"><MessageCircle /></div><span>Messages</span><strong>{parentMessages.length}</strong><small>updates</small><p>Recent school communication and notifications.</p></article>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><GraduationCap size={14} /> Children Overview</span>
          <h2>Linked students</h2>
          <div className="portal-child-list">
            {parentProfile.children.map((child) => (
              <article key={child.id}>
                <div className="student-avatar mini">{child.avatar}</div>
                <div><strong>{child.name}</strong><span>{child.id} • {child.className}</span><p>{child.latestResult} • Next: {child.nextClass}</p></div>
                <Link className="mini-link" href={`/dashboard/students/${child.slug}`}>View <ArrowRight size={14} /></Link>
              </article>
            ))}
          </div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker"><CreditCard size={14} /> Fees</span>
          <h2>Invoices and balances</h2>
          <div className="portal-invoice-list">
            {parentInvoices.map((invoice) => (
              <article key={invoice.id}>
                <div><strong>{invoice.title}</strong><span>{invoice.child} • Due {invoice.due}</span></div>
                <div><strong>{money(invoice.amount - invoice.paid)}</strong><span className={`status ${statusClass(invoice.status)}`}>{invoice.status}</span></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><Bell size={14} /> Messages</span>
          <h2>School communication</h2>
          <div className="signal-list">{parentMessages.map((message) => <article className="signal-item" key={message.id}><div><strong>{message.title}</strong><p>{message.body}</p><small>{message.from} • {message.time}</small></div></article>)}</div>
        </div>
        <div className="card premium-panel">
          <span className="premium-kicker">Announcements</span>
          <h2>Important updates</h2>
          <div className="trust-list">{parentAnnouncements.map((item) => <article key={item.title}><div><strong>{item.title}</strong><p>{item.body}</p></div><span>{item.tag}</span></article>)}</div>
        </div>
      </section>
    </main>
  );
}
