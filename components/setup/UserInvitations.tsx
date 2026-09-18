"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Copy, Loader2, MailPlus, UsersRound } from "lucide-react";
import { roleLabels, type UserRole } from "@/lib/rbac";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Metric, MetricGrid } from "@/components/ui/Metric";
import { Select } from "@/components/ui/Select";

const roles: UserRole[] = ["SCHOOL_OWNER", "PRINCIPAL", "TEACHER", "ACCOUNTANT", "PARENT", "STUDENT"];

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

  const pending = invitations.filter((invite) => invite.status === "pending").length;
  const roleCounts: Array<[string, string]> = [["Owners", "owners"], ["Principals", "principals"], ["Teachers", "teachers"], ["Accountants", "accountants"], ["Parents", "parents"], ["Students", "students"]];

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Access</p>
        <h1 className="page-title">Invite your people.</h1>
        <p className="page-subtitle">Role-based invitations — each person lands in the right workspace after accepting.</p>
      </header>

      <Alert tone={loading || saving ? "info" : "success"}>
        <p>{message}</p>
        <p><Button variant="secondary" size="sm" onClick={loadInvitations} disabled={loading}>Refresh</Button></p>
      </Alert>

      <MetricGrid>
        <Metric icon={<MailPlus size={20} />} label="Pending invites" value={String(summary?.pending_invitations ?? pending)} caption="awaiting acceptance" />
        <Metric icon={<UsersRound size={20} />} label="Active users" value={String(summary?.active_users ?? 0)} caption="in this workspace" />
        <Metric icon={<CheckCircle2 size={20} />} label="Invitations sent" value={String(invitations.length)} caption="all time" />
      </MetricGrid>

      <div className="premium-grid-2 align-start">
        <Card title="Invite user" subtitle="They accept from the login page with the link you copy.">
          <form className="ui-form" onSubmit={createInvite}>
            <Field label="Full name">{(id) => <Input id={id} name="name" placeholder="User full name" autoComplete="off" />}</Field>
            <Field label="Email" required>{(id) => <Input id={id} name="email" type="email" required placeholder="user@example.com" autoComplete="off" />}</Field>
            <Field label="Role" required>
              {(id) => (
                <Select id={id} name="role" required defaultValue="TEACHER">
                  {roles.map((role) => <option key={role} value={role}>{roleLabels[role]}</option>)}
                </Select>
              )}
            </Field>
            <div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="spin" size={18} /> : <MailPlus size={18} />} Create invitation
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Workspace access" subtitle="Active accounts by role.">
          <div className="trust-list">
            {roleCounts.map(([label, key]) => (
              <article key={key}>
                <div><strong>{label}</strong></div>
                <Badge tone="neutral">{String(summary?.[key] ?? 0)}</Badge>
              </article>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Invitation list" subtitle={invitations.length ? "Copy a link to resend it." : "No invitations yet."}>
        {invitations.length === 0 ? (
          <EmptyState icon={<MailPlus size={22} />} title="No invitations" body="Invite the first person above." />
        ) : (
          <div className="invitation-list">
            {invitations.map((invite) => (
              <article key={invite.id}>
                <div>
                  <strong>{invite.email}</strong>
                  <span>{invite.name || "No name"} · {roleLabels[invite.role as UserRole] ?? invite.role} · {invite.status}</span>
                </div>
                <Button variant="secondary" size="sm" onClick={() => copyInvite(invite.token)}><Copy size={15} /> Copy link</Button>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
