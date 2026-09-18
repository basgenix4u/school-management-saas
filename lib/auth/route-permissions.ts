import type { Permission } from "@/lib/rbac";

/**
 * Permission required to open each dashboard area.
 *
 * Enforced in app/dashboard/layout.tsx so a new page under /dashboard is
 * covered the moment it is added. Matching is longest-prefix, so a nested route
 * inherits its parent's requirement unless it declares a stricter one.
 */
const ROUTE_PERMISSIONS: ReadonlyArray<readonly [string, Permission]> = [
  ["/dashboard/students", "students.manage"],
  ["/dashboard/teachers", "teachers.manage"],
  ["/dashboard/teacher-desk", "attendance.mark"],
  ["/dashboard/attendance/mark", "attendance.mark"],
  ["/dashboard/attendance", "attendance.view"],
  ["/dashboard/results", "results.view"],
  ["/dashboard/fees", "fees.view"],
  ["/dashboard/receipts", "fees.view"],
  ["/dashboard/communications", "announcements.manage"],
  ["/dashboard/audit", "audit.view"],
  ["/dashboard/intelligence", "analytics.view"],
  ["/dashboard/database", "workspace.manage"],
  ["/dashboard/setup", "workspace.manage"],
  ["/dashboard/users", "workspace.manage"],
  ["/dashboard/onboarding", "workspace.manage"],
  ["/dashboard/trust", "audit.view"],
  ["/dashboard/support-center", "workspace.manage"],
  ["/dashboard", "analytics.view"],
];

/**
 * Areas every signed-in member may open regardless of role. `/dashboard/access`
 * is the page that explains why a permission was refused, so gating it would
 * create a redirect loop.
 */
const ALWAYS_ALLOWED = ["/dashboard/access"];

export function permissionForPath(pathname: string): Permission | null {
  if (ALWAYS_ALLOWED.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return null;
  }

  const match = ROUTE_PERMISSIONS.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return match ? match[1] : null;
}
