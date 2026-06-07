import {
  BookOpenCheck,
  BriefcaseBusiness,
  BrainCircuit,
  CalendarCheck,
  ClipboardCheck,
  CreditCard,
  Database,
  GraduationCap,
  History,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Megaphone,
  Receipt,
  Rocket,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type AppRole = "SUPER_ADMIN" | "SCHOOL_OWNER" | "PRINCIPAL" | "TEACHER" | "ACCOUNTANT" | "PARENT" | "STUDENT";

export type NavItem = {
  href: string;
  label: string;
  title: string;
  hint: string;
  icon: LucideIcon;
  tags: string;
  roles: AppRole[] | "all";
  group: "Core" | "School" | "Academics" | "Finance" | "Communication" | "Security" | "Portals" | "System";
};

const adminRoles: AppRole[] = ["SUPER_ADMIN", "SCHOOL_OWNER", "PRINCIPAL"];
const ownerRoles: AppRole[] = ["SUPER_ADMIN", "SCHOOL_OWNER"];
const academicRoles: AppRole[] = ["SUPER_ADMIN", "SCHOOL_OWNER", "PRINCIPAL", "TEACHER"];
const financeRoles: AppRole[] = ["SUPER_ADMIN", "SCHOOL_OWNER", "ACCOUNTANT"];
const commsRoles: AppRole[] = ["SUPER_ADMIN", "SCHOOL_OWNER", "PRINCIPAL"];

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Command Center", title: "Open Command Center", hint: "Executive overview", icon: LayoutDashboard, tags: "home overview dashboard health", roles: [...adminRoles, "ACCOUNTANT"], group: "Core" },
  { href: "/dashboard/setup", label: "School Setup", title: "Open School Setup", hint: "Create school profile, classes, staff, students and fees", icon: Rocket, tags: "school setup onboarding classes staff students fees", roles: ownerRoles, group: "Core" },
  { href: "/dashboard/users", label: "Users & Invites", title: "Open Users & Invites", hint: "Invite staff, parents and students", icon: UsersRound, tags: "users invites staff parents students roles", roles: adminRoles, group: "Core" },
  { href: "/dashboard/intelligence", label: "Intelligence", title: "Open Intelligence Center", hint: "Insights and decision queue", icon: BrainCircuit, tags: "ai insights risk signals copilot", roles: adminRoles, group: "Core" },

  { href: "/dashboard/students", label: "Students", title: "Manage Students", hint: "Enrollment and guardian records", icon: GraduationCap, tags: "student enrollment guardians", roles: adminRoles, group: "School" },
  { href: "/dashboard/teachers", label: "Teachers", title: "Manage Teachers", hint: "Staff, subjects and classes", icon: UsersRound, tags: "teacher staff subject", roles: adminRoles, group: "School" },
  { href: "/dashboard/teacher-desk", label: "Teacher Desk", title: "Open Teacher Desk", hint: "Daily teaching workspace and lesson flow", icon: BriefcaseBusiness, tags: "teacher desk daily lesson workspace", roles: ["TEACHER", ...adminRoles], group: "School" },
  { href: "/dashboard/attendance", label: "Attendance", title: "View Attendance", hint: "Daily attendance overview", icon: CalendarCheck, tags: "attendance class register", roles: academicRoles, group: "School" },
  { href: "/dashboard/attendance/mark", label: "Mark Attendance", title: "Mark Attendance", hint: "Smart attendance register", icon: ClipboardCheck, tags: "mark attendance present absent late excused", roles: ["TEACHER", ...adminRoles], group: "School" },

  { href: "/dashboard/results", label: "Results", title: "Open Results", hint: "Scores and report cards", icon: BookOpenCheck, tags: "result scores report card", roles: academicRoles, group: "Academics" },
  { href: "/dashboard/results/entry", label: "Score Entry", title: "Enter Scores", hint: "Score entry matrix", icon: ClipboardCheck, tags: "score entry ca exam grade", roles: ["TEACHER", ...adminRoles], group: "Academics" },
  { href: "/dashboard/results/publish", label: "Publish Results", title: "Publish Results", hint: "Publish and lock official report cards", icon: LockKeyhole, tags: "publish results lock report card", roles: adminRoles, group: "Academics" },

  { href: "/dashboard/fees", label: "Fees", title: "Open Finance Command Center", hint: "Fees, payments and finance intelligence", icon: CreditCard, tags: "fees payment invoices finance", roles: financeRoles, group: "Finance" },
  { href: "/dashboard/fees/invoices", label: "Invoices", title: "Open Invoice Board", hint: "All invoices and payment probabilities", icon: Receipt, tags: "invoice board balances collection", roles: financeRoles, group: "Finance" },

  { href: "/dashboard/communications", label: "Communications", title: "Open Communication Center", hint: "Announcements, reminders and parent campaigns", icon: Megaphone, tags: "communication messages announcements campaigns", roles: commsRoles, group: "Communication" },
  { href: "/dashboard/communications/campaigns", label: "Campaigns", title: "Open Campaign Manager", hint: "Parent campaign board", icon: Megaphone, tags: "campaign manager parent messages", roles: commsRoles, group: "Communication" },

  { href: "/dashboard/access", label: "Access Control", title: "Open Access Control", hint: "Roles, permissions and access matrix", icon: KeyRound, tags: "auth access roles permissions", roles: ownerRoles, group: "Security" },
  { href: "/dashboard/audit", label: "Audit Trail", title: "Open Audit Trail", hint: "Trace sensitive actions and risk events", icon: History, tags: "audit logs security events", roles: ownerRoles, group: "Security" },
  { href: "/dashboard/trust", label: "Trust Center", title: "Open Trust Center", hint: "Security controls and readiness", icon: LockKeyhole, tags: "trust security compliance privacy", roles: ownerRoles, group: "Security" },

  { href: "/portal/parent", label: "Parent Portal", title: "Open Parent Portal", hint: "Guardian view for fees, results and messages", icon: UsersRound, tags: "parent guardian portal invoices messages", roles: ["PARENT"], group: "Portals" },
  { href: "/portal/student", label: "Student Portal", title: "Open Student Portal", hint: "Student learning progress dashboard", icon: GraduationCap, tags: "student portal progress tasks", roles: ["STUDENT"], group: "Portals" },

  { href: "/dashboard/database", label: "Database", title: "Open Database Control Room", hint: "Database health and live data views", icon: Database, tags: "database health live data", roles: ownerRoles, group: "System" },
  { href: "/dashboard/launch", label: "Launch Center", title: "Open Launch Center", hint: "Production readiness and product checklist", icon: Rocket, tags: "launch production deployment readiness", roles: ownerRoles, group: "System" },
];

export function canSeeItem(item: NavItem, role?: string) {
  if (item.roles === "all") return true;
  if (!role) return item.roles.includes("SCHOOL_OWNER");
  return item.roles.includes(role as AppRole);
}

export function roleHome(role?: string) {
  if (role === "TEACHER") return "/dashboard/teacher-desk";
  if (role === "ACCOUNTANT") return "/dashboard/fees";
  if (role === "PARENT") return "/portal/parent";
  if (role === "STUDENT") return "/portal/student";
  return "/dashboard";
}
