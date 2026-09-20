"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Mail, Megaphone, MessageCircle, Send, Smartphone, UsersRound } from "lucide-react";
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

type Announcement = { id: string; title: string; body: string; audience: string; published_at: string | null; created_at: string };
type Delivery = { id: string; recipient_email: string; subject: string; status: string; provider?: string; created_at: string; error_message?: string };
type Payload = { status: string; announcements?: Announcement[]; deliveries?: Delivery[]; summary?: Record<string, number | string | null> | null; message?: string; announcement?: Announcement };

const templates = [
  { title: "Fee Balance Reminder", body: "Dear Parent/Guardian, this is a friendly reminder that your child has an outstanding school fee balance. Kindly complete payment before the due date. Thank you." },
  { title: "Attendance Concern", body: "Dear Parent/Guardian, we noticed repeated absences or late arrivals for your child. Kindly contact the school so we can support improvement." },
  { title: "Result Published", body: "Dear Parent/Guardian, your child's report card is now available on the parent portal. Please log in to review academic progress." },
  { title: "Open Day Invitation", body: "Dear Parent/Guardian, you are invited to our Open Day session. We look forward to discussing your child's academic progress." },
];

function deliveryTone(status: string): BadgeTone {
  if (status === "sent") return "success";
  if (status === "failed") return "danger";
  return "warning";
}

export function CommunicationCenter() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [message, setMessage] = useState("Create announcements and send emails to your school community.");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/communications", { cache: "no-store" });
      const payload = await response.json() as Payload;
      if (!response.ok) throw new Error(payload.message ?? "Unable to load communications");
      setAnnouncements(payload.announcements ?? []);
      setDeliveries(payload.deliveries ?? []);
      setMessage(payload.message ?? "Communication center ready.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load communications.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { const timer = window.setTimeout(() => { void load(); }, 0); return () => window.clearTimeout(timer); }, []);

  async function createAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const response = await fetch("/api/communications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.get("title"), body: form.get("body"), audience: form.get("audience"), publish: form.get("publish") === "on" }) });
      const payload = await response.json() as Payload;
      if (!response.ok) throw new Error(payload.message ?? "Unable to create announcement");
      setMessage("Announcement created.");
      event.currentTarget.reset();
      if (payload.announcement) setSelectedAnnouncement(payload.announcement.id);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create announcement.");
    } finally {
      setSaving(false);
    }
  }

  async function sendEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const response = await fetch("/api/communications/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ announcementId: selectedAnnouncement || undefined, subject: form.get("subject"), body: form.get("body"), recipients: form.get("recipients") }) });
      const payload = await response.json() as Payload & { recipients?: number };
      if (!response.ok) throw new Error(payload.message ?? "Unable to send email");
      setMessage(`Email sent to ${payload.recipients ?? 0} recipient(s).`);
      event.currentTarget.reset();
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send email.");
    } finally {
      setSaving(false);
    }
  }

  const sent = deliveries.filter((item) => item.status === "sent").length;
  const failed = deliveries.filter((item) => item.status === "failed").length;

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Communications</p>
        <h1 className="page-title">Send clear updates to the right people.</h1>
        <p className="page-subtitle">Announcements for the community, email for direct follow-up — every delivery tracked.</p>
      </header>

      <Alert tone={loading || saving ? "info" : "success"}>
        <p>{message}</p>
        <p><Button variant="secondary" size="sm" onClick={load} disabled={loading}>Refresh</Button></p>
      </Alert>

      <MetricGrid>
        <Metric icon={<Mail size={20} />} label="Announcements" value={String(announcements.length)} caption="created" />
        <Metric icon={<MessageCircle size={20} />} label="Deliveries" value={String(deliveries.length)} caption="total attempts" />
        <Metric icon={<CheckCircle2 size={20} />} label="Sent" value={String(sent)} caption="successful" />
        <Metric icon={<UsersRound size={20} />} label="Failed" value={String(failed)} caption="needs review" />
      </MetricGrid>

      <div className="premium-grid-2 align-start">
        <Card title="Create announcement" subtitle="Published announcements go to the whole audience at once.">
          <form id="announcement-form" className="ui-form" onSubmit={createAnnouncement}>
            <Field label="Title" required>{(id) => <Input id={id} name="title" required placeholder="School update title" autoComplete="off" />}</Field>
            <Field label="Audience">
              {(id) => (
                <Select id={id} name="audience" defaultValue="ALL">
                  <option value="ALL">Everyone</option>
                  <option value="PARENTS">Parents</option>
                  <option value="STAFF">Staff</option>
                  <option value="STUDENTS">Students</option>
                </Select>
              )}
            </Field>
            <Field label="Message" required>{(id) => <Textarea id={id} name="body" required rows={4} placeholder="Write the announcement..." />}</Field>
            <div>
              <label className="ui-checkbox">
                <input name="publish" type="checkbox" defaultChecked /> Publish immediately
              </label>
            </div>
            <div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="spin" size={18} /> : <Send size={18} />} Save announcement
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Send email update" subtitle="One subject and body to a list of addresses.">
          <form id="email-form" className="ui-form" onSubmit={sendEmail}>
            <Field label="Linked announcement">
              {(id) => (
                <Select id={id} value={selectedAnnouncement} onChange={(event) => setSelectedAnnouncement(event.target.value)}>
                  <option value="">No linked announcement</option>
                  {announcements.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </Select>
              )}
            </Field>
            <Field label="Subject" required>{(id) => <Input id={id} name="subject" required placeholder="Email subject" autoComplete="off" />}</Field>
            <Field label="Recipients" required hint="Comma-separated email addresses.">{(id) => <Textarea id={id} name="recipients" required rows={2} placeholder="parent1@example.com, parent2@example.com" />}</Field>
            <Field label="Email body" required>{(id) => <Textarea id={id} name="body" required rows={4} placeholder="Write the email body..." />}</Field>
            <div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="spin" size={18} /> : <Smartphone size={18} />} Send email
              </Button>
            </div>
          </form>
        </Card>
      </div>

      <div className="premium-grid-2 align-start">
        <Card title="Recent announcements" subtitle={announcements.length ? "Newest first." : "Nothing published yet."}>
          {announcements.length === 0 ? (
            <EmptyState icon={<Megaphone size={22} />} title="No announcements" body="Write the first update above." />
          ) : (
            <div className="campaign-list">
              {announcements.map((item) => (
                <article key={item.id}>
                  <div><strong>{item.title}</strong><span>{item.audience} · {formatDateTime(item.created_at)}</span></div>
                  <div><Badge tone={item.published_at ? "success" : "neutral"}>{item.published_at ? "Live" : "Draft"}</Badge></div>
                </article>
              ))}
            </div>
          )}
        </Card>

        <Card title="Email delivery log" subtitle={deliveries.length ? "Latest 8 deliveries." : "Deliveries land here with their status."}>
          {deliveries.length === 0 ? (
            <EmptyState icon={<Mail size={22} />} title="No deliveries" body="Send the first email update above." />
          ) : (
            <div className="campaign-list">
              {deliveries.slice(0, 8).map((item) => (
                <article key={item.id}>
                  <div><strong>{item.recipient_email}</strong><span>{item.subject}</span></div>
                  <div><Badge tone={deliveryTone(item.status)}>{item.status}</Badge></div>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Message templates" subtitle="Suggested starting points — copy, adjust and send.">
        <div className="signal-list">
          {templates.map((template) => (
            <article key={template.title} className="signal-item">
              <div><strong>{template.title}</strong><p>{template.body}</p></div>
            </article>
          ))}
        </div>
      </Card>
    </div>
  );
}
