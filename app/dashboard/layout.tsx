import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getAppSession } from "@/lib/auth/session";
import { permissionForPath } from "@/lib/auth/route-permissions";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getPrimaryOrganization } from "@/lib/supabase/school-data";
import { roleHome } from "@/lib/nav";
import { can } from "@/lib/rbac";

/**
 * Authorization boundary for every page under /dashboard.
 *
 * proxy.ts establishes that someone is signed in; it does not know what their
 * role permits. Checking here means a new dashboard page is covered as soon as
 * it is added, rather than depending on each page to guard itself.
 */
export default async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getAppSession();

  if (!session.authenticated || !session.user) {
    redirect("/login?next=/dashboard");
  }

  const pathname = (await headers()).get("x-pathname") ?? "/dashboard";
  const required = permissionForPath(pathname);

  if (required && !can(session.user.role, required)) {
    // A bare entry to the dashboard sends each role to its own home instead
    // of a refusal: teachers to their desk, portal roles to their portal.
    if (pathname === "/dashboard") redirect(roleHome(session.user.role));
    redirect("/dashboard/access?error=permission_denied");
  }

  const supabase = await requestClientOrNull();
  const organization = supabase ? await getPrimaryOrganization(supabase).catch(() => null) : null;

  return (
    <DashboardLayout
      user={{ name: session.user.name ?? "School user", role: session.user.role, roleLabel: session.user.roleLabel }}
      schoolName={organization?.name ?? "Your school"}
    >
      {children}
    </DashboardLayout>
  );
}
