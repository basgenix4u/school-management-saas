"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { roleExperiences, roleLabels, UserRole } from "@/lib/rbac";

export function LoginExperience() {
  const [role, setRole] = useState<UserRole>("SCHOOL_OWNER");
  const [showPassword, setShowPassword] = useState(false);
  const selected = useMemo(() => roleExperiences.find((item) => item.role === role) ?? roleExperiences[0], [role]);

  return (
    <main className="login-shell">
      <section className="login-brand-panel">
        <div className="login-logo"><GraduationCap size={30} /></div>
        <span className="premium-kicker"><ShieldCheck size={14} /> Secure School OS</span>
        <h1>Role-aware access built for serious school operations.</h1>
        <p>EduManage is designed for owners, principals, teachers, accountants, parents and students — each with a focused workspace and permission boundary.</p>
        <div className="login-showcase">
          <strong>{selected.workspace}</strong>
          <span>{selected.headline}</span>
          <div>{selected.metrics.map((metric) => <small key={metric}>{metric}</small>)}</div>
        </div>
      </section>

      <section className="login-card">
        <span className="premium-kicker">Demo Access</span>
        <h2>Sign in to EduManage</h2>
        <p>Select a role to preview the experience architecture.</p>

        <div className="role-select-grid">
          {roleExperiences.map((item) => (
            <button key={item.role} type="button" onClick={() => setRole(item.role)} className={item.role === role ? "active" : ""}>
              {roleLabels[item.role]}
            </button>
          ))}
        </div>

        <label className="field-label">
          <span>Email address</span>
          <div><Mail size={18} /><input defaultValue="admin@greenfield.test" type="email" /></div>
        </label>
        <label className="field-label">
          <span>Password</span>
          <div><LockKeyhole size={18} /><input defaultValue="password" type={showPassword ? "text" : "password"} /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
        </label>

        <Link className="btn btn-primary login-submit" href="/dashboard/access">Enter as {roleLabels[role]} <ArrowRight size={18} /></Link>
        <Link className="login-secondary" href="/dashboard">Continue to command center</Link>
      </section>
    </main>
  );
}
