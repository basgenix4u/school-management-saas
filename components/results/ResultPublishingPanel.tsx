"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Lock, Unlock } from "lucide-react";

type EventRow = { id: string; action: string; term: string; session: string; actor_email?: string; note?: string; created_at: string };

export function ResultPublishingPanel() {
  const [message, setMessage] = useState("Publish approved results when they are ready for parents and students.");
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<EventRow[]>([]);

  async function loadEvents() {
    const response = await fetch("/api/results/events", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    if (response.ok) setEvents(payload.events ?? []);
  }

  useEffect(() => { const timer = window.setTimeout(() => { void loadEvents(); }, 0); return () => window.clearTimeout(timer); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const response = await fetch("/api/results/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admissionNo: form.get("admissionNo"), term: form.get("term"), session: form.get("session"), action: form.get("action"), note: form.get("note") }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.message ?? "Unable to update result status");
      setMessage(`${payload.result.updated} result record(s) ${payload.result.action === "publish" ? "published and locked" : "unlocked"}.`);
      event.currentTarget.reset();
      await loadEvents();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update result status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><Lock size={14} /> Result Publishing</span>
        <h1>Publish and lock approved report cards.</h1>
        <p>When results are final, publish and lock them so parents and students can view official records without accidental edits.</p>
      </section>

      <section className="live-status-card">
        {saving ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
        <span>{message}</span>
        <button type="button" onClick={loadEvents}>Refresh events</button>
      </section>

      <section className="premium-grid-2 align-start">
        <form className="card premium-panel setup-form" onSubmit={submit}>
          <span className="premium-kicker">Publishing control</span>
          <h2>Update result status</h2>
          <div className="live-form-grid">
            <label><span>Admission no.</span><input name="admissionNo" required placeholder="STU-001" /></label>
            <label><span>Term</span><input name="term" required placeholder="First Term" /></label>
            <label><span>Session</span><input name="session" required placeholder="2026/2027" /></label>
            <label><span>Action</span><select name="action" defaultValue="publish"><option value="publish">Publish and lock</option><option value="unlock">Unlock for correction</option></select></label>
            <label className="full"><span>Note</span><textarea name="note" placeholder="Reason or approval note" /></label>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <Loader2 className="spin" size={18} /> : <Lock size={18} />} Save publishing status</button>
          </div>
        </form>

        <section className="card premium-panel">
          <span className="premium-kicker"><Unlock size={14} /> Publishing history</span>
          <h2>Recent events</h2>
          <div className="trust-list">{events.length === 0 ? <article><div><strong>No events yet</strong><p>Publishing events will appear after results are published or unlocked.</p></div><span>Empty</span></article> : events.map((event) => <article key={event.id}><div><strong>{event.action}</strong><p>{event.term} • {event.session} • {event.actor_email ?? "System"}</p></div><span>{new Date(event.created_at).toLocaleDateString()}</span></article>)}</div>
        </section>
      </section>
    </div>
  );
}
