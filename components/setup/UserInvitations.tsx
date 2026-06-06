"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Copy, Loader2, MailPlus, ShieldCheck, UsersRound } from "lucide-react";

const roles = ["SCHOOL_OWNER", "PRINCIPAL", "TEACHER", "ACCOUNTANT", "PARENT", "STUDENT"];

type Invitation = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  status: string;
  token: string;
  expires_at: string;
  created_at: string;
};

type InvitationPayload = {
  status: string;
  invitations?: Invitation[];
  summary?: Record<string, number | string | null> | null;
  message?: string;
  invitation?: Invitation;
};

export function UserInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [summary, setSummary] = useState<Record<string, number | string | null> | null>(null);
  const [message, setMessage] = useState("Invite staff, parents and students into your school workspace.");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadInvitations() {
    setLoading(true);
    try {
      const response = await fetch("/api/invitations", { cache: "no-store" });
      const payload = await response.json() as InvitationPayload;
      if (!response.ok) throw new Error(payload.message ?? "Unable to load invitations");
      setInvitations(payload.invitations ?? []);
      setSummary(payload.summary ?? null);
      setMessage(payload.status === "not_configured" ? (payload.message ?? "Database not configured.") : "Invitation workspace ready.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load invitations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadInvitations(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function createInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), name: form.get("name"), role: form.get("role") }),
      });
      const payload = await response.json() as InvitationPayload;
      if (!response.ok) throw new Error(payload.message ?? "Unable to create invitation");
      setMessage("Invitation created. Copy the invitation link and send it to the user.");
      event.currentTarget.reset();
      await loadInvitations();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create invitation.");
    } finally {
      setSaving(false);
    }
  }

  function inviteLink(token: string) {
    if (typeof window === "undefined") return token;
    return `${window.location.origin}/login?invite=${token}`;
  }

  async function copyInvite(token: string) {
    await navigator.clipboard.writeText(inviteLink(token));
    setMessage("Invitation link copied.");
  }

  return (
    <div className="premium-dashboard">
      <section className="card-aurora setup-hero">
        <div>
          <span className="premium-kicker"><UsersRound size={14} /> User invitations</span>
          <h1>Invite the people who run your school.</h1>
          <p>Create role-based invitations for principals, teachers, accountants, parents and students. Each user receives the correct workspace after access is accepted.</p>
        </div>
        <div className="setup-score-card"><strong>{summary?.pending_invitations ?? invitations.length}</strong><span>Pending invites</span><small>{summary?.active_users ?? 0} active users</small></div>
      </section>

      <section className="live-status-card">
        {loading || saving ? <Loader2 className="spin" size={18} /> : <CheckCircle2 size={18} />}
        <span>{message}</span>
        <button type="button" onClick={loadInvitations}>Refresh</button>
      </section>

      <section className="premium-grid-2 align-start">
        <form className="card premium-panel setup-form" onSubmit={createInvite}>
          <span className="premium-kicker"><MailPlus size={14} /> New invitation</span>
          <h2>Invite user</h2>
          <div className="live-form-grid">
            <label><span>Full name</span><input name="name" placeholder="User full name" /></label>
            <label><span>Email</span><input name="email" type="email" required placeholder="user@school.com" /></label>
            <label><span>Role</span><select name="role" required defaultValue="TEACHER">{roles.map((role) => <option key={role}>{role}</option>)}</select></label>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? <Loader2 className="spin" size={18} /> : <MailPlus size={18} />} Create invitation</button>
          </div>
        </form>

        <section className="card premium-panel">
          <span className="premium-kicker"><ShieldCheck size={14} /> Access summary</span>
          <h2>Workspace access</h2>
          <div className="setup-readiness-list">
            {[["Owners", "owners"], ["Principals", "principals"], ["Teachers", "teachers"], ["Accountants", "accountants"], ["Parents", "parents"], ["Students", "students"]].map(([label,key]) => <article key={key}><span>{label}</span><strong>{summary?.[key] ?? 0}</strong></article>)}
          </div>
        </section>
      </section>

      <section className="card premium-panel">
        <span className="premium-kicker">Pending invitations</span>
        <h2>Invitation list</h2>
        <div className="invitation-list">
          {invitations.length === 0 ? <div className="empty-state-card">No invitations yet.</div> : null}
          {invitations.map((invite) => <article key={invite.id}><div><strong>{invite.email}</strong><span>{invite.name || "No name"} • {invite.role} • {invite.status}</span></div><button type="button" onClick={() => copyInvite(invite.token)}><Copy size={15} /> Copy link</button></article>)}
        </div>
      </section>
    </div>
  );
}
