"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { roleExperiences, roleLabels, UserRole } from "@/lib/rbac";
import { EduManageLogo } from "@/components/brand/EduManageLogo";
import { createBrowserSupabaseClient, hasBrowserSupabaseConfig } from "@/lib/supabase/browser";

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login credentials")) return "Invalid email or password. Check your details, or use password reset/sign-in link below.";
  if (lower.includes("already registered") || lower.includes("already been registered") || lower.includes("user already")) return "This email already has an account. Switch to Sign in, or reset your password if you do not remember it.";
  if (lower.includes("email not confirmed")) return "Please confirm your email address before signing in. Check your inbox.";
  return message;
}

export function LoginExperience() {
  const [role, setRole] = useState<UserRole>("SCHOOL_OWNER");
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Sign in with your school account, or create the first owner account for a new school.");
  const [loading, setLoading] = useState(false);
  const selected = useMemo(() => roleExperiences.find((item) => item.role === role) ?? roleExperiences[0], [role]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (new URLSearchParams(window.location.search).get("reset") === "1") {
        setMode("reset");
        setMessage("Enter a new password to complete account recovery.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

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

  async function sendPasswordReset() {
    if (!email) {
      setMessage("Enter your email address first, then request password reset.");
      return;
    }
    setLoading(true);
    try {
      if (!hasBrowserSupabaseConfig()) throw new Error("Authentication is not configured yet.");
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/login?reset=1")}` });
      if (error) throw error;
      setMessage("Password reset link sent. Check your email inbox.");
    } catch (error) {
      setMessage(error instanceof Error ? friendlyAuthError(error.message) : "Unable to send password reset.");
    } finally {
      setLoading(false);
    }
  }

  async function sendMagicLink() {
    if (!email) {
      setMessage("Enter your email address first, then request a sign-in link.");
      return;
    }
    setLoading(true);
    try {
      if (!hasBrowserSupabaseConfig()) throw new Error("Authentication is not configured yet.");
      const supabase = createBrowserSupabaseClient();
      const next = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
      const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
      if (error) throw error;
      setMessage("Sign-in link sent. Check your email inbox.");
    } catch (error) {
      setMessage(error instanceof Error ? friendlyAuthError(error.message) : "Unable to send sign-in link.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(mode === "signin" ? "Signing in..." : mode === "signup" ? "Creating account..." : "Updating password...");

    try {
      if (!hasBrowserSupabaseConfig()) {
        setMessage("Authentication is not configured yet. Add Supabase environment variables to enable access.");
        return;
      }

      const supabase = createBrowserSupabaseClient();
      if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          setMessage(friendlyAuthError(error.message));
          return;
        }
        setMessage("Password updated. You can now sign in with your new password.");
        setPassword("");
        setMode("signin");
        return;
      }

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setMessage(friendlyAuthError(error.message));
          return;
        }
        await acceptInviteIfPresent();
        const next = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
        window.location.href = next;
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role }, emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard/setup` },
      });
      if (error) {
        const friendly = friendlyAuthError(error.message);
        setMessage(friendly);
        if (friendly.includes("already has an account")) setMode("signin");
        return;
      }

      if (data.session) {
        await acceptInviteIfPresent().catch(() => undefined);
        window.location.href = new URLSearchParams(window.location.search).get("invite") ? "/dashboard" : "/dashboard/setup";
        return;
      }

      setMessage("Account created. Check your email to confirm your account, then sign in.");
      setMode("signin");
    } catch (error) {
      setMessage(error instanceof Error ? friendlyAuthError(error.message) : "Unable to continue.");
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
        <h2>{mode === "signin" ? "Sign in to EduManage" : mode === "signup" ? "Create school owner account" : "Set a new password"}</h2>
        <p>{mode === "signin" ? "Access your school workspace." : mode === "signup" ? "Create the first account, then set up your school profile." : "Complete password recovery for your account."}</p>

        {mode !== "reset" ? (
          <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
            <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => setMode("signin")}>Sign in</button>
            <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Create account</button>
          </div>
        ) : null}

        {mode !== "reset" ? (
          <div className="role-select-grid">
            {roleExperiences.filter((item) => mode === "signup" ? item.role === "SCHOOL_OWNER" : true).map((item) => (
              <button key={item.role} type="button" onClick={() => setRole(item.role)} className={item.role === role ? "active" : ""}>
                {roleLabels[item.role]}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label className="field-label">
              <span>Full name</span>
              <div><UserRound size={18} /><input value={name} onChange={(event) => setName(event.target.value)} type="text" required placeholder="School owner name" /></div>
            </label>
          ) : null}
          {mode !== "reset" ? (
            <label className="field-label">
              <span>Email address</span>
              <div><Mail size={18} /><input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@school.com" /></div>
            </label>
          ) : null}
          <label className="field-label">
            <span>Password</span>
            <div><LockKeyhole size={18} /><input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} required minLength={6} placeholder="Minimum 6 characters" /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </label>

          <button className="btn btn-primary login-submit" type="submit" disabled={loading}>{loading ? <Loader2 className="spin" size={18} /> : <ArrowRight size={18} />} {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Update password"}</button>
        </form>
        {mode === "signin" ? (
          <div className="auth-recovery-actions">
            <button type="button" onClick={sendPasswordReset} disabled={loading}><KeyRound size={15} /> Reset password</button>
            <button type="button" onClick={sendMagicLink} disabled={loading}><Mail size={15} /> Email sign-in link</button>
          </div>
        ) : null}
        <p className="auth-message">{message}</p>
        <Link className="login-secondary" href="/contact">Need access? Contact your school administrator</Link>
      </section>
    </main>
  );
}
