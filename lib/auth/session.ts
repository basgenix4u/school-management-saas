import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { hasSupabaseConfig } from "@/lib/supabase/server";
import { permissionsByRole, roleLabels, type UserRole } from "@/lib/rbac";

export type AppSession = {
  authenticated: boolean;
  mode: "live" | "product";
  user?: {
    id: string;
    email?: string;
    name?: string;
    role: UserRole;
    roleLabel: string;
    organizationId?: string;
    permissions: string[];
  };
  message?: string;
};

export async function createCookieSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing Supabase public environment variables");

  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies. Middleware handles refresh.
        }
      },
    },
  });
}

export async function getAppSession(): Promise<AppSession> {
  if (!hasSupabaseConfig()) {
    return {
      authenticated: false,
      mode: "product",
      message: "Supabase environment variables are not configured; app is running in configuration mode.",
    };
  }

  const supabase = await createCookieSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { authenticated: false, mode: "live", message: error?.message ?? "No authenticated user" };
  }

  const { data: profile } = await supabase
    .from("app_users")
    .select("id,name,email,role,organization_id")
    .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`)
    .maybeSingle<{ id: string; name: string; email: string; role: UserRole; organization_id: string | null }>();

  const role = profile?.role ?? "SCHOOL_OWNER";

  return {
    authenticated: true,
    mode: "live",
    user: {
      id: profile?.id ?? user.id,
      email: profile?.email ?? user.email ?? undefined,
      name: profile?.name ?? user.email ?? "Authenticated User",
      role,
      roleLabel: roleLabels[role],
      organizationId: profile?.organization_id ?? undefined,
      permissions: permissionsByRole[role],
    },
  };
}
