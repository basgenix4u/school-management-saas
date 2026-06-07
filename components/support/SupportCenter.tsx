"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, LifeBuoy, Loader2, ServerCrash, ShieldCheck } from "lucide-react";

type Ticket = { id: string; requester_email?: string; category: string; priority: string; subject: string; description: string; status: string; created_at: string };
type ErrorEvent = { id: string; severity: string; message: string; path?: string; resolved: boolean; created_at: string };

type TicketPayload = { status: string; tickets?: Ticket[]; summary?: Record<string, number | string | null> | null; message?: string };
type ErrorPayload = { status: string; errors?: ErrorEvent[]; message?: string };

export function SupportCenter() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [errors, setErrors] = useState<ErrorEvent[]>([]);
  const [summary, setSummary] = useState<Record<string, number | string | null> | null>(null);
  const [message, setMessage] = useState("Support operations help your team respond to issues quickly.");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [ticketsRes, errorsRes] = await Promise.all([
        fetch("/api/support/tickets", { cache: "no-store" }),
        fetch("/api/monitoring/errors", { cache: "no-store" }),
      ]);
      const ticketsPayload = await ticketsRes.json() as TicketPayload;
      const errorsPayload = await errorsRes.json() as ErrorPayload;
      if (ticketsRes.ok) {
        setTickets(ticketsPayload.tickets ?? []);
        setSummary(ticketsPayload.summary ?? null);
      }
      if (errorsRes.ok) setErrors(errorsPayload.errors ?? []);
      setMessage(ticketsPayload.message ?? "Support center ready.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load support center.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);

  async function createTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: form.get("category"), priority: form.get("priority"), subject: form.get("subject"), description: form.get("description"), path: window.location.pathname }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Unable to create ticket");
      setMessage("Support ticket created.");
      event.currentTarget.reset();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create support ticket.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="premium-dashboard">
      <section className="card-aurora setup-hero">
        <div>
          <span className="premium-kicker"><LifeBuoy size={14} /> Support Operations</span>
          <h1>Track support requests and product issues.</h1>
          <p>Capture support tickets, monitor application errors and keep operational issues visible before they affect school trust.</p>
        </div>
        <div className="setup-score-card"><strong>{summary?.open_tickets ?? tickets.length}</strong><span>Open tickets</span><small>{errors.length} recent error event(s)</small></div>
      </section>

      <section className="live-status-card">
        {loading || saving ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
        <span>{message}</span>
        <button type="button" onClick={load}>Refresh</button>
      </section>

      <section className="premium-metrics">
        <article className="premium-metric tone-blue"><div className="metric-icon"><LifeBuoy /></div><span>Tickets</span><strong>{summary?.ticket_count ?? tickets.length}</strong><small>total</small><p>Support tickets raised by users or internal teams.</p></article>
        <article className="premium-metric tone-amber"><div className="metric-icon"><AlertTriangle /></div><span>Priority</span><strong>{summary?.priority_tickets ?? 0}</strong><small>high/urgent</small><p>Tickets needing fast attention.</p></article>
        <article className="premium-metric tone-rose"><div className="metric-icon"><ServerCrash /></div><span>Errors</span><strong>{summary?.unresolved_errors ?? errors.length}</strong><small>unresolved</small><p>Application errors captured by monitoring APIs.</p></article>
        <article className="premium-metric tone-emerald"><div className="metric-icon"><ShieldCheck /></div><span>Status</span><strong>Live</strong><small>ops-ready</small><p>Support workflow is enabled for production operations.</p></article>
      </section>

      <section className="premium-grid-2 align-start">
        <form className="card premium-panel setup-form" onSubmit={createTicket}>
          <span className="premium-kicker">New support ticket</span>
          <h2>Create ticket</h2>
          <div className="live-form-grid">
            <label><span>Category</span><select name="category" defaultValue="general"><option>general</option><option>billing</option><option>login</option><option>data</option><option>bug</option><option>feature</option></select></label>
            <label><span>Priority</span><select name="priority" defaultValue="normal"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select></label>
            <label className="full"><span>Subject</span><input name="subject" required placeholder="Short summary" /></label>
            <label className="full"><span>Description</span><textarea name="description" required placeholder="Describe the issue or request" /></label>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <Loader2 className="spin" size={18} /> : <LifeBuoy size={18} />} Create ticket</button>
          </div>
        </form>

        <section className="card premium-panel">
          <span className="premium-kicker">Recent tickets</span>
          <h2>Support queue</h2>
          <div className="trust-list">{tickets.length === 0 ? <article><div><strong>No tickets yet</strong><p>Support tickets will appear here when users report issues.</p></div><span>Empty</span></article> : tickets.slice(0, 8).map((ticket) => <article key={ticket.id}><div><strong>{ticket.subject}</strong><p>{ticket.category} • {ticket.requester_email ?? "unknown"}</p></div><span>{ticket.priority}</span></article>)}</div>
        </section>
      </section>

      <section className="card premium-panel">
        <span className="premium-kicker">Application monitoring</span>
        <h2>Recent error events</h2>
        <div className="trust-list">{errors.length === 0 ? <article><div><strong>No errors recorded</strong><p>Application errors will appear here when reported by server or client monitoring APIs.</p></div><span>Healthy</span></article> : errors.slice(0, 10).map((error) => <article key={error.id}><div><strong>{error.message}</strong><p>{error.path ?? "No path"} • {new Date(error.created_at).toLocaleString()}</p></div><span>{error.severity}</span></article>)}</div>
      </section>
    </div>
  );
}
