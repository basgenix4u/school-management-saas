"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Lock } from "lucide-react";
import { formatDate } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type EventRow = { id: string; action: string; term: string; session: string; actor_email?: string; note?: string; created_at: string };

export function ResultPublishingPanel() {
  const [message, setMessage] = useState("Publish approved results when they are ready for parents and students.");
  const [tone, setTone] = useState<"info" | "success" | "danger">("info");
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
      setTone("success");
      setMessage(`${payload.result.updated} result record(s) ${payload.result.action === "publish" ? "published and locked" : "unlocked for correction"}.`);
      event.currentTarget.reset();
      await loadEvents();
    } catch (error) {
      setTone("danger");
      setMessage(error instanceof Error ? error.message : "Unable to update result status.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Result publishing</p>
        <h1 className="page-title">Publish and lock report cards.</h1>
        <p className="page-subtitle">Published results lock against edits and become visible to guardians. Unlock only to correct a mistake.</p>
      </header>

      <Alert tone={saving ? "info" : tone}>
        <p>{message}</p>
        <p><Button variant="secondary" size="sm" onClick={loadEvents} disabled={saving}>Refresh events</Button></p>
      </Alert>

      <div className="premium-grid-2 align-start">
        <Card title="Update result status" subtitle="Applies to every subject for the student, term and session.">
          <form className="ui-form" onSubmit={submit}>
            <Field label="Admission number" required>{(id) => <Input id={id} name="admissionNo" required placeholder="STU-001" autoComplete="off" />}</Field>
            <Field label="Term" required>{(id) => <Input id={id} name="term" required placeholder="First Term" autoComplete="off" />}</Field>
            <Field label="Session" required>{(id) => <Input id={id} name="session" required placeholder="2026/2027" autoComplete="off" />}</Field>
            <Field label="Action">
              {(id) => (
                <Select id={id} name="action" defaultValue="publish">
                  <option value="publish">Publish and lock</option>
                  <option value="unlock">Unlock for correction</option>
                </Select>
              )}
            </Field>
            <Field label="Note" hint="Recorded with the event for accountability.">{(id) => <Textarea id={id} name="note" rows={2} placeholder="Reason or approval note" />}</Field>
            <div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="spin" size={18} /> : <Lock size={18} />} Save publishing status
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Publishing history" subtitle="Newest events first.">
          {events.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 size={22} />}
              title="No events yet"
              body="Publishing and unlock events will appear here."
            />
          ) : (
            <div className="trust-list">
              {events.map((event) => (
                <article key={event.id}>
                  <div>
                    <strong>{event.action === "publish" ? "Published" : "Unlocked"}</strong>
                    <p>{event.term} · {event.session} · {event.actor_email ?? "System"}{event.note ? ` — ${event.note}` : ""}</p>
                  </div>
                  <span>{formatDate(event.created_at)}</span>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
