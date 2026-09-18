import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-guard";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { listRoster } from "@/lib/supabase/school-data";

/**
 * Minimal roster for score entry: admission numbers, names and classes.
 * Narrow by design so result entry never depends on student-management
 * access.
 */
export const GET = withAuth("results.view", async (request) => {
  const supabase = await requestClientOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", students: [], message: "Connect Supabase environment variables to load the roster." });
  }

  try {
    const className = new URL(request.url).searchParams.get("class") ?? undefined;
    const students = await listRoster(supabase, className);
    return NextResponse.json({ status: "ok", source: "supabase", students });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Failed to load roster" }, { status: 500 });
  }
});
