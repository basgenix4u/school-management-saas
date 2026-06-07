"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { EduManageLogo } from "@/components/brand/EduManageLogo";
import { canSeeItem, navItems, roleHome } from "@/components/navigation/nav-items";

type SessionResponse = {
  session?: {
    authenticated: boolean;
    user?: { role?: string; roleLabel?: string; name?: string };
  };
};

const groupOrder = ["Core", "School", "Academics", "Finance", "Communication", "Security", "Portals", "System"];

export function DashboardNavigation() {
  const [role, setRole] = useState<string | undefined>();
  const [roleLabel, setRoleLabel] = useState("School Owner");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetch("/api/auth/session", { cache: "no-store" })
        .then((response) => response.json())
        .then((data: SessionResponse) => {
          setRole(data.session?.user?.role ?? "SCHOOL_OWNER");
          setRoleLabel(data.session?.user?.roleLabel ?? "School Owner");
        })
        .catch(() => setRole("SCHOOL_OWNER"));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const items = useMemo(() => navItems.filter((item) => canSeeItem(item, role)), [role]);
  const groups = useMemo(() => groupOrder.map((group) => ({ group, items: items.filter((item) => item.group === group) })).filter((entry) => entry.items.length), [items]);
  const home = roleHome(role);

  const navContent = (
    <>
      {groups.map(({ group, items }) => (
        <section className="nav-group" key={group}>
          <h3>{group}</h3>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </section>
      ))}
    </>
  );

  return (
    <>
      <aside className="sidebar premium-sidebar desktop-sidebar">
        <div className="sidebar-brand sidebar-brand-logo">
          <EduManageLogo href={home} uploaded />
        </div>
        <nav>{navContent}</nav>
        <div className="sidebar-status">
          <span className="status-dot" />
          <strong>{roleLabel}</strong>
          <p>Navigation is filtered for your workspace and responsibilities.</p>
        </div>
      </aside>

      <header className="mobile-dashboard-topbar">
        <EduManageLogo href={home} uploaded />
        <button type="button" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={22} /></button>
      </header>

      {open ? (
        <div className="mobile-nav-overlay" role="dialog" aria-modal="true" aria-label="Dashboard navigation">
          <button className="mobile-nav-backdrop" type="button" aria-label="Close navigation" onClick={() => setOpen(false)} />
          <aside className="mobile-nav-panel">
            <div className="mobile-nav-head"><EduManageLogo href={home} uploaded /><button type="button" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
            <nav>{navContent}</nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
