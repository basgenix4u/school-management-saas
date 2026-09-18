import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-guard";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getClassRegister } from "@/lib/supabase/school-data";

/**
 * Live class register for marking: classes, roster and today's saved marks.
 * A separate narrow endpoint keeps the register fast instead of reusing the
 * paginated record history.
 */
export const GET = withAuth("attendance.view", async (request) => {
  const supabase = await requestClientOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables to load the register." }, { status: 503 });
  }

  try {
    const className = new URL(request.url).searchParams.get("class") ?? undefined;
    const register = await getClassRegister(supabase, className);
    return NextResponse.json({ status: "ok", source: "supabase", ...register });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Failed to load register" }, { status: 500 });
  }
});
