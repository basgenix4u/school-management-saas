import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { publishOrUnlockResults, type ResultPublishInput } from "@/lib/supabase/school-data";

export const POST = withAuth("results.manage", async (request: NextRequest, context) => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Database is not configured." }, { status: 503 });
  const body = await request.json().catch(() => null) as Partial<ResultPublishInput> | null;
  if (!body?.admissionNo || !body?.term || !body?.session || !body?.action) {
    return NextResponse.json({ status: "error", message: "admissionNo, term, session and action are required." }, { status: 400 });
  }
  try {
    const result = await publishOrUnlockResults(
      supabase,
      { ...(body as ResultPublishInput), actorEmail: context.user.email },
      { email: context.user.email, role: context.role },
    );
    return NextResponse.json({ status: "ok", result });
  } catch (error) {
    return NextResponse.json({ status: "error", message: error instanceof Error ? error.message : "Unable to update publishing status" }, { status: 500 });
  }
});
