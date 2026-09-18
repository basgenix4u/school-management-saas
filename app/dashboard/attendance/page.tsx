import { CalendarCheck, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AttendancePage() {
  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Attendance</p>
        <h1 className="page-title">Registers and reliability.</h1>
        <p className="page-subtitle">Daily marking lives on the register; history builds as classes submit.</p>
      </header>

      <Card title="Attendance history" subtitle="Submitted registers will list here.">
        <EmptyState
          icon={<CalendarCheck size={22} />}
          title="No registers submitted yet"
          body="History appears here after teachers submit class registers."
          action={<Button href="/dashboard/attendance/mark"><ClipboardCheck size={18} /> Open attendance marking</Button>}
        />
      </Card>
    </div>
  );
}
