import Link from "next/link";
import { BarChart3, BookOpenCheck, CalendarCheck, CreditCard, GraduationCap, LayoutDashboard, UsersRound } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/students", label: "Students", icon: GraduationCap },
  { href: "/dashboard/teachers", label: "Teachers", icon: UsersRound },
  { href: "/dashboard/attendance", label: "Attendance", icon: CalendarCheck },
  { href: "/dashboard/results", label: "Results", icon: BookOpenCheck },
  { href: "/dashboard/fees", label: "Fees", icon: CreditCard },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "#2563eb", display: "grid", placeItems: "center" }}>
            <BarChart3 />
          </div>
          <div>
            <strong style={{ display: "block", fontSize: 18 }}>EduManage</strong>
            <span style={{ color: "#94a3b8", fontSize: 13 }}>Admin Portal</span>
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
        <div style={{ marginTop: 30, padding: 16, background: "rgba(255,255,255,0.08)", borderRadius: 18 }}>
          <strong>Demo Workspace</strong>
          <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6 }}>Greenfield International School</p>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
