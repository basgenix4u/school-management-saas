"use client";

import { useMemo, useState } from "react";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { Permission, permissionLabels, permissionsByRole, roleExperiences, roleLabels, UserRole } from "@/lib/rbac";

const permissions = Object.keys(permissionLabels) as Permission[];

export function RoleAccessMatrix() {
  const [activeRole, setActiveRole] = useState<UserRole>("SCHOOL_OWNER");
  const activeExperience = useMemo(() => roleExperiences.find((item) => item.role === activeRole) ?? roleExperiences[0], [activeRole]);

  return (
    <div className="access-lab">
      <section className="role-tabs" aria-label="Role selector">
        {roleExperiences.map((item) => (
          <button key={item.role} type="button" onClick={() => setActiveRole(item.role)} className={activeRole === item.role ? "active" : ""}>
            {roleLabels[item.role]}
          </button>
        ))}
      </section>

      <section className="role-preview-card">
        <div>
          <span className="premium-kicker"><Sparkles size={14} /> {activeExperience.workspace}</span>
          <h2>{activeExperience.headline}</h2>
          <p>{activeExperience.description}</p>
          <div className="role-metrics">{activeExperience.metrics.map((metric) => <span key={metric}>{metric}</span>)}</div>
        </div>
        <div className="role-shield"><ShieldCheck size={46} /><strong>{permissionsByRole[activeRole].length}</strong><span>permissions</span></div>
      </section>

      <section className="permission-grid" aria-label="Permission matrix">
        {permissions.map((permission) => {
          const enabled = permissionsByRole[activeRole].includes(permission);
          return (
            <article key={permission} className={enabled ? "enabled" : "disabled"}>
              <span>{enabled ? <Check size={16} /> : null}</span>
              <div>
                <strong>{permissionLabels[permission]}</strong>
                <small>{permission}</small>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
