import Link from "next/link";
import { BriefcaseBusiness, UsersRound } from "lucide-react";

export default function TeachersPage() {
  return (
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><UsersRound size={14} /> Teachers</span>
        <h1>Build your teaching team workspace.</h1>
        <p>Teacher profiles, assigned classes, subjects and workload insights will appear here once your school setup is completed.</p>
      </section>
      <section className="card premium-panel empty-module-panel">
        <BriefcaseBusiness size={34} />
        <h2>No teachers added yet</h2>
        <p>Add teacher profiles and assign classes to activate teacher dashboards, attendance workflows and result entry.</p>
        <Link className="btn btn-primary" href="/dashboard/teacher-desk">Open teacher desk</Link>
      </section>
    </div>
  );
}
