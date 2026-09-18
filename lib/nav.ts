import { can, type Permission, type UserRole } from "@/lib/rbac";

export type NavItem = {
  href: string;
  label: string;
  icon: string;
  permission: Permission;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

/**
 * Dashboard navigation, filtered by what the role may actually open.
 *
 * Showing every area to every role would hand a teacher twenty choices and
 * several refusals; filtering here keeps each workspace to the handful of
 * destinations its owner can use.
 */
const SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Overview", icon: "home", permission: "analytics.view" },
      { href: "/dashboard/intelligence", label: "Intelligence", icon: "sparkles", permission: "analytics.view" },
      { href: "/dashboard/audit", label: "Audit trail", icon: "history", permission: "audit.view" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/dashboard/students", label: "Students", icon: "users", permission: "students.manage" },
      { href: "/dashboard/teachers", label: "Staff", icon: "briefcase", permission: "teachers.manage" },
      { href: "/dashboard/users", label: "Access & invites", icon: "key", permission: "workspace.manage" },
    ],
  },
  {
    label: "Academics",
    items: [
      { href: "/dashboard/teacher-desk", label: "Teacher desk", icon: "clipboard", permission: "attendance.mark" },
      { href: "/dashboard/attendance", label: "Attendance", icon: "calendar", permission: "attendance.view" },
      { href: "/dashboard/results", label: "Results", icon: "award", permission: "results.view" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/dashboard/fees", label: "Fees & receipts", icon: "receipt", permission: "fees.view" },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/dashboard/setup", label: "School setup", icon: "settings", permission: "workspace.manage" },
      { href: "/dashboard/communications", label: "Communications", icon: "megaphone", permission: "announcements.manage" },
      { href: "/dashboard/onboarding", label: "Launch readiness", icon: "rocket", permission: "workspace.manage" },
    ],
  },
];

export function navForRole(role: UserRole): NavSection[] {
  return SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => can(role, item.permission)),
  })).filter((section) => section.items.length > 0);
}

/**
 * Where a role lands after signing in. Teachers open their desk and portal
 * roles open their portal; sending everyone to the overview would land roles
 * without analytics access on a refusal page.
 */
export function roleHome(role: UserRole): string {
  switch (role) {
    case "TEACHER":
      return "/dashboard/teacher-desk";
    case "PARENT":
      return "/portal/parent";
    case "STUDENT":
      return "/portal/student";
    default:
      return "/dashboard";
  }
}
