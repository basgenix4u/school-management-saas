"use client";

import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, LifeBuoy, Loader2, ServerCrash, ShieldCheck } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Metric, MetricGrid } from "@/components/ui/Metric";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type Ticket = { id: string; requester_email?: string; category: string; priority: string; subject: string; description: string; status: string; created_at: string };
type ErrorEvent = { id: string; severity: string; message: string; path?: string; resolved: boolean; created_at: string };

type TicketPayload = { status: string; tickets?: Ticket[]; summary?: Record<string, number | string | null> | null; message?: string };
type ErrorPayload = { status: string; errors?: ErrorEvent[]; message?: string };

function priorityTone(priority: string): BadgeTone {
  if (priority === "urgent") return "danger";
  if (priority === "high") return "warning";
  return "neutral";
}

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
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Support operations</p>
        <h1 className="page-title">Tickets and error events.</h1>
        <p className="page-subtitle">Keep issues visible before they affect school trust.</p>
      </header>

      <Alert tone={loading || saving ? "info" : "success"}>
        <p>{message}</p>
        <p><Button variant="secondary" size="sm" onClick={load} disabled={loading}>Refresh</Button></p>
      </Alert>

      <MetricGrid>
        <Metric icon={<LifeBuoy size={20} />} label="Tickets" value={String(summary?.ticket_count ?? tickets.length)} caption="total raised" />
        <Metric icon={<AlertTriangle size={20} />} label="Priority" value={String(summary?.priority_tickets ?? tickets.filter((ticket) => ticket.priority === "high" || ticket.priority === "urgent").length)} caption="high and urgent" />
        <Metric icon={<ServerCrash size={20} />} label="Errors" value={String(summary?.unresolved_errors ?? errors.filter((error) => !error.resolved).length)} caption="unresolved" />
        <Metric icon={<ShieldCheck size={20} />} label="Open tickets" value={String(summary?.open_tickets ?? tickets.filter((ticket) => ticket.status === "open").length)} caption="awaiting action" />
      </MetricGrid>

      <div className="premium-grid-2 align-start">
        <Card title="Create ticket" subtitle="Describe the issue; it lands in the queue below.">
          <form className="ui-form" onSubmit={createTicket}>
            <Field label="Category">
              {(id) => (
                <Select id={id} name="category" defaultValue="general">
                  <option value="general">General</option>
                  <option value="billing">Billing</option>
                  <option value="login">Login</option>
                  <option value="data">Data</option>
                  <option value="bug">Bug</option>
                  <option value="feature">Feature request</option>
                </Select>
              )}
            </Field>
            <Field label="Priority">
              {(id) => (
                <Select id={id} name="priority" defaultValue="normal">
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </Select>
              )}
            </Field>
            <Field label="Subject" required>{(id) => <Input id={id} name="subject" required placeholder="Short summary" autoComplete="off" />}</Field>
            <Field label="Description" required>{(id) => <Textarea id={id} name="description" required rows={3} placeholder="Describe the issue or request" />}</Field>
            <div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="spin" size={18} /> : <LifeBuoy size={18} />} Create ticket
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Support queue" subtitle={tickets.length ? "Latest 8 tickets." : "Tickets land here when raised."}>
          {tickets.length === 0 ? (
            <EmptyState icon={<LifeBuoy size={22} />} title="No tickets" body="Raise the first one with the form." />
          ) : (
            <div className="trust-list">
              {tickets.slice(0, 8).map((ticket) => (
                <article key={ticket.id}>
                  <div><strong>{ticket.subject}</strong><p>{ticket.category} · {ticket.requester_email ?? "unknown"} · {formatDateTime(ticket.created_at)}</p></div>
                  <Badge tone={priorityTone(ticket.priority)}>{ticket.priority}</Badge>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Recent error events" subtitle={errors.length ? "Latest 10 events." : "A clean record so far."}>
        {errors.length === 0 ? (
          <EmptyState icon={<ServerCrash size={22} />} title="No errors recorded" body="Application errors reported by monitoring will appear here." />
        ) : (
          <div className="trust-list">
            {errors.slice(0, 10).map((error) => (
              <article key={error.id}>
                <div><strong>{error.message}</strong><p>{error.path ?? "No path"} · {formatDateTime(error.created_at)}</p></div>
                <Badge tone={error.resolved ? "success" : "danger"}>{error.resolved ? "Resolved" : error.severity}</Badge>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
