import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/api-guard";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { getAuditSummary, listAuditEvents } from "@/lib/supabase/school-data";

/**
 * Audit trail for the caller's school.
 *
 * `?action=` optionally narrows to comma-separated action prefixes
 * (e.g. `payment,invoice`), letting desks show their own recent activity.
 */
export const GET = withAuth("audit.view", async (request) => {
  const supabase = await requestClientOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", events: [], summary: null, message: "Connect Supabase environment variables to load the audit trail." });
  }

  try {
    const prefixes = new URL(request.url).searchParams.get("action") ?? undefined;
    const [events, summary] = await Promise.all([listAuditEvents(supabase, prefixes), getAuditSummary(supabase)]);
    return NextResponse.json({ status: "ok", source: "supabase", events, summary });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Failed to load audit trail" }, { status: 500 });
  }
});
