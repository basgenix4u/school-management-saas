import Link from "next/link";
import { CalendarCheck, ClipboardCheck } from "lucide-react";

export default function AttendancePage() {
  return (
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><CalendarCheck size={14} /> Attendance</span>
        <h1>Track attendance once your school records are connected.</h1>
        <p>Create your school workspace, add students and classes, then teachers can begin marking attendance from the live register.</p>
      </section>
      <section className="card premium-panel empty-module-panel">
        <ClipboardCheck size={34} />
        <h2>No attendance records yet</h2>
        <p>Attendance records will appear here after teachers submit live class registers.</p>
        <Link className="btn btn-primary" href="/dashboard/attendance/mark">Open attendance marking</Link>
      </section>
    </div>
  );
}
