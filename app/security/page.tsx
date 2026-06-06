import Link from "next/link";
import { Database, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { EduManageLogo } from "@/components/brand/EduManageLogo";

const controls = [
  { icon: KeyRound, title: "Role-based access", body: "Access architecture separates owners, principals, teachers, accountants, parents and students." },
  { icon: Database, title: "Supabase foundation", body: "Database migrations, RLS foundation, Auth users and server-only service role patterns are documented." },
  { icon: LockKeyhole, title: "Protected routes", body: "Dashboards and portals are protected when Supabase environment variables are configured." },
  { icon: ShieldCheck, title: "Audit readiness", body: "Audit events and trust center modules are included for sensitive school operations." },
];

export default function SecurityPage() {
  return (
    <main className="public-page">
      <div className="public-nav"><EduManageLogo /><Link className="ds-btn ds-btn-secondary" href="/">Back home</Link></div>
      <section className="public-hero"><span className="ds-eyebrow"><ShieldCheck size={15} /> Security</span><h1>Security principles for sensitive school data.</h1><p>EduManage is designed to protect student, parent, academic and financial records through layered access, auditability and deployment discipline.</p></section>
      <section className="public-card-grid">{controls.map((control) => { const Icon = control.icon; return <article className="ds-card public-card" key={control.title}><Icon /><h2>{control.title}</h2><p>{control.body}</p></article>; })}</section>
      <section className="public-panel"><h2>Before production with real schools</h2><p>Replace product RLS policies with strict organization-scoped policies, rotate access credentials, enable monitoring, review legal policies and run accessibility/security QA.</p></section>
    </main>
  );
}
