import { redirect } from "next/navigation";
import { getAppSession } from "@/lib/auth/session";
import { can, type Permission } from "@/lib/rbac";

export async function requirePermission(permission: Permission) {
  const session = await getAppSession();
  if (!session.authenticated || !session.user) {
    redirect(`/login?next=${encodeURIComponent("/dashboard")}`);
  }
  if (!can(session.user.role, permission)) {
    redirect("/dashboard/access?error=permission_denied");
  }
  return session;
}

export async function getRoleAwareHome() {
  const session = await getAppSession();
  const role = session.user?.role;
  if (role === "TEACHER") return "/dashboard/teacher-desk";
  if (role === "ACCOUNTANT") return "/dashboard/fees";
  if (role === "PARENT") return "/portal/parent";
  if (role === "STUDENT") return "/portal/student";
  return "/dashboard";
}
