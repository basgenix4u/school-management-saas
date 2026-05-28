export type UserRole = "SUPER_ADMIN" | "SCHOOL_OWNER" | "PRINCIPAL" | "TEACHER" | "ACCOUNTANT" | "PARENT" | "STUDENT";

export type Permission =
  | "workspace.manage"
  | "analytics.view"
  | "students.manage"
  | "teachers.manage"
  | "attendance.mark"
  | "attendance.view"
  | "results.manage"
  | "results.view"
  | "fees.manage"
  | "fees.view"
  | "announcements.manage"
  | "portal.view"
  | "audit.view";

export const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: "SaaS Super Admin",
  SCHOOL_OWNER: "School Owner",
  PRINCIPAL: "Principal",
  TEACHER: "Teacher",
  ACCOUNTANT: "Accountant",
  PARENT: "Parent",
  STUDENT: "Student",
};

export const permissionsByRole: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "workspace.manage",
    "analytics.view",
    "students.manage",
    "teachers.manage",
    "attendance.mark",
    "attendance.view",
    "results.manage",
    "results.view",
    "fees.manage",
    "fees.view",
    "announcements.manage",
    "portal.view",
    "audit.view",
  ],
  SCHOOL_OWNER: ["analytics.view", "students.manage", "teachers.manage", "attendance.view", "results.view", "fees.manage", "fees.view", "announcements.manage", "portal.view", "audit.view"],
  PRINCIPAL: ["analytics.view", "students.manage", "teachers.manage", "attendance.view", "results.manage", "results.view", "announcements.manage", "portal.view"],
  TEACHER: ["attendance.mark", "attendance.view", "results.manage", "results.view", "announcements.manage", "portal.view"],
  ACCOUNTANT: ["analytics.view", "fees.manage", "fees.view", "students.manage", "portal.view", "audit.view"],
  PARENT: ["attendance.view", "results.view", "fees.view", "portal.view"],
  STUDENT: ["attendance.view", "results.view", "portal.view"],
};

export const permissionLabels: Record<Permission, string> = {
  "workspace.manage": "Manage SaaS workspace",
  "analytics.view": "View executive analytics",
  "students.manage": "Manage students",
  "teachers.manage": "Manage teachers",
  "attendance.mark": "Mark attendance",
  "attendance.view": "View attendance",
  "results.manage": "Manage results",
  "results.view": "View results",
  "fees.manage": "Manage fees and invoices",
  "fees.view": "View fees and invoices",
  "announcements.manage": "Manage announcements",
  "portal.view": "Access personal portal",
  "audit.view": "View audit trail",
};

export const roleExperiences = [
  {
    role: "SUPER_ADMIN" as UserRole,
    headline: "Operate the SaaS business",
    description: "Manage schools, billing, platform health, support escalations and global audit trails.",
    workspace: "Platform HQ",
    metrics: ["12 schools", "₦42.8M ARR", "99.98% uptime"],
  },
  {
    role: "SCHOOL_OWNER" as UserRole,
    headline: "See the entire school business",
    description: "Revenue, enrollment, parent engagement, staffing and risk signals from one executive view.",
    workspace: "Owner Command Center",
    metrics: ["₦24.8M forecast", "1,248 students", "82% parent engagement"],
  },
  {
    role: "PRINCIPAL" as UserRole,
    headline: "Control academics and operations",
    description: "Academic performance, class attendance, teacher activity and intervention planning.",
    workspace: "Academic Control Room",
    metrics: ["94% attendance", "37 risk signals", "18 active classes"],
  },
  {
    role: "TEACHER" as UserRole,
    headline: "Handle classroom work faster",
    description: "Mark attendance, enter scores, write comments and communicate with class parents.",
    workspace: "Teacher Daily Desk",
    metrics: ["4 classes", "126 students", "12 scores pending"],
  },
  {
    role: "ACCOUNTANT" as UserRole,
    headline: "Manage school finance flow",
    description: "Invoices, payment reconciliation, outstanding balances and finance reports.",
    workspace: "Finance Console",
    metrics: ["₦18.4M collected", "₦6.4M pending", "31 new payments"],
  },
  {
    role: "PARENT" as UserRole,
    headline: "Follow child progress easily",
    description: "View invoices, results, attendance, announcements and school messages from mobile.",
    workspace: "Parent Portal",
    metrics: ["2 children", "1 invoice due", "3 new updates"],
  },
  {
    role: "STUDENT" as UserRole,
    headline: "Track learning progress",
    description: "View attendance, results, assignments and school announcements in a simple portal.",
    workspace: "Student Portal",
    metrics: ["91% average", "94% attendance", "2 announcements"],
  },
];

export function can(role: UserRole, permission: Permission) {
  return permissionsByRole[role]?.includes(permission) ?? false;
}
