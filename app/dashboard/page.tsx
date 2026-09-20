import { ClipboardCheck, FileSpreadsheet, ReceiptText } from "lucide-react";
import { getAppSession } from "@/lib/auth/session";
import { can } from "@/lib/rbac";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getCommandCenterSnapshot } from "@/lib/supabase/school-data";
import { formatNaira } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Metric, MetricGrid } from "@/components/ui/Metric";

/**
 * Operations overview.
 *
 * Figures come from the caller's school only; row level security scopes the
 * query. When Supabase is unconfigured the page states that plainly instead of
 * showing placeholder numbers, so a demo is never mistaken for live data.
 */
export const dynamic = "force-dynamic";

type MetricDatum = { label: string; value: string; caption: string };

function greeting(date = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-NG", { hour: "numeric", hour12: false, timeZone: "Africa/Lagos" }).format(date),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardOverview() {
  const session = await getAppSession();
  const supabase = await requestClientOrNull();

  const firstName = session.user?.name?.split(" ")[0] ?? "there";
  const role = session.user?.role ?? "SCHOOL_OWNER";

  let metrics: MetricDatum[] = [];
  let schoolName: string | null = null;
  let unavailable: string | null = null;

  if (!supabase) {
    unavailable = "Connect your database to see live figures for your school.";
  } else {
    try {
      const snapshot = await getCommandCenterSnapshot(supabase);
      schoolName = snapshot.organization?.name ?? null;
      metrics = [
        { label: "Enrolled students", value: String(snapshot.totals.students), caption: "Active records" },
        { label: "Attendance today", value: `${snapshot.totals.attendanceRate}%`, caption: "Marked registers" },
        { label: "Outstanding fees", value: formatNaira(snapshot.totals.outstanding), caption: `${snapshot.totals.unpaidInvoices} unpaid invoices` },
        { label: "Results published", value: `${snapshot.totals.publishedRate}%`, caption: "This term" },
      ];
    } catch {
      unavailable = "We could not load your figures just now. Please refresh in a moment.";
    }
  }

  // Miller's Law: keep the action set small. Only actions this role can
  // actually complete are offered, so nothing here leads to a refusal.
  const actions = [
    { href: "/dashboard/attendance/mark", label: "Mark attendance", icon: ClipboardCheck, permission: "attendance.mark" as const },
    { href: "/dashboard/results/entry", label: "Enter results", icon: FileSpreadsheet, permission: "results.manage" as const },
    { href: "/dashboard/fees/invoices", label: "Create invoice", icon: ReceiptText, permission: "fees.manage" as const },
  ].filter((action) => can(role, action.permission));

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">{schoolName ?? "Your school"}</p>
        <h1 className="page-title">
          {greeting()}, {firstName}
        </h1>
        <p className="page-subtitle">Here is where your school stands today.</p>
      </header>

      {unavailable ? (
        <Alert tone="info"><p>{unavailable}</p></Alert>
      ) : (
        <section aria-label="Today at a glance">
          <MetricGrid>
            {metrics.map((metric) => (
              <Metric key={metric.label} label={metric.label} value={metric.value} caption={metric.caption} />
            ))}
          </MetricGrid>
        </section>
      )}

      {actions.length > 0 && (
        <Card title="Quick actions">
          <div className="action-row">
            {actions.map((action) => (
              <Button key={action.href} href={action.href} variant="secondary">
                <action.icon size={18} aria-hidden="true" />
                {action.label}
              </Button>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
