"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { roleExperiences, roleLabels, UserRole } from "@/lib/rbac";
import { EduManageLogo } from "@/components/brand/EduManageLogo";
import { createBrowserSupabaseClient, hasBrowserSupabaseConfig } from "@/lib/supabase/browser";

export function LoginExperience() {
  const [role, setRole] = useState<UserRole>("SCHOOL_OWNER");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Sign in with your school account.");
  const [loading, setLoading] = useState(false);
  const selected = useMemo(() => roleExperiences.find((item) => item.role === role) ?? roleExperiences[0], [role]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("Checking Supabase Auth...");

    try {
      if (!hasBrowserSupabaseConfig()) {
        setMessage("Authentication is not configured yet. Add Supabase environment variables to enable sign in.");
        return;
      }

      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
      window.location.href = next;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-brand-panel">
        <div className="login-brand-logo"><EduManageLogo href="" uploaded /></div>
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
        <span className="premium-kicker">Secure Access</span>
        <h2>Sign in to EduManage</h2>
        <p>Sign in with your school account. Role access is managed by your school administrator.</p>

        <div className="role-select-grid">
          {roleExperiences.map((item) => (
            <button key={item.role} type="button" onClick={() => setRole(item.role)} className={item.role === role ? "active" : ""}>
              {roleLabels[item.role]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <label className="field-label">
            <span>Email address</span>
            <div><Mail size={18} /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" /></div>
          </label>
          <label className="field-label">
            <span>Password</span>
            <div><LockKeyhole size={18} /><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </label>

          <button className="btn btn-primary login-submit" type="submit" disabled={loading}>{loading ? <Loader2 className="spin" size={18} /> : <ArrowRight size={18} />} Sign in with Supabase</button>
        </form>
        <p className="auth-message">{message}</p>
        <Link className="login-secondary" href="/contact">Need access? Contact your school administrator</Link>
      </section>
    </main>
  );
}
