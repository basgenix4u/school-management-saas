import { Activity, AlertTriangle, History, ShieldCheck } from "lucide-react";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getAuditSummary, listAuditEvents } from "@/lib/supabase/school-data";
import { formatDateTime } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Metric, MetricGrid } from "@/components/ui/Metric";
import { Table } from "@/components/ui/Table";

/**
 * Audit trail for the school.
 *
 * Every row is a recorded event: enrolments, registers, invoices, payments,
 * result publications and invitations, each with its actor. Nothing here is
 * sampled — an empty school sees an empty trail.
 */
export const dynamic = "force-dynamic";

function riskTone(risk: string | null): BadgeTone {
  if (risk === "High") return "danger";
  if (risk === "Medium") return "warning";
  return "success";
}

function describeAction(action: string): string {
  return action
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).replace(/_/g, " "))
    .join(" · ");
}

export default async function AuditPage() {
  const supabase = await requestClientOrNull();
  const connected = Boolean(supabase);
  const [events, summary] = supabase
    ? await Promise.all([listAuditEvents(supabase).catch(() => []), getAuditSummary(supabase).catch(() => null)])
    : [[], null];

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Audit trail</p>
        <h1 className="page-title">Every sensitive action, traceable.</h1>
        <p className="page-subtitle">Who did what, to which record, and when — recorded as it happens.</p>
      </header>

      {!connected ? (
        <Alert tone="info"><p>Connect your database to start recording audit events for your school.</p></Alert>
      ) : (
        <>
          <MetricGrid>
            <Metric icon={<Activity size={20} />} label="Events recorded" value={String(summary?.total ?? 0)} caption="latest 200" />
            <Metric icon={<History size={20} />} label="Events today" value={String(summary?.today ?? 0)} caption="since midnight" />
            <Metric icon={<AlertTriangle size={20} />} label="Needs review" value={String(summary?.needsReview ?? 0)} caption={`${summary?.highRisk ?? 0} high risk`} />
            <Metric icon={<ShieldCheck size={20} />} label="Actor attribution" value={events.some((event) => event.actor_name) ? "Active" : "—"} caption="named on each row" />
          </MetricGrid>

          {events.length === 0 ? (
            <EmptyState
              icon={<History size={22} />}
              title="No audit events yet"
              body="Events appear here automatically as your team enrols students, marks registers, raises invoices and publishes results."
            />
          ) : (
            <Table caption="Newest events first">
              <thead>
                <tr><th>Action</th><th>Actor</th><th>Role</th><th>Resource</th><th>Time</th><th>Risk</th></tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{describeAction(event.action)}</td>
                    <td>{event.actor_name ?? "—"}</td>
                    <td>{event.actor_role ?? "—"}</td>
                    <td>{event.resource_type ?? "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDateTime(event.created_at)}</td>
                    <td><Badge tone={riskTone(event.risk_level)}>{event.risk_level ?? "Low"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
