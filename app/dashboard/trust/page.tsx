import Link from "next/link";
import { History, KeyRound, LockKeyhole, ShieldCheck, UsersRound } from "lucide-react";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getAccessSummary, getAuditSummary, listInvitations } from "@/lib/supabase/school-data";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Metric, MetricGrid } from "@/components/ui/Metric";

/**
 * Trust center: what protects this school's data, stated plainly.
 *
 * Controls describe mechanisms that exist in the product today — not
 * aspirations. The posture figures are counted live from this school's
 * workspace.
 */
export const dynamic = "force-dynamic";

const controls = [
  {
    title: "Route authorization",
    status: "Live" as const,
    detail: "Every page and every data request checks the caller's role permission before answering. New endpoints fail closed by default.",
  },
  {
    title: "Tenant isolation",
    status: "Live" as const,
    detail: "Row level security scopes every query to the caller's school at the database layer. One school cannot read or change another's records.",
  },
  {
    title: "Audit trail",
    status: "Live" as const,
    detail: "Enrolments, registers, invoices, payments, result publications and invitations record who did what, to which record, and when.",
  },
  {
    title: "Payment verification",
    status: "Live" as const,
    detail: "Paystack callbacks are accepted only when their cryptographic signature checks out, and each reference settles exactly once.",
  },
  {
    title: "Credential hygiene",
    status: "Enforced" as const,
    detail: "Keys live in environment variables only. Automated checks refuse any build that commits a secret or an env file.",
  },
  {
    title: "Session handling",
    status: "Live" as const,
    detail: "Sign-in runs through Supabase Auth with httpOnly cookies; sessions refresh through the edge proxy, never in page code.",
  },
];

export default async function TrustPage() {
  const supabase = await requestClientOrNull();
  const [audit, access, invitations] = supabase
    ? await Promise.all([
        getAuditSummary(supabase).catch(() => null),
        getAccessSummary(supabase).catch(() => null),
        listInvitations(supabase).catch(() => []),
      ])
    : [null, null, []];
  const pendingInvites = (invitations as Array<{ status: string }>).filter((invite) => invite.status === "pending").length;
  const members = Number((access as Record<string, unknown> | null)?.total_members ?? 0);

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Trust center</p>
        <h1 className="page-title">How your school&apos;s data is protected.</h1>
        <p className="page-subtitle">Controls that exist today, plus a live look at this workspace.</p>
      </header>

      {!supabase ? (
        <Alert tone="info"><p>Connect your database to see live trust figures for your school.</p></Alert>
      ) : (
        <MetricGrid>
          <Metric icon={<History size={20} />} label="Audit events" value={String(audit?.total ?? 0)} caption="recorded actions" />
          <Metric icon={<UsersRound size={20} />} label="Workspace members" value={String(members)} caption="active accounts" />
          <Metric icon={<KeyRound size={20} />} label="Pending invites" value={String(pendingInvites)} caption="awaiting acceptance" />
          <Metric icon={<ShieldCheck size={20} />} label="Controls live" value={`${controls.filter((control) => control.status === "Live").length}/${controls.length}`} caption="verified below" />
        </MetricGrid>
      )}

      <Card title="Controls in force" subtitle="Each control below is implemented and covered by automated checks.">
        <div className="trust-list">
          {controls.map((control) => (
            <article key={control.title}>
              <div>
                <strong>{control.title}</strong>
                <p>{control.detail}</p>
              </div>
              <Badge tone={control.status === "Live" ? "success" : "info"}>{control.status}</Badge>
            </article>
          ))}
        </div>
        <p className="muted-copy">
          <LockKeyhole size={14} aria-hidden="true" /> Review the evidence in the <Link href="/dashboard/audit">audit trail</Link>.
        </p>
      </Card>
    </div>
  );
}
