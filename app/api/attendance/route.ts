import { requestClientOrNull } from "@/lib/supabase/request-client";
import { withAuth } from "@/lib/auth/api-guard";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { AttendanceCreateInput, createLiveAttendance, listLiveAttendance, submitAttendanceRegister } from "@/lib/supabase/school-data";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";

const registerSubmitBody = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  period: z.string().trim().min(1).max(40).optional(),
  marks: z.array(z.object({
    admissionNo: z.string().trim().min(1).max(40),
    status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
    note: z.string().trim().max(280).optional(),
  })).min(1).max(500),
});

export const GET = withAuth("attendance.view", async () => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", source: "none", register: [], message: "Connect Supabase environment variables to load attendance." });

  try {
    const register = await listLiveAttendance(supabase);
    return NextResponse.json({ status: "ok", source: "supabase", register });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load attendance" }, { status: 500 });
  }
});

export const POST = withAuth("attendance.mark", async (request: NextRequest, context) => {
  const supabase = await requestClientOrNull();
  if (!supabase) return NextResponse.json({ status: "not_configured", message: "Connect Supabase environment variables before saving attendance." }, { status: 503 });

  const body = await request.json().catch(() => null) as Partial<AttendanceCreateInput> | null;
  if (!body?.admissionNo || !body?.status) return NextResponse.json({ status: "error", message: "admissionNo and status are required." }, { status: 400 });

  try {
    const record = await createLiveAttendance(supabase, body as AttendanceCreateInput, { email: context.user.email, role: context.role });
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

  const parsed = registerSubmitBody.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ status: "error", code: "invalid_register", message: "Send a list of admission numbers with statuses." }, { status: 400 });
  }

  try {
    const result = await submitAttendanceRegister(supabase, parsed.data, { email: context.user.email, role: context.role });
    return NextResponse.json({ status: "saved", source: "supabase", ...result, submittedAt: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to save register" }, { status: 500 });
  }
});
