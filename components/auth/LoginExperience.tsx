"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { roleExperiences, roleLabels, UserRole } from "@/lib/rbac";
import { EduManageLogo } from "@/components/brand/EduManageLogo";
import { createBrowserSupabaseClient, hasBrowserSupabaseConfig } from "@/lib/supabase/browser";

export function LoginExperience() {
  const [role, setRole] = useState<UserRole>("SCHOOL_OWNER");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Sign in with your school account, or create the first owner account for a new school.");
  const [loading, setLoading] = useState(false);
  const selected = useMemo(() => roleExperiences.find((item) => item.role === role) ?? roleExperiences[0], [role]);

  async function acceptInviteIfPresent() {
    const token = new URLSearchParams(window.location.search).get("invite");
    if (!token) return;
    const response = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message ?? "Unable to accept invitation");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(mode === "signin" ? "Signing in..." : "Creating account...");

    try {
      if (!hasBrowserSupabaseConfig()) {
        setMessage("Authentication is not configured yet. Add Supabase environment variables to enable access.");
        return;
      }

      const supabase = createBrowserSupabaseClient();
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage(error.message);
          return;
        }
        await acceptInviteIfPresent();
        const next = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
        window.location.href = next;
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      await acceptInviteIfPresent().catch(() => undefined);
      setMessage("Account created. If email confirmation is required, check your inbox. Otherwise, continue to school setup.");
      window.setTimeout(() => { window.location.href = new URLSearchParams(window.location.search).get("invite") ? "/dashboard" : "/dashboard/setup"; }, 900);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to continue.");
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
        <h2>{mode === "signin" ? "Sign in to EduManage" : "Create school owner account"}</h2>
        <p>{mode === "signin" ? "Access your school workspace." : "Create the first account, then set up your school profile."}</p>

        <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
          <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>Sign in</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Create account</button>
        </div>

        <div className="role-select-grid">
          {roleExperiences.filter((item) => mode === "signup" ? item.role === "SCHOOL_OWNER" : true).map((item) => (
            <button key={item.role} type="button" onClick={() => setRole(item.role)} className={item.role === role ? "active" : ""}>
              {roleLabels[item.role]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label className="field-label">
              <span>Full name</span>
              <div><UserRound size={18} /><input value={name} onChange={(event) => setName(event.target.value)} type="text" required placeholder="School owner name" /></div>
            </label>
          ) : null}
          <label className="field-label">
            <span>Email address</span>
            <div><Mail size={18} /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@school.com" /></div>
          </label>
          <label className="field-label">
            <span>Password</span>
            <div><LockKeyhole size={18} /><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} required minLength={6} placeholder="Minimum 6 characters" /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </label>

          <button className="btn btn-primary login-submit" type="submit" disabled={loading}>{loading ? <Loader2 className="spin" size={18} /> : <ArrowRight size={18} />} {mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        <p className="auth-message">{message}</p>
        <Link className="login-secondary" href="/contact">Need access? Contact your school administrator</Link>
      </section>
    </main>
  );
}
