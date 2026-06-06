"use client";

import { FormEvent, useEffect, useState } from "react";
import { BellRing, CheckCircle2, Loader2, Mail, Megaphone, MessageCircle, Send, Smartphone, UsersRound } from "lucide-react";
import { messageTemplates } from "@/lib/communications-data";

type Announcement = { id: string; title: string; body: string; audience: string; published_at: string | null; created_at: string };
type Delivery = { id: string; recipient_email: string; subject: string; status: string; provider?: string; created_at: string; error_message?: string };
type Payload = { status: string; announcements?: Announcement[]; deliveries?: Delivery[]; summary?: Record<string, number | string | null> | null; message?: string; announcement?: Announcement };

export function CommunicationCenter() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [summary, setSummary] = useState<Record<string, number | string | null> | null>(null);
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
      setSummary(payload.summary ?? null);
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

  const metrics = [
    { label: "Announcements", value: String(summary?.announcements_count ?? announcements.length), change: "created", tone: "blue" },
    { label: "Deliveries", value: String(summary?.deliveries_count ?? deliveries.length), change: "total", tone: "emerald" },
    { label: "Sent", value: String(summary?.sent_count ?? deliveries.filter((item) => item.status === "sent").length), change: "successful", tone: "amber" },
    { label: "Failed", value: String(summary?.failed_count ?? deliveries.filter((item) => item.status === "failed").length), change: "needs review", tone: "rose" },
  ];

  function toneClass(tone: string) { if (tone === "emerald") return "tone-emerald"; if (tone === "amber") return "tone-amber"; if (tone === "rose") return "tone-rose"; return "tone-blue"; }

  return (
    <div className="communications-center premium-dashboard">
      <section className="card-aurora communications-hero">
        <div>
          <span className="premium-kicker"><Megaphone size={14} /> Communication Center</span>
          <h1>Send clear school updates to the right people.</h1>
          <p>Create announcements and send email updates to parents, staff and students. Delivery records are tracked for accountability.</p>
          <div className="hero-actions"><button className="btn btn-primary" type="button" onClick={() => document.getElementById("announcement-form")?.scrollIntoView({ behavior: "smooth" })}><Send size={18} /> Create Announcement</button><button className="btn btn-secondary" type="button" onClick={() => document.getElementById("email-form")?.scrollIntoView({ behavior: "smooth" })}><BellRing size={18} /> Send Email</button></div>
        </div>
        <div className="communications-hero-card"><strong>{summary?.sent_count ?? 0}</strong><span>Emails sent</span><small>{loading ? "Loading..." : "Live records"}</small></div>
      </section>

      <section className="live-status-card">
        {loading || saving ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
        <span>{message}</span>
        <button type="button" onClick={load}>Refresh</button>
      </section>

      <section className="premium-metrics">
        {metrics.map((metric) => <article className={`premium-metric ${toneClass(metric.tone)}`} key={metric.label}><div className="metric-icon"><MessageCircle /></div><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.change}</small><p>Communication record for your school workspace.</p></article>)}
      </section>

      <section className="premium-grid-2 align-start">
        <form id="announcement-form" className="card premium-panel setup-form" onSubmit={createAnnouncement}>
          <span className="premium-kicker"><Mail size={14} /> Announcement</span>
          <h2>Create announcement</h2>
          <div className="live-form-grid">
            <label><span>Title</span><input name="title" required placeholder="School update title" /></label>
            <label><span>Audience</span><select name="audience" defaultValue="ALL"><option>ALL</option><option>PARENTS</option><option>STAFF</option><option>STUDENTS</option></select></label>
            <label className="setup-checkbox"><input name="publish" type="checkbox" defaultChecked /> Publish now</label>
            <label className="full"><span>Message</span><textarea name="body" required placeholder="Write the announcement..." /></label>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <Loader2 className="spin" size={18} /> : <Send size={18} />} Save announcement</button>
          </div>
        </form>

        <form id="email-form" className="card premium-panel setup-form" onSubmit={sendEmail}>
          <span className="premium-kicker"><Smartphone size={14} /> Email delivery</span>
          <h2>Send email update</h2>
          <div className="live-form-grid">
            <label><span>Announcement</span><select value={selectedAnnouncement} onChange={(event) => setSelectedAnnouncement(event.target.value)}><option value="">No linked announcement</option>{announcements.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            <label><span>Subject</span><input name="subject" required placeholder="Email subject" /></label>
            <label className="full"><span>Recipients</span><textarea name="recipients" required placeholder="parent1@school.com, parent2@school.com" /></label>
            <label className="full"><span>Email body</span><textarea name="body" required placeholder="Write the email body..." /></label>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <Loader2 className="spin" size={18} /> : <Send size={18} />} Send email</button>
          </div>
        </form>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><Mail size={14} /> Announcements</span>
          <h2>Recent announcements</h2>
          <div className="campaign-list">{announcements.length === 0 ? <div className="empty-state-card">No announcements yet.</div> : announcements.map((item) => <article key={item.id}><div><strong>{item.title}</strong><span>{item.audience} • {item.published_at ? "Published" : "Draft"}</span></div><div><strong>{new Date(item.created_at).toLocaleDateString()}</strong><span className="status good">{item.published_at ? "LIVE" : "DRAFT"}</span></div></article>)}</div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker"><UsersRound size={14} /> Delivery records</span>
          <h2>Email delivery log</h2>
          <div className="campaign-list">{deliveries.length === 0 ? <div className="empty-state-card">No delivery records yet.</div> : deliveries.slice(0, 8).map((item) => <article key={item.id}><div><strong>{item.recipient_email}</strong><span>{item.subject}</span></div><div><strong>{item.status}</strong><span className={`status ${item.status === "sent" ? "good" : item.status === "failed" ? "bad" : "warn"}`}>{item.status}</span></div></article>)}</div>
        </div>
      </section>

      <section className="card premium-panel">
        <span className="premium-kicker">Message templates</span>
        <h2>Suggested starting points</h2>
        <div className="template-list">{messageTemplates.map((template) => <article key={template.title}><strong>{template.title}</strong><p>{template.body}</p></article>)}</div>
      </section>
    </div>
  );
}
