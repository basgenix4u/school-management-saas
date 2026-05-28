import Link from "next/link";
import { CommandPalette } from "@/components/premium/CommandPalette";
import { BarChart3, BookOpenCheck, BriefcaseBusiness, BrainCircuit, CalendarCheck, ClipboardCheck, KeyRound, CreditCard, GraduationCap, History, LayoutDashboard, LockKeyhole, Rocket, UsersRound } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
  { href: "/dashboard/intelligence", label: "Intelligence", icon: BrainCircuit },
  { href: "/dashboard/onboarding", label: "Onboarding", icon: Rocket },
  { href: "/dashboard/access", label: "Access Control", icon: KeyRound },
  { href: "/dashboard/audit", label: "Audit Trail", icon: History },
  { href: "/dashboard/trust", label: "Trust Center", icon: LockKeyhole },
  { href: "/dashboard/students", label: "Students", icon: GraduationCap },
  { href: "/dashboard/teachers", label: "Teachers", icon: UsersRound },
  { href: "/dashboard/teacher-desk", label: "Teacher Desk", icon: BriefcaseBusiness },
  { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/dashboard/attendance/mark", label: "Mark Attendance", icon: ClipboardCheck },
  { href: "/dashboard/results", label: "Results", icon: BookOpenCheck },
  { href: "/dashboard/fees", label: "Fees", icon: CreditCard },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell premium-shell">
      <aside className="sidebar premium-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark"><BarChart3 /></div>
          <div>
            <strong>EduManage</strong>
            <span>School OS</span>
          </div>
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
          <strong>Demo Workspace</strong>
          <p>Greenfield International School</p>
        </div>
      </aside>
      <main className="main premium-main"><div className="top-command-row"><CommandPalette /></div>{children}</main>
    </div>
  );
}
