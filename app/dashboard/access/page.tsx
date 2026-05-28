import { KeyRound, ShieldCheck } from "lucide-react";
import { RoleAccessMatrix } from "@/components/auth/RoleAccessMatrix";

export default function AccessPage() {
  return (
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><KeyRound size={14} /> Access Control</span>
        <h1>Enterprise-grade role experience and permission architecture.</h1>
        <p>EduManage separates school operations into clear roles so each user gets the right dashboard, the right actions and the right data boundaries.</p>
      </section>

      <section className="card premium-panel">
        <span className="premium-kicker"><ShieldCheck size={14} /> RBAC Lab</span>
        <h2>Role access matrix</h2>
        <RoleAccessMatrix />
      </section>
    </div>
  );
}
