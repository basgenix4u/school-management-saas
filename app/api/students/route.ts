import { NextResponse, type NextRequest } from "next/server";
import { withAuth } from "@/lib/auth/api-guard";
import { requestClientOrNull } from "@/lib/supabase/request-client";
import { createLiveStudent, listLiveStudents } from "@/lib/supabase/school-data";
import { invalidInputResponse, readPageParams, studentSchema } from "@/lib/validation";
import { checkRateLimit, rateLimitedResponse, rateLimitKey } from "@/lib/rate-limit";


const NOT_CONFIGURED = "Connect Supabase environment variables to load student records.";

export const GET = withAuth("students.manage", async (request: NextRequest) => {
  const supabase = await requestClientOrNull();
  if (!supabase) {
    return NextResponse.json({
      status: "not_configured",
      source: "none",
      summary: { total: 0, highRisk: 0, withBalance: 0 },
      data: [],
      message: NOT_CONFIGURED,
    });
  }

  try {
    // Rows are filtered by row level security against the caller's school, so
    // no organisation filter is applied here.
    const result = await listLiveStudents(supabase, readPageParams(request));
    return NextResponse.json({ status: "ok", source: "supabase", ...result });
  } catch (error) {
    return NextResponse.json(
      { status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to load students" },
      { status: 500 },
    );
  }
});

export const POST = withAuth("students.manage", async (request: NextRequest, context) => {
  {
    const throttle = checkRateLimit(rateLimitKey(request, "students-create"), { limit: 60, windowMs: 60_000 });
    if (!throttle.allowed) return rateLimitedResponse(throttle.retryAfterMs);
  }
  const supabase = await requestClientOrNull();
  if (!supabase) {
    return NextResponse.json({ status: "not_configured", message: NOT_CONFIGURED }, { status: 503 });
  }

  const parsed = studentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalidInputResponse(parsed);

  try {
    const student = await createLiveStudent(supabase, parsed.data, { email: context.user.email, role: context.role });
    return NextResponse.json({ status: "created", source: "supabase", data: student }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { status: "error", source: "supabase", message: error instanceof Error ? error.message : "Failed to create student" },
      { status: 500 },
    );
  }
});
