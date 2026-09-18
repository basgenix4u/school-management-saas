import { Mail } from "lucide-react";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { listAnnouncements, listCommunicationDeliveries } from "@/lib/supabase/school-data";
import { formatDate } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table } from "@/components/ui/Table";

/**
 * Announcement campaigns, measured from delivery records.
 *
 * Each announcement is a campaign: its audience, channel, status and real
 * delivery counts — how many sends succeeded, failed or are still queued.
 */
export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const supabase = await requestClientOrNull();
  const [announcements, deliveries] = supabase
    ? await Promise.all([
        listAnnouncements(supabase).catch(() => []),
        listCommunicationDeliveries(supabase).catch(() => []),
      ])
    : [[], []];

  const stats = new Map<string, { sent: number; failed: number; queued: number }>();
  for (const delivery of deliveries as Array<{ announcement_id: string | null; status: string }>) {
    if (!delivery.announcement_id) continue;
    const entry = stats.get(delivery.announcement_id) ?? { sent: 0, failed: 0, queued: 0 };
    if (delivery.status === "sent") entry.sent += 1;
    else if (delivery.status === "failed") entry.failed += 1;
    else entry.queued += 1;
    stats.set(delivery.announcement_id, entry);
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Communications</p>
        <h1 className="page-title">Announcement campaigns.</h1>
        <p className="page-subtitle">Every announcement and how its deliveries actually went.</p>
      </header>

      {!supabase ? (
        <Alert tone="info"><p>Connect your database to load campaigns.</p></Alert>
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={<Mail size={22} />}
          title="No campaigns yet"
          body="Create an announcement to start your first campaign."
          action={<Button href="/dashboard/communications">Open communications</Button>}
        />
      ) : (
        <Table caption="Newest announcements first">
          <thead><tr><th>Campaign</th><th>Audience</th><th>Status</th><th className="numeric">Sent</th><th className="numeric">Failed</th><th className="numeric">Queued</th><th>Created</th></tr></thead>
          <tbody>
            {announcements.map((item) => {
              const entry = stats.get(item.id) ?? { sent: 0, failed: 0, queued: 0 };
              return (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.audience}</td>
                  <td><Badge tone={item.published_at ? "success" : "neutral"}>{item.published_at ? "Live" : "Draft"}</Badge></td>
                  <td className="numeric">{entry.sent}</td>
                  <td className="numeric">{entry.failed}</td>
                  <td className="numeric">{entry.queued}</td>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDate(item.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
