"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BrainCircuit, BriefcaseBusiness, CalendarCheck, ClipboardCheck, Database, CreditCard, GraduationCap, History, KeyRound, LayoutDashboard, LockKeyhole, Megaphone, Rocket, Search, UsersRound, X } from "lucide-react";

const actions = [
  { href: "/dashboard", title: "Open Command Center", hint: "Executive overview", icon: LayoutDashboard, tags: "home overview dashboard health" },
  { href: "/dashboard/intelligence", title: "Open Intelligence Center", hint: "AI-style insights and decision queue", icon: BrainCircuit, BriefcaseBusiness, tags: "ai insights risk signals copilot" },
  { href: "/dashboard/setup", title: "Open School Setup", hint: "Create school profile, classes, staff, students and fees", icon: Rocket, tags: "school setup onboarding classes staff students fees" },
  { href: "/dashboard/onboarding", title: "Launch School Workspace", hint: "Workspace setup checklist", icon: Rocket, tags: "setup onboarding launch school" },
  { href: "/dashboard/access", title: "Open Access Control", hint: "Roles, permissions and RBAC matrix", icon: KeyRound, tags: "auth access roles rbac permissions" },
  { href: "/dashboard/audit", title: "Open Audit Trail", hint: "Trace sensitive actions and risk events", icon: History, tags: "audit logs security events" },
  { href: "/dashboard/trust", title: "Open Trust Center", hint: "Security controls and readiness", icon: LockKeyhole, tags: "trust security compliance privacy" },
  { href: "/dashboard/students", title: "Manage Students", hint: "Enrollment and guardian records", icon: GraduationCap, History, tags: "student enrollment guardians" },
  { href: "/dashboard/teachers", title: "Manage Teachers", hint: "Staff, subjects and classes", icon: UsersRound, tags: "teacher staff subject" },
  { href: "/dashboard/teacher-desk", title: "Open Teacher Desk", hint: "Daily teaching workspace and lesson flow", icon: BriefcaseBusiness, tags: "teacher desk daily lesson workspace" },
  { href: "/dashboard/attendance", title: "View Attendance", hint: "Daily attendance overview", icon: CalendarCheck, tags: "attendance class register" },
  { href: "/dashboard/attendance/mark", title: "Mark Attendance", hint: "Smart attendance register", icon: ClipboardCheck, tags: "mark attendance present absent late excused" },
  { href: "/dashboard/results", title: "Publish Results", hint: "Scores and report cards", icon: GraduationCap, History, tags: "result scores report card" },
  { href: "/dashboard/fees", title: "Open Finance Command Center", hint: "Fees, payments and finance intelligence", icon: CreditCard, tags: "fees payment invoices finance" },
  { href: "/dashboard/fees/invoices", title: "Open Invoice Board", hint: "All invoices and payment probabilities", icon: CreditCard, tags: "invoice board balances collection" },
  { href: "/dashboard/database", title: "Open Database Control Room", hint: "Supabase health and live data views", icon: Database, tags: "database supabase health live data" },
  { href: "/dashboard/launch", title: "Open Launch Center", hint: "Production readiness and product checklist", icon: Rocket, tags: "launch production deployment readiness" },
  { href: "/dashboard/communications", title: "Open Communication Center", hint: "Announcements, reminders and parent campaigns", icon: Megaphone, tags: "communication messages announcements campaigns" },
  { href: "/dashboard/communications/campaigns", title: "Open Campaign Manager", hint: "Parent campaign board", icon: Megaphone, tags: "campaign manager parent messages" },
  { href: "/portal/parent", title: "Open Parent Portal", hint: "Guardian view for fees, results and messages", icon: UsersRound, tags: "parent guardian portal invoices messages" },
  { href: "/portal/student", title: "Open Student Portal", hint: "Student learning progress dashboard", icon: GraduationCap, tags: "student portal progress tasks" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredActions = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return actions;
    return actions.filter((action) => `${action.title} ${action.hint} ${action.tags}`.toLowerCase().includes(value));
  }, [query]);

  return (
    <>
      <button className="command-trigger" type="button" onClick={() => setOpen(true)}>
        <Search size={16} /> Search actions <kbd>⌘K</kbd>
      </button>

      {open ? (
        <div className="command-overlay" role="dialog" aria-modal="true" aria-label="Command palette">
          <button className="command-backdrop" type="button" aria-label="Close command palette" onClick={() => setOpen(false)} />
          <div className="command-modal">
            <div className="command-search-row">
              <Search size={20} />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students, fees, results, attendance..." />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="command-results">
              {filteredActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.href} href={action.href} onClick={() => setOpen(false)}>
                    <span className="command-icon"><Icon size={18} /></span>
                    <span><strong>{action.title}</strong><small>{action.hint}</small></span>
                  </Link>
                );
              })}
              {filteredActions.length === 0 ? <p className="command-empty">No action found. Try “fees”, “students” or “intelligence”.</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
