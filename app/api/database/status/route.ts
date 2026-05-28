import { NextResponse } from "next/server";
import { createServerSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";
import type { DatabaseHealth } from "@/lib/supabase/types";

const tables = ["organizations", "students", "teachers", "classrooms", "invoices", "attendance_records", "results", "audit_events"];

export async function GET() {
  const response: DatabaseHealth = {
    configured: hasSupabaseConfig(),
    projectRef: "xevoiljsumlqqamqkwla",
    checkedAt: new Date().toISOString(),
  };

  if (!response.configured) {
    return NextResponse.json({ ...response, error: "Supabase environment variables are not configured in this runtime." });
  }

  try {
    const supabase = createServerSupabaseClient();
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
}
