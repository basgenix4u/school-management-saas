import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { createLiveAttendance, filterLinkedRows, listLiveAttendance, submitAttendanceRegister } from "@/lib/supabase/school-data";
import { attendanceBulkSchema, attendanceSingleSchema, invalidInputResponse } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";

export const GET = withAuth("attendance.view", async (_request: NextRequest, context) => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", source: "none", register: [], message: "Connect Supabase environment variables to load attendance." });

  try {
    const rows = await listLiveAttendance(supabase);
    const register = await filterLinkedRows(supabase, context.user.email, context.role, rows);
    return NextResponse.json({ status: "ok", source: "supabase", register });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load attendance" }, { status: 500 });
  }
});

export const POST = withAuth("attendance.mark", async (request: NextRequest, context) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "attendance-single"), { limit: 60, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before saving attendance." }, { status: 503 });

  const parsed = attendanceSingleSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);

  try {
    const record = await createLiveAttendance(supabase, parsed.data, { email: context.user.email, role: context.role });
    return NextResponse.json({ status: "saved", source: "supabase", data: record, submittedAt: new Date().toISOString() }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to save attendance" }, { status: 500 });
  }
});

export const PUT = withAuth("attendance.mark", async (request: NextRequest, context) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "attendance-submit"), { limit: 60, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before saving attendance." }, { status: 503 });

  const parsed = attendanceBulkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return invalidInputResponse(parsed);
  }

  try {
    const result = await submitAttendanceRegister(supabase, parsed.data, { email: context.user.email, role: context.role });
    return NextResponse.json({ status: "saved", source: "supabase", ...result, submittedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to save register" }, { status: 500 });
  }
});
