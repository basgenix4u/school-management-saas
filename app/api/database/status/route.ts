import { withAuth } from "@/lib/auth/api-guard";
import { NextResponse } from "next/server";
import { hasSupabaseConfig } from "@/lib/supabase/server";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import type { DatabaseHealth } from "@/lib/supabase/types";

const tables = ["organizations", "students", "teachers", "classrooms", "invoices", "attendance_records", "results", "audit_events"];

function projectRefFromEnv(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const host = url.split("://")[1]?.split(".")[0] ?? "";
  return host || "not connected";
}

/**
 * Database health for the caller's school.
 *
 * Counts run through the request client so row level security scopes them
 * to the caller's workspace; a service-role count here would total every
 * school on the platform into one number.
 */
export const GET = withAuth("workspace.manage", async () => {
  const response: DatabaseHealth = {
    configured: hasSupabaseConfig(),
    projectRef: projectRefFromEnv(),
    checkedAt: new Date().toISOString(),
  };

  const supabase = await requestClientOrNull();
  if (!supabase) {
    return NextResponse.json({ ...response, error: "Supabase environment variables are not configured in this runtime." });
  }

  try {
    const counts: Record<string, number> = {};

    for (const table of tables) {
      const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
      if (error) throw error;
      counts[table] = count ?? 0;
    }

    return NextResponse.json({ ...response, tables: counts });
  } catch (error) {
    return NextResponse.json({ ...response, error: error instanceof Error ? error.message : "Unknown Supabase error" }, { status: 500 });
  }
});
