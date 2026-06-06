import Link from "next/link";
import { EduManageLogo } from "@/components/brand/EduManageLogo";
import { CommandPalette } from "@/components/premium/CommandPalette";
import { SessionBadge } from "@/components/auth/SessionBadge";
import { BookOpenCheck, BriefcaseBusiness, BrainCircuit, CalendarCheck, ClipboardCheck, Database, KeyRound, CreditCard, GraduationCap, History, LayoutDashboard, LockKeyhole, Megaphone, Rocket, UsersRound } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { href: "/dashboard/intelligence", label: "Intelligence", icon: BrainCircuit },
  { href: "/dashboard/setup", label: "School Setup", icon: Rocket },
  { href: "/dashboard/onboarding", label: "Onboarding", icon: Rocket },
  { href: "/dashboard/launch", label: "Launch Center", icon: Rocket },
  { href: "/dashboard/database", label: "Database", icon: Database },
  { href: "/dashboard/communications", label: "Communications", icon: Megaphone },
  { href: "/dashboard/access", label: "Access Control", icon: KeyRound },
  { href: "/dashboard/audit", label: "Audit Trail", icon: History },
  { href: "/dashboard/trust", label: "Trust Center", icon: LockKeyhole },
  { href: "/dashboard/students", label: "Students", icon: GraduationCap },
  { href: "/dashboard/teachers", label: "Teachers", icon: UsersRound },
  { href: "/dashboard/teacher-desk", label: "Teacher Desk", icon: BriefcaseBusiness },
  { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/dashboard/attendance/mark", label: "Mark Attendance", icon: ClipboardCheck },
  { href: "/dashboard/results", label: "Results", icon: BookOpenCheck },
  { href: "/dashboard/results/entry", label: "Score Entry", icon: ClipboardCheck },
  { href: "/dashboard/fees", label: "Fees", icon: CreditCard },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell premium-shell">
      <aside className="sidebar premium-sidebar">
        <div className="sidebar-brand sidebar-brand-logo">
          <EduManageLogo href="/dashboard" uploaded />
        </div>
        <nav>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-status">
          <span className="status-dot" />
          <strong>School Workspace</strong>
          <p>Set up your school profile to begin live operations.</p>
        </div>
      </aside>
      <main className="main premium-main"><div className="top-command-row"><SessionBadge /><CommandPalette /></div>{children}</main>
    </div>
  );
}
