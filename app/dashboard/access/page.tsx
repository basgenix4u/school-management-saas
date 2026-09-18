import { KeyRound, ShieldCheck } from "lucide-react";
import { RoleAccessMatrix } from "@/components/auth/RoleAccessMatrix";
import { Card } from "@/components/ui/Card";

export default function AccessPage() {
  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow"><KeyRound size={14} aria-hidden="true" /> Access control</p>
        <h1 className="page-title">Roles and permissions.</h1>
        <p className="page-subtitle">Each role opens its own workspace — explore what every role can do below.</p>
      </header>

      <Card title="Role access matrix" subtitle="Live from the permission model that guards every page.">
        <p className="ui-hint"><ShieldCheck size={14} aria-hidden="true" /> If you landed here after a refusal, your role does not include that area.</p>
        <RoleAccessMatrix />
      </Card>
    </div>
  );
}
