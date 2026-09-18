import { UsersRound } from "lucide-react";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { listTeachers } from "@/lib/supabase/school-data";
import { formatPhoneForDisplay } from "@/lib/format";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table } from "@/components/ui/Table";

/**
 * Staff directory for the school.
 *
 * Staff records with departments and contact details. An empty
 * school is sent to setup, where staff are added, instead of a dead end.
 */
export const dynamic = "force-dynamic";

export default async function TeachersPage() {
  const supabase = await requestClientOrNull();
  const teachers = supabase ? await listTeachers(supabase).catch(() => null) : null;

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Staff</p>
        <h1 className="page-title">Teaching team.</h1>
        <p className="page-subtitle">{teachers ? `${teachers.length} staff records.` : "Connect your database to load staff records."}</p>
      </header>

      {!teachers ? (
        <Alert tone="info"><p>Connect your database to load the staff directory.</p></Alert>
      ) : teachers.length === 0 ? (
        <EmptyState
          icon={<UsersRound size={22} />}
          title="No staff added yet"
          body="Add teachers and assign departments in setup to activate registers and score entry."
          action={<Button href="/dashboard/setup">Continue setup</Button>}
        />
      ) : (
        <Table caption="Alphabetical by name">
          <thead><tr><th>Staff no.</th><th>Name</th><th>Title</th><th>Department</th><th>Phone</th><th>Status</th></tr></thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher.id}>
                <td>{teacher.staff_no}</td>
                <td>{teacher.name}<br /><small>{teacher.email ?? "no email"}</small></td>
                <td>{teacher.title ?? "—"}</td>
                <td>{teacher.department ?? "—"}</td>
                <td style={{ whiteSpace: "nowrap" }}>{teacher.phone ? formatPhoneForDisplay(teacher.phone) : "—"}</td>
                <td><Badge tone={teacher.active ? "success" : "neutral"}>{teacher.active ? "Active" : "Inactive"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
