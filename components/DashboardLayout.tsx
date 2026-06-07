import { CommandPalette } from "@/components/premium/CommandPalette";
import { SessionBadge } from "@/components/auth/SessionBadge";
import { DashboardNavigation } from "@/components/navigation/DashboardNavigation";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-shell premium-shell role-aware-shell">
      <DashboardNavigation />
      <main className="main premium-main"><div className="top-command-row"><SessionBadge /><CommandPalette /></div>{children}</main>
    </div>
  );
}
