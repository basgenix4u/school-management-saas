"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";

type SessionResponse = {
  session?: {
    authenticated: boolean;
    mode: "live" | "product";
    user?: {
      name?: string;
      email?: string;
      roleLabel?: string;
    };
    message?: string;
  };
};

export function SessionBadge() {
  const [session, setSession] = useState<SessionResponse["session"] | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetch("/api/auth/session", { cache: "no-store" })
        .then((response) => response.json())
        .then((data: SessionResponse) => setSession(data.session))
        .catch(() => setSession({ authenticated: false, mode: "product", message: "Session unavailable" }));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/login";
  }

  if (!session) {
    return <div className="session-badge"><UserRound size={15} /> Checking session...</div>;
  }

  if (!session.authenticated) {
    return <Link className="session-badge" href="/login"><ShieldCheck size={15} /> {session.mode === "product" ? "Configuration required" : "Sign in"}</Link>;
  }

  return (
    <div className="session-badge live">
      <UserRound size={15} />
      <span><strong>{session.user?.name}</strong><small>{session.user?.roleLabel}</small></span>
      <button type="button" onClick={signOut} aria-label="Sign out"><LogOut size={15} /></button>
    </div>
  );
}
